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
import SeatMap from './SeatMap';

export default function AdminView({ user: adminUser }: { user: any }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'manage' | 'book'>('manage');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [empRes, bookRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(`/api/availability?date=${format(selectedDate, 'yyyy-MM-dd')}&employeeId=${adminUser.id}`)
      ]);
      
      const empData = await empRes.json();
      const bookData = await bookRes.json();
      
      setEmployees(Array.isArray(empData) ? empData : []);
      // Extract all booked seats for the day
      const allBookings = (bookData.seats || [])
        .filter((s: any) => s.isBooked)
        .map((s: any) => ({
          id: s.bookingId,
          seatNumber: s.seat_number,
          booker: s.booker
        }));
      setBookings(allBookings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load administrative data');
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

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="flex gap-4">
          <Button 
            variant={viewMode === 'manage' ? 'default' : 'outline'}
            onClick={() => setViewMode('manage')}
            className={`rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs transition-all ${viewMode === 'manage' ? 'bg-slate-900 dark:bg-blue-600' : 'border-2'}`}
          >
            Manage Bookings
          </Button>
          <Button 
            variant={viewMode === 'book' ? 'default' : 'outline'}
            onClick={() => setViewMode('book')}
            className={`rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs transition-all ${viewMode === 'book' ? 'bg-slate-900 dark:bg-blue-600' : 'border-2'}`}
          >
            Bulk Booking
          </Button>
        </div>
      </header>

      {viewMode === 'manage' ? (
        <div className="grid grid-cols-1 gap-12">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-1 bg-red-600 w-12" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Daily Occupancy Audit</h3>
              </div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {format(selectedDate, 'EEEE, MMM dd, yyyy')}
              </div>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Employee Selector */}
          <div className="lg:col-span-4 space-y-6">
             <div className="flex items-center gap-4">
                <div className="h-1 bg-blue-600 w-12" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Select Associate</h3>
              </div>
              
              <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search name or email..."
                      className="pl-11 h-12 rounded-xl border-none bg-slate-50 dark:bg-slate-800 font-bold text-xs uppercase tracking-widest"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[500px] overflow-auto">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`w-full p-6 text-left border-b border-slate-50 dark:border-slate-800 transition-all flex items-center gap-4 ${selectedEmployee?.id === emp.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedEmployee?.id === emp.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {emp.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm uppercase italic truncate ${selectedEmployee?.id === emp.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                          {emp.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {emp.squads?.name}
                        </p>
                      </div>
                      {selectedEmployee?.id === emp.id && <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </CardContent>
              </Card>
          </div>

          {/* Seat Selector */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-1 bg-emerald-600 w-12" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Deploy to Station</h3>
                </div>
                {selectedEmployee && (
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Booking for {selectedEmployee.name.split(' ')[0]}
                  </Badge>
                )}
              </div>

              {selectedEmployee ? (
                <div className="animate-in fade-in duration-500">
                    <SeatMap 
                      user={selectedEmployee} 
                      date={format(selectedDate, 'yyyy-MM-dd')} 
                      currentUser={adminUser}
                    />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-20 text-center flex flex-col items-center justify-center gap-6">
                   <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600">
                    <UserPlus className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic">Selection Required</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">Select an associate from the left panel to begin deployment</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
