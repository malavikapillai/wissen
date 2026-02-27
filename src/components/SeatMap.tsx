'use client';

import React, { useState, useEffect } from 'react';
import { format, isAfter, setHours, setMinutes, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Armchair, Info, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function SeatMap({ user, date, currentUser }: { user: any; date: string; currentUser?: any }) {
  const effectiveUser = currentUser || user;
  const isAdmin = effectiveUser.role === 'ADMIN' || user.isAdmin;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${date}&employeeId=${user.id}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [date, user.id]);

  const handleBook = async (seat: any) => {
    setBookingInProgress(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: user.id,
            seatId: seat.id,
            date,
            type: seat.type === 'BUFFER' ? 'FLOATING' : 'DESIGNATED',
            isAdmin: isAdmin,
          }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success('Seat booked successfully!');
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleRelease = async (bookingId: string) => {
    setBookingInProgress(true);
    try {
      const res = await fetch('/api/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success('Seat released');
      fetchAvailability();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Scanning office floor...</p>
      </div>
    );
  }

      const seats = data.seats || [];
      const myBooking = data.myBooking;

        const availableCount = seats.filter((s: any) => s.canBook && !s.isBooked).length;
        
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity">
            <Armchair className="w-32 h-32 rotate-12" />
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${data.isBatchDay ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                {data.isBatchDay ? 'Your Batch Day' : 'Floating Day'}
              </h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
              {data.isBatchDay 
                ? `Priority access enabled. You can book any of the 40 designated seats for your squad today.` 
                : `Buffer mode active. Only the 10 designated floating seats are available for booking.`}
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{availableCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Spots Left</span>
            </div>
            <div className="h-12 w-px bg-slate-100 dark:bg-slate-800"></div>
            <Badge variant="secondary" className="bg-slate-900 dark:bg-blue-600 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-slate-200 dark:shadow-blue-900/20 border-none">
              {data.isBatchDay ? 'Priority' : 'General'}
            </Badge>
          </div>
        </div>

      <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800 shadow-none rounded-[1.5rem] overflow-hidden">
        <CardContent className="p-5 flex flex-wrap items-center justify-center gap-8">
            <LegendItem color="bg-emerald-500" label="Available" />
            <LegendItem color="bg-amber-500" label="Floating" />
            <LegendItem color="bg-blue-600 shadow-md shadow-blue-200 dark:shadow-none" label="My Booking" />
            <LegendItem color="bg-slate-200 dark:bg-slate-700" label="Occupied" />
            <LegendItem color="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-40" label="Restricted" />
          </CardContent>
      </Card>


          {/* Seat Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-none relative overflow-hidden">
            {/* Architectural Elements */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent"></div>
            
            <div className="mb-16 flex flex-col items-center gap-4">
              <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-black">
                Collaborative Screen Area
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-5 md:gap-8 max-w-5xl mx-auto">
              <TooltipProvider>
                {seats.map((seat: any, idx: number) => {
                  const isMySeat = seat.isMySeat;
                  const isBooked = seat.isBooked && !isMySeat;
                  const isFloating = seat.type === 'BUFFER';
                  
                  let statusColor = 'bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 opacity-30'; // Default Restricted
                  
                  if (isMySeat) {
                    statusColor = 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none ring-4 ring-blue-50 dark:ring-blue-900/30';
                    } else if (isBooked) {
                      statusColor = effectiveUser.role === 'ADMIN' 
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-red-500 hover:text-white group' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700';
                    } else if (seat.canBook) {
                    statusColor = isFloating 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 dark:shadow-none hover:bg-amber-600 hover:shadow-amber-200 dark:hover:shadow-none' 
                      : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 hover:shadow-emerald-200 dark:hover:shadow-none';
                  }

                  return (
                    <Tooltip key={seat.id} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.01 }}
                          whileHover={(!isBooked && !isMySeat && seat.canBook) || (isBooked && effectiveUser.role === 'ADMIN') ? { scale: 1.15, rotate: [0, -2, 2, 0] } : {}}
                          whileTap={(!isBooked && !isMySeat && seat.canBook) || (isBooked && effectiveUser.role === 'ADMIN') ? { scale: 0.9 } : {}}
                          onClick={() => {
                            if (isMySeat) {
                              handleRelease(myBooking.id);
                            } else if (isBooked && effectiveUser.role === 'ADMIN') {
                              // Admin can release any seat after 10 AM
                              const now = new Date();
                              const releaseLimit = setMinutes(setHours(startOfDay(now), 10), 0);
                              if (!isAfter(now, releaseLimit)) {
                                toast.error('Admins can only release seats after 10:00 AM if associates are not available.');
                                return;
                              }
                              if (seat.bookingId) handleRelease(seat.bookingId);
                            } else if (!isBooked && seat.canBook) {
                              handleBook(seat);
                            } else if (!isBooked && !seat.canBook) {
                              toast.info(getBookingRestriction(seat, data));
                            }
                          }}
                          disabled={bookingInProgress}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 aspect-square ${statusColor} ${(!seat.canBook && !isBooked && !isMySeat) && effectiveUser.role !== 'ADMIN' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="relative">
                            <Armchair className={`${isMySeat ? 'h-7 w-7 md:h-9 md:w-9' : 'h-6 w-6 md:h-8 md:w-8'} ${isBooked && effectiveUser.role === 'ADMIN' ? 'group-hover:opacity-0' : ''}`} strokeWidth={isMySeat ? 2.5 : 2} />
                            {isBooked && effectiveUser.role === 'ADMIN' && (
                              <Trash2 className="absolute inset-0 h-6 w-6 md:h-8 md:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <span className={`text-[10px] md:text-xs font-black mt-1.5 ${isMySeat || (isBooked && effectiveUser.role === 'ADMIN' ) ? 'group-hover:text-white' : ''}`}>
                            {seat.seat_number}
                          </span>
                          
                          {isMySeat && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white items-center justify-center text-[8px] font-bold shadow-sm">
                                YOU
                              </span>
                            </span>
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      {(isBooked || isMySeat) && (
                        <TooltipContent className="p-0 border-none bg-transparent shadow-none" side="top">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-700 flex flex-col gap-3 min-w-[200px]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {isMySeat ? 'My Booking' : 'Booked By'}
                                </p>
                                  <p className="font-black text-sm">
                                    {isMySeat ? user.name : seat.booker?.name}
                                  </p>
                              </div>
                            </div>
                            
                            <div className="h-px bg-slate-800 dark:bg-slate-700 w-full"></div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Squad</p>
                                <p className="text-[11px] font-bold text-blue-400 truncate">
                                  {isMySeat ? user.squads?.name : seat.booker?.squad}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Batch</p>
                                <p className="text-[11px] font-bold text-slate-300 truncate">
                                  {isMySeat ? user.squads?.batches?.name : seat.booker?.batch}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>

            {/* Buffer Zone Visual Divider */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center">
                <Badge variant="secondary" className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 px-6 py-1.5 rounded-full font-black uppercase tracking-[0.3em] text-[10px]">
                  Buffer Zone
                </Badge>
              </div>
            </div>
          </div>
  
          {myBooking && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 dark:bg-blue-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-900/20"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-blue-600 dark:bg-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-500/40 dark:shadow-none rotate-3">
                  <Armchair className="h-8 w-8 text-white dark:text-blue-600" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black italic uppercase tracking-tight">Booking Confirmed</h4>
                  <div className="flex items-center gap-3 text-blue-200/80 font-medium">
                    <span className="bg-blue-600/30 dark:bg-white/20 px-3 py-1 rounded-lg text-xs text-blue-300 dark:text-white">Seat {seats.find((s:any) => s.id === myBooking.seat_id)?.seat_number}</span>
                    <span className="h-1 w-1 rounded-full bg-blue-600 dark:bg-white"></span>
                    <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl px-8 h-12 font-bold transition-all"
                onClick={() => handleRelease(myBooking.id)}
                disabled={bookingInProgress}
              >
                Release Seat
              </Button>
            </motion.div>
          )}
  
        {!myBooking && !data.isBatchDay && !data.canBookFloating && (
          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
            <Info className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-amber-900 dark:text-amber-400">Floating Booking Restriction</h5>
                <p className="text-amber-800 dark:text-amber-500 text-sm leading-relaxed">
                  Today is not your designated batch day. You can book floating seats for this date only after 11:00 AM on the previous working day (Friday 11:00 AM for Monday bookings).
                </p>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  function LegendItem({ color, label }: { color: string; label: string }) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-4 w-4 rounded-full ${color}`}></div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
      </div>
    );
  }


function getBookingRestriction(seat: any, data: any) {
  if (seat.type === 'BUFFER') {
    if (data.isBatchDay) {
      return 'Today is your batch day. Please book from the 40 designated seats.';
    }
    return 'Floating seats can only be booked after 11 AM of the previous working day.';
  }
  if (seat.type === 'DESIGNATED') {
    if (data.isBatchDay) {
      return 'This seat is already booked.';
    }
    return 'Not your batch day. You can only book from the 10 buffer seats today.';
  }
  return 'Booking restricted.';
}
