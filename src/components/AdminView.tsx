import React, { useState, useEffect } from 'react';
import { format, isAfter, setHours, setMinutes, startOfDay } from 'date-fns';
import { 
  Users, 
  Trash2, 
  Loader2, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Armchair,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminView({ user: adminUser }: { user: any }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [empRes, bookRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(`/api/availability?date=${format(selectedDate, 'yyyy-MM-dd')}&employeeId=${adminUser.id}`)
      ]);
      
      const empData = await empRes.json();
      const bookData = await bookRes.json();
      
      if (empData.error) throw new Error(empData.error);
      if (bookData.error) throw new Error(bookData.error);

      // Extract all booked seats for the day from processed seats
      const allBookings = (bookData.seats || [])
        .filter((s: any) => s.isBooked)
        .map((s: any) => ({
          id: s.bookingId,
          seatNumber: s.seat_number,
          booker: s.booker
        }));
      setBookings(allBookings);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load administrative data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedDate]);

  const handleRelease = async (bookingId: string) => {
    // Only allow release after 10 AM (as per requirement) unless it's a forced override
    const now = new Date();
    const releaseLimit = setMinutes(setHours(startOfDay(now), 10), 0);
    
    if (!isAfter(now, releaseLimit)) {
      toast.error('Seats can only be released after 10:00 AM if associates are not available.');
      return;
    }

    try {
      const res = await fetch('/api/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success('Seat released successfully');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.booker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.booker.squad.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.seatNumber.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-600 text-[10px] font-black text-white uppercase tracking-[0.3em] rounded-lg rotate-2">Admin Control</span>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Command Center</h1>
          </div>
          <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">
            Authorized oversight for <span className="text-slate-900 dark:text-white font-black italic uppercase tracking-tight">Wissen Workspace</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-1 bg-red-600 w-12" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Daily Occupancy Audit</h3>
            </div>
            
            <div className="flex items-center gap-4 flex-1 md:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filter by name, squad, or seat..."
                  className="pl-11 h-12 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs uppercase tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {format(selectedDate, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 group hover:border-red-500 dark:hover:border-red-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl dark:hover:shadow-none">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white">
                      <Armchair className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1 bg-slate-50 dark:bg-slate-800 border-none">
                      Station {booking.seatNumber}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">{booking.booker.name}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">{booking.booker.squad} • {booking.booker.batch}</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full h-12 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                    onClick={() => handleRelease(booking.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Force Release
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-16 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">No active bookings found for this session</p>
            </div>
          )}
        </section>

        <section className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/30 rounded-[2rem] p-8 flex items-start gap-6">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-amber-900 dark:text-amber-400 uppercase italic">Release Protocol</h4>
            <p className="text-amber-800 dark:text-amber-600 text-sm font-medium leading-relaxed">
              As per system policy, administrators are authorized to release booked seats after **10:00 AM** if the associate has not reported to the workspace. This ensures maximum floor utilization and provides opportunities for floating associates.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
