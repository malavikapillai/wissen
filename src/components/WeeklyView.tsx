'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar as CalendarIcon, MapPin, Users, Armchair } from 'lucide-react';

export default function WeeklyView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weekly-view?weekStart=${format(weekStart, 'yyyy-MM-dd')}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [weekStart]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Aggregating weekly report...</p>
      </div>
    );
  }

  const days = Object.keys(data.bookings || {}).sort();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="h-1 bg-slate-900 w-12" />
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Weekly Allocation</h2>
          </div>
          <p className="text-xl text-slate-400 font-medium italic">Strategic overview of team presence and office occupancy</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-xl shadow-slate-200/50">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <CalendarIcon className="h-5 w-5 text-slate-400" />
          </Button>
          <div className="px-6 py-2 text-sm font-black text-slate-900 uppercase tracking-widest border-x-2 border-slate-50">
            {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd')}
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <CalendarIcon className="h-5 w-5 text-slate-400 rotate-180" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {days.map((dateStr, idx) => {
          const bookings = data.bookings[dateStr] || [];
          const date = new Date(dateStr);
          const isToday = isSameDay(date, new Date());
          const occupancy = bookings.length;
          const percentage = (occupancy / 50) * 100;

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:shadow-blue-200/50 group ${isToday ? 'ring-4 ring-blue-500 ring-offset-8' : ''}`}>
                <CardHeader className="p-10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                        {format(date, 'EEEE')}
                        <span className="text-blue-600 ml-4 not-italic font-black opacity-30 group-hover:opacity-100 transition-opacity">{format(date, 'MMM dd')}</span>
                      </CardTitle>
                      {isToday && (
                        <Badge className="bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] font-black italic shadow-lg shadow-slate-200">
                          Active Today
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <Armchair className="h-4 w-4 text-blue-500" strokeWidth={3} />
                        <span className="text-slate-900">{occupancy}</span> / 50 Utilization
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <Users className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                        <span className="text-slate-900">{new Set(bookings.map((b:any) => b.employees?.squads?.name)).size}</span> Squad Presence
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`text-6xl font-black italic tracking-tighter leading-none ${percentage > 80 ? 'text-red-500' : percentage > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {Math.round(percentage)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-300 font-black mt-2">Capacity Utilization</div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                  <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden mb-10 shadow-inner p-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }}
                      className={`h-full rounded-full shadow-lg ${percentage > 80 ? 'bg-gradient-to-r from-red-500 to-rose-600' : percentage > 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} 
                    />
                  </div>

                  {bookings.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] whitespace-nowrap">Strategic Presence</span>
                        <div className="h-px w-full bg-slate-100" />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {Array.from(new Set(bookings.map((b:any) => b.employees?.squads?.name))).map((squad: any) => {
                          const squadCount = bookings.filter((b:any) => b.employees?.squads?.name === squad).length;
                          return (
                            <Badge key={squad} variant="outline" className="py-3 px-6 bg-white border-2 border-slate-100 rounded-[1.25rem] text-slate-900 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 cursor-default group/badge">
                              <span className="font-black italic uppercase tracking-tight text-sm mr-4">{squad}</span>
                              <span className="px-3 py-1 bg-slate-900 rounded-lg text-white text-[10px] font-black group-hover/badge:bg-blue-600 transition-colors shadow-lg shadow-slate-200">
                                {squadCount}
                              </span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 group-hover:bg-white transition-colors">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Operational Vacuum</p>
                      <p className="text-slate-300 text-sm mt-2 font-medium">No strategic deployments found for this cycle.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
