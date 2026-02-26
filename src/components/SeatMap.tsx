'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Armchair, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SeatMap({ user, date }: { user: any; date: string }) {
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
  }, [date]);

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
      const designatedCount = seats.filter((s: any) => s.type === 'DESIGNATED' && s.canBook && !s.isBooked).length;
      const floatingCount = seats.filter((s: any) => s.type === 'BUFFER' && s.canBook && !s.isBooked).length;

      return (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                {data.isBatchDay ? 'Your Batch Day' : 'Floating Day'}
              </h3>
              <p className="text-sm text-slate-500">
                {data.isBatchDay 
                  ? `You can book any of the 40 designated seats today.` 
                  : `You can only book from the 10 buffer seats today.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                {availableCount} Available Spots
              </Badge>
            </div>
          </div>

          {/* Legend */}

        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <CardContent className="p-4 flex flex-wrap items-center justify-center gap-6">
              <LegendItem color="bg-green-600" label="Available (Designated)" />
              <LegendItem color="bg-amber-100 border border-amber-200" label="Available (Floating)" />
              <LegendItem color="bg-blue-600" label="My Seat" />
              <LegendItem color="bg-red-100 border border-red-200" label="Booked" />
              <LegendItem color="bg-slate-100 opacity-40 border border-slate-200" label="Restricted" />
            </CardContent>

        </Card>

        {/* Seat Grid */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100"></div>
          <div className="mb-12 flex justify-center">
            <div className="w-1/2 h-4 bg-slate-100 rounded-b-full flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Front of Office / Screen Area
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-4 md:gap-6 max-w-4xl mx-auto">
            {seats.map((seat: any, idx: number) => {
              const isMySeat = seat.isMySeat;
              const isBooked = seat.isBooked && !isMySeat;
              const isFloating = seat.type === 'BUFFER';
              
              let statusColor = 'bg-slate-100 text-slate-400 opacity-40'; // Default Restricted
              
              if (isMySeat) {
                statusColor = 'bg-blue-600 text-white shadow-lg shadow-blue-200';
              } else if (isBooked) {
                statusColor = 'bg-red-100 text-red-500 opacity-60';
              } else if (seat.canBook) {
                statusColor = isFloating 
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-200' 
                  : 'bg-green-600 text-white shadow-lg shadow-green-100 hover:bg-green-700';
              }

              return (
                <motion.button
                  key={seat.id}
                  whileHover={!isBooked && !isMySeat && seat.canBook ? { scale: 1.1 } : {}}
                  whileTap={!isBooked && !isMySeat && seat.canBook ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (isMySeat) handleRelease(myBooking.id);
                    else if (!isBooked && seat.canBook) handleBook(seat);
                    else if (!isBooked && !seat.canBook) toast.info(getBookingRestriction(seat, data));
                  }}
                  disabled={bookingInProgress}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 aspect-square ${statusColor} ${!seat.canBook && !isBooked && !isMySeat ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Armchair className="h-6 w-6 md:h-8 md:w-8" />
                  <span className="text-[10px] md:text-xs font-bold mt-1">{seat.seat_number}</span>
                  {isMySeat && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

        {/* Divider for Buffer seats */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100"></div>
          <Badge variant="secondary" className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Buffer Zone (Seats 41-50)
          </Badge>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>
      </div>

      {myBooking && (
        <Card className="bg-blue-50 border-blue-100 border-2 shadow-none overflow-hidden animate-in slide-in-from-bottom-4">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl text-white">
                <Armchair className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Your Booking Secured!</h4>
                <p className="text-blue-700 text-sm">Seat {seats.find((s:any) => s.id === myBooking.seat_id)?.seat_number} • {format(new Date(date), 'MMMM d')}</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="rounded-xl shadow-lg shadow-red-100"
              onClick={() => handleRelease(myBooking.id)}
              disabled={bookingInProgress}
            >
              Release Seat
            </Button>
          </CardContent>
        </Card>
      )}

      {!myBooking && !data.isBatchDay && !data.canBookFloating && (
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
          <Info className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-amber-900">Floating Booking Restriction</h5>
            <p className="text-amber-800 text-sm leading-relaxed">
              Today is not your designated batch day. You can book floating seats for this date only after 3:00 PM on the previous day.
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
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}

function getBookingRestriction(seat: any, data: any) {
  if (seat.type === 'BUFFER') {
    if (data.isBatchDay) {
      return 'Today is your batch day. Please book from the 40 designated seats.';
    }
    return 'Floating seats can only be booked after 3 PM previous day.';
  }
  if (seat.type === 'DESIGNATED') {
    if (data.isBatchDay) {
      return 'This seat is already booked.';
    }
    return 'Not your batch day. You can only book from the 10 buffer seats today.';
  }
  return 'Booking restricted.';
}
