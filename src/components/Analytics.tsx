'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Office Insights</h2>
        <p className="text-slate-500">Deep dive into office utilization and squad behavior</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Squad Presence</CardTitle>
                <CardDescription>Distribution of bookings by squad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={squadData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {squadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Top Occupied Seats</CardTitle>
                <CardDescription>Most frequently booked spots</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seatUsageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="id" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Seat ID', position: 'insideBottom', offset: -5, fontSize: 10 }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
        <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Office Efficiency Score</h3>
            <p className="text-slate-400 max-w-md">
              Based on the last 30 days of booking patterns, your office is currently operating at an average of <span className="text-white font-bold">{Math.round(data.avgUtilization)}%</span> capacity.
            </p>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-black">{data.totalBookings}</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total Sessions</span>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-black">50</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Max Capacity</span>
              </div>
            </div>
          </div>
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="stroke-slate-800"
                strokeDasharray="100, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
              />
              <path
                className="stroke-blue-500"
                strokeDasharray={`${data.avgUtilization}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
              {Math.round(data.avgUtilization)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
