'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { 
  Calendar, 
  LayoutDashboard, 
  Map as MapIcon, 
  TrendingUp, 
  LogOut, 
  User, 
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Armchair,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import SeatMap from '@/components/SeatMap';
import WeeklyView from '@/components/WeeklyView';
import Analytics from '@/components/Analytics';

export default function SeatBookingApp() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [squads, setSquads] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', squadId: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('seat_booking_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Ensure user has required squad data, otherwise clear session
        if (parsed && parsed.id && parsed.squads && parsed.squads.batches) {
          setUser(parsed);
        } else {
          console.warn('Stale user session detected, clearing...');
          localStorage.removeItem('seat_booking_user');
        }
      } catch (e) {
        localStorage.removeItem('seat_booking_user');
      }
    }
  }, []);

  useEffect(() => {
    if (isRegistering && squads.length === 0) {
      fetchSquads();
    }
  }, [isRegistering]);

    const fetchSquads = async () => {
      try {
        const res = await fetch('/api/auth/squads');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (Array.isArray(data)) {
          setSquads(data);
        } else {
          console.error('Invalid squads data format:', data);
          setSquads([]);
        }
      } catch (err: any) {
        toast.error('Failed to load squads: ' + err.message);
        setSquads([]);
      }
    };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUser(data);
      localStorage.setItem('seat_booking_user', JSON.stringify(data));
      toast.success('Welcome back, ' + data.name);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.squadId) {
      toast.error('Please select a squad');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          squad_id: formData.squadId
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUser(data);
      localStorage.setItem('seat_booking_user', JSON.stringify(data));
      toast.success('Account created! Welcome, ' + data.name);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('seat_booking_user');
    toast.info('Logged out');
  };

    if (!user) {
      return (
        <div className="min-h-screen flex" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)'}}>
          {/* Left Panel - Branding */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
              <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse" style={{animationDelay:'2s'}} />
            </div>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px'}} />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <MapIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">Wissen SeatMap</span>
              </div>
            </div>

            <div className="relative z-10 space-y-8">
              <div>
                <h1 className="text-5xl font-extrabold text-white leading-tight">
                  Smart Seat<br />
                  <span className="text-blue-300">Booking</span><br />
                  Made Simple
                </h1>
                <p className="text-blue-200 mt-4 text-lg leading-relaxed">
                  Reserve your workspace, manage your schedule, and collaborate with your team — all in one place.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <Armchair className="h-5 w-5" />, label: '50 Seats', sub: 'Available' },
                  { icon: <CheckCircle2 className="h-5 w-5" />, label: '2 Batches', sub: 'Managed' },
                  { icon: <ShieldCheck className="h-5 w-5" />, label: '10 Squads', sub: 'Supported' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                    <div className="flex justify-center text-blue-300 mb-2">{item.icon}</div>
                    <div className="text-white font-bold text-sm">{item.label}</div>
                    <div className="text-blue-300 text-xs">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 text-blue-300/60 text-sm">
              © 2026 Wissen Technology · Seat Management System
            </div>
          </div>

          {/* Right Panel - Auth Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <MapIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Wissen SeatMap</span>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  {isRegistering ? 'Create account' : 'Welcome back'}
                </h2>
                <p className="text-gray-500 mt-2">
                  {isRegistering ? 'Join your team on SeatMap' : 'Sign in to your workspace'}
                </p>
              </div>

              {/* Tab toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${!isRegistering ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${isRegistering ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Register
                </button>
              </div>

              {isRegistering ? (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Work Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@wissen.com"
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Squad & Batch</label>
                    <select
                      value={formData.squadId}
                      onChange={(e) => setFormData({ ...formData, squadId: e.target.value })}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                      required
                    >
                      <option value="">Select your squad</option>
                      {squads.map((squad) => (
                        <option key={squad.id} value={squad.id}>
                          {squad.name} — {squad.batches?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-2"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Create Account <ChevronRight className="h-4 w-4" /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="employee@wissen.com"
                      className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Sign In <ChevronRight className="h-4 w-4" /></>}
                  </button>
                  <p className="text-center text-sm text-gray-500 pt-2">
                    Enter your registered work email to access the system.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MapIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SeatMap</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Calendar className="h-5 w-5" />} 
            label="Booking" 
            active={activeTab === 'booking'} 
            onClick={() => setActiveTab('booking')} 
          />
          <NavItem 
            icon={<CheckCircle2 className="h-5 w-5" />} 
            label="Weekly View" 
            active={activeTab === 'weekly'} 
            onClick={() => setActiveTab('weekly')} 
          />
            <NavItem 
              icon={<TrendingUp className="h-5 w-5" />} 
              label="Analytics" 
                active={activeTab === 'analytics'} 
                onClick={() => setActiveTab('analytics')} 
              />
            </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.squads.name}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {activeTab === 'dashboard' && <DashboardView user={user} onBook={() => setActiveTab('booking')} />}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Book a Seat</h2>
                  <p className="text-slate-500">Select a date and choose your spot</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-4 py-1 text-sm font-medium">
                    {format(selectedDate, 'EEE, MMM d, yyyy')}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <SeatMap user={user} date={format(selectedDate, 'yyyy-MM-dd')} />
            </div>
          )}
          {activeTab === 'weekly' && <WeeklyView />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function DashboardView({ user, onBook }: any) {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch(`/api/my-bookings?employeeId=${user.id}`)
        ]);
        
        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();
        
        if (statsData.error) console.error('Stats error:', statsData.error);
        if (bookingsData.error) console.error('Bookings error:', bookingsData.error);
  
        setStats(statsData.error ? null : statsData);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const handleRelease = async (bookingId: string) => {
    setReleasing(bookingId);
    try {
      const res = await fetch('/api/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success('Booking released');
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReleasing(null);
    }
  };

  const isBatchDay = (date: Date) => {
    const day = date.getDay() === 0 ? 7 : date.getDay();
    return user.squads.batches.working_days.includes(day);
  };

  const todayIsBatchDay = isBatchDay(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Hi, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-lg text-slate-500 mt-2">
            You are in <span className="font-semibold text-blue-600">{user.squads.name}</span> ({user.squads.batches.name})
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className={`py-1.5 px-4 text-sm rounded-full ${todayIsBatchDay ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            <Clock className="h-3.5 w-3.5 mr-2 inline" />
            {todayIsBatchDay ? 'Today is your Batch Day' : 'Today is Floating Day'}
          </Badge>
          <Badge variant="outline" className="py-1.5 px-4 text-sm rounded-full bg-blue-50 text-blue-700 border-blue-200">
            <ShieldCheck className="h-3.5 w-3.5 mr-2 inline" />
            {user.role}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Office Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : Math.round(stats?.avgUtilization || 0)}%</div>
            <p className="text-xs text-slate-400 mt-1">Average over last 30 days</p>
            <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${stats?.avgUtilization || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : stats?.totalBookings || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Global bookings this month</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-100 overflow-hidden relative group">
          <div className="absolute top-0 right-0 -m-4 h-24 w-24 bg-blue-500 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100 uppercase tracking-wider">Quick Action</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-bold mb-4">Secure your spot</div>
            <Button 
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl"
              onClick={onBook}
            >
              Book Now
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Booking Rules</h3>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Designated Seats</p>
                <p className="text-sm text-slate-500">Available all day on your Batch Days ({user.squads.batches.working_days.map((d: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d-1]).join(', ')}). No time buffer.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Floating Seats</p>
                <p className="text-sm text-slate-500">Available after 3 PM on the previous day for everyone. Buffer seats and unused designated seats (after 10 PM) fall here.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Your Upcoming Bookings</h3>
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between group hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Armchair className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Seat {booking.seats.seat_number}</p>
                      <p className="text-sm text-slate-500">{format(new Date(booking.date), 'EEEE, MMMM d')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRelease(booking.id)}
                    disabled={releasing === booking.id}
                  >
                    {releasing === booking.id ? 'Releasing...' : 'Release'}
                  </Button>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full py-6 border-dashed border-2 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                onClick={onBook}
              >
                Book another spot
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-slate-500 mb-4">You have no upcoming bookings.</p>
              <Button variant="outline" className="rounded-xl border-dashed border-2 px-8" onClick={onBook}>
                Check availability
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
