'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Weekly Allocation</h2>
          <p className="text-slate-500">Overview of office occupancy and team presence</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            Prev Week
          </Button>
          <div className="px-4 py-1 text-sm font-bold text-slate-700">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Next Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {days.map((dateStr) => {
          const bookings = data.bookings[dateStr] || [];
          const date = new Date(dateStr);
          const isToday = isSameDay(date, new Date());
          const occupancy = bookings.length;
          const percentage = (occupancy / 50) * 100;

          return (
            <Card key={dateStr} className={`border-none shadow-sm transition-all duration-300 hover:shadow-md ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {format(date, 'EEEE, MMM d')}
                    {isToday && <Badge className="ml-3 bg-blue-600 text-white rounded-full uppercase tracking-widest text-[10px]">Today</Badge>}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Armchair className="h-4 w-4" /> {occupancy} / 50 seats
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="h-4 w-4" /> {new Set(bookings.map((b:any) => b.employees?.squads?.name)).size} squads present
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${percentage > 80 ? 'text-red-600' : percentage > 50 ? 'text-amber-600' : 'text-green-600'}`}>
                    {Math.round(percentage)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Occupancy</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-6 border border-slate-100">
                  <div 
                    className={`h-full transition-all duration-1000 ${percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-400' : 'bg-green-500'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Presence</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(bookings.map((b:any) => b.employees?.squads?.name))).map((squad: any) => {
                        const squadCount = bookings.filter((b:any) => b.employees?.squads?.name === squad).length;
                        return (
                          <Badge key={squad} variant="outline" className="py-1 px-3 bg-white border-slate-200 rounded-xl text-slate-700 shadow-sm hover:border-blue-300 transition-colors">
                            {squad} <span className="ml-2 px-1.5 bg-slate-100 rounded-md text-slate-400 text-[10px] font-bold">{squadCount}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                    <p className="text-sm text-slate-400 font-medium">No bookings yet for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
