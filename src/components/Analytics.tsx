'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, Armchair, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch('/api/analytics')
        .then(res => res.json())
        .then(json => {
          if (json.error) {
            console.error('Analytics API error:', json.error);
            setData(null);
          } else {
            setData(json);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, []);
  
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Crunching data...</p>
        </div>
      );
    }
  
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <TrendingUp className="h-8 w-8 text-slate-300" />
          <p className="text-slate-500 font-medium">No analytics data available</p>
        </div>
      );
    }

  const squadData = Object.entries(data.squadPresence || {}).map(([name, value]) => ({ name, value }));
  const seatUsageData = Object.entries(data.seatUsage || {})
    .map(([id, value]: [any, any]) => ({ id, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="h-1 bg-slate-900 w-12" />
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Office Insights</h2>
          </div>
          <p className="text-xl text-slate-400 font-medium italic">Data-driven analysis of workspace dynamics and squad behavior</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-600 text-white px-6 py-2 rounded-full uppercase tracking-widest text-[10px] font-black shadow-xl shadow-blue-200">Live Telemetry</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
          <CardHeader className="p-10 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 rounded-[1.25rem] text-blue-400 shadow-lg rotate-2 group-hover:rotate-0 transition-transform">
                <Users className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Squad Dynamics</CardTitle>
                <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Booking weight distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={squadData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {squadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
          <CardHeader className="p-10 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 rounded-[1.25rem] text-amber-400 shadow-lg -rotate-2 group-hover:rotate-0 transition-transform">
                <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Hot Zones</CardTitle>
                <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">High-frequency workstation IDs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seatUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="id" 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-900/20 bg-slate-900 text-white rounded-[4rem] overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
          <PieChartIcon className="h-64 w-64" />
        </div>
        <CardContent className="p-16 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Assessment</span>
              <h3 className="text-5xl font-black italic uppercase tracking-tighter">Office Efficiency Score</h3>
            </div>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl italic">
              Empirical analysis of the last 30 operational cycles indicates that the workspace is currently optimized at <span className="text-white font-black">{Math.round(data.avgUtilization)}%</span> of theoretical peak capacity.
            </p>
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="text-5xl font-black tracking-tighter italic">{data.totalBookings}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-black mt-1">Active Sessions</span>
              </div>
              <div className="w-px h-16 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-5xl font-black tracking-tighter italic">50</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-black mt-1">Designated Nodes</span>
              </div>
            </div>
          </div>
          <div className="relative h-64 w-64 flex items-center justify-center group/gauge">
            <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
              <path
                className="stroke-white/5"
                strokeDasharray="100, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="2.5"
              />
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${data.avgUtilization}, 100` }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="stroke-blue-500"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black italic tracking-tighter group-hover/gauge:scale-110 transition-transform">{Math.round(data.avgUtilization)}%</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Efficiency</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
