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
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import SeatMap from '@/components/SeatMap';
import WeeklyView from '@/components/WeeklyView';
import Analytics from '@/components/Analytics';
import AdminView from '@/components/AdminView';

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
          <div className="min-h-screen flex bg-[#0F172A] selection:bg-blue-500/30">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-16 relative overflow-hidden border-r border-white/5">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay:'2s'}} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20" style={{backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 rotate-3">
                    <MapIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-2xl tracking-tighter uppercase italic">Wissen</span>
                    <span className="text-blue-400 text-[10px] font-bold tracking-[0.4em] uppercase -mt-1 ml-0.5">SeatMap 2.0</span>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="relative z-10 space-y-12 max-w-xl">
                <div className="space-y-6">
                  <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter italic uppercase">
                    Hybrid<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Workspace</span><br />
                    <span className="text-3xl not-italic font-bold tracking-normal text-white/40 normal-case">Redefined for Teams</span>
                  </h1>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-md">
                    Experience the future of office management. Intelligent seat allocation, real-time availability, and seamless team coordination.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { icon: <Armchair className="h-6 w-6" />, label: '50 Seats', sub: 'Optimized' },
                    { icon: <CheckCircle2 className="h-6 w-6" />, label: 'Dynamic', sub: 'Batches' },
                    { icon: <ShieldCheck className="h-6 w-6" />, label: 'Enterprise', sub: 'Security' },
                  ].map((item, i) => (
                    <div key={i} className="group p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] transition-all duration-500">
                      <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div className="text-white font-black text-sm uppercase tracking-tight">{item.label}</div>
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0F172A] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Joined by <span className="text-white font-bold">200+</span> Wissen associates
                </p>
              </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-20 bg-white dark:bg-slate-900 rounded-l-[3rem] lg:-ml-12 relative z-20 shadow-2xl">
              <div className="w-full max-w-md space-y-10">
                {/* Mobile Branding & Theme Toggle */}
                <div className="flex lg:hidden items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl">
                      <MapIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter italic uppercase">Wissen</span>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                    {isRegistering ? 'Start Booking' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {isRegistering ? 'Join your squad and secure your workspace.' : 'Sign in to access your dashboard.'}
                  </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem]">
                  <button
                    onClick={() => setIsRegistering(false)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 uppercase tracking-wider ${!isRegistering ? 'bg-white dark:bg-slate-700 shadow-lg shadow-slate-200 dark:shadow-none text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsRegistering(true)}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 uppercase tracking-wider ${isRegistering ? 'bg-white dark:bg-slate-700 shadow-lg shadow-slate-200 dark:shadow-none text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Register
                  </button>
                </div>

                {isRegistering ? (
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Malavika Pillai"
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@wissen.com"
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Squad & Batch</label>
                      <select
                        value={formData.squadId}
                        onChange={(e) => setFormData({ ...formData, squadId: e.target.value })}
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all appearance-none"
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
                      className="w-full h-14 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 dark:shadow-none group mt-4"
                    >
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Create Account <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="employee@wissen.com"
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-5 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 dark:shadow-none group"
                    >
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Sign In <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest pt-4">
                      Authorized Access Only
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        );
      }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row selection:bg-blue-500/10">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col relative z-30">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 dark:bg-blue-600 rounded-xl shadow-lg shadow-slate-200 dark:shadow-blue-900/20 rotate-2">
              <MapIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase italic leading-none">Wissen</span>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-0.5">SeatMap</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <NavItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Calendar className="h-5 w-5" />} 
            label="Book a Seat" 
            active={activeTab === 'booking'} 
            onClick={() => setActiveTab('booking')} 
          />
          <NavItem 
            icon={<CheckCircle2 className="h-5 w-5" />} 
            label="Weekly Status" 
            active={activeTab === 'weekly'} 
            onClick={() => setActiveTab('weekly')} 
          />
            <NavItem 
              icon={<TrendingUp className="h-5 w-5" />} 
              label="Utilization" 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')} 
            />
            {user.role === 'ADMIN' && (
              <NavItem 
                icon={<ShieldCheck className="h-5 w-5" />} 
                label="Admin Panel" 
                active={activeTab === 'admin'} 
                onClick={() => setActiveTab('admin')} 
              />
            )}
          </nav>

          <div className="p-6 mt-auto">
            <div className="p-5 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] mb-4 shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                <User className="h-12 w-12 text-white" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate uppercase italic">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-blue-300 dark:text-blue-400 font-bold uppercase tracking-widest truncate">{user.squads.name}</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold uppercase tracking-widest text-xs h-11 transition-all"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-slate-950">
        <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
          {activeTab === 'dashboard' && <DashboardView user={user} onBook={() => setActiveTab('booking')} />}
            {activeTab === 'booking' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase italic leading-none">Reserve</h2>
                    <p className="text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase text-xs">Choose your preferred workstation</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                      <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div className="px-6 py-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-x-2 border-slate-50 dark:border-slate-800 text-center min-w-[160px]">
                      {format(selectedDate, 'EEEE, MMM dd')}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                      <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                  </div>
                </div>
                  <SeatMap user={user} date={format(selectedDate, 'yyyy-MM-dd')} currentUser={user} />
              </div>
            )}

            {activeTab === 'weekly' && <WeeklyView />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'admin' && user.role === 'ADMIN' && <AdminView user={user} />}
          </div>
        </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
        active 
          ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xl shadow-slate-200 dark:shadow-blue-900/20' 
          : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none'
      }`}
    >
      <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-blue-400 dark:text-blue-100' : 'text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
        {icon}
      </div>
      <span className={`font-bold uppercase tracking-[0.15em] text-[11px] ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-600 text-[10px] font-black text-white uppercase tracking-[0.3em] rounded-lg rotate-2">Active</span>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
              Hello, {user.name.split(' ')[0]}
            </h1>
          </div>
          <p className="text-xl text-slate-400 dark:text-slate-500 font-medium">
            Strategic seat management for <span className="text-slate-900 dark:text-white font-black italic uppercase tracking-tight">{user.squads.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Badge variant="outline" className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 ${todayIsBatchDay ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 shadow-lg shadow-emerald-100/50 dark:shadow-none' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 shadow-lg shadow-amber-100/50 dark:shadow-none'}`}>
            <Clock className="h-4 w-4 mr-3 inline opacity-70" />
            {todayIsBatchDay ? 'Priority Access Enabled' : 'Buffer Mode Active'}
          </Badge>
          <Badge variant="outline" className="py-3 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-slate-900 dark:bg-blue-600 text-white border-none shadow-xl shadow-slate-200 dark:shadow-blue-900/20">
            <ShieldCheck className="h-4 w-4 mr-3 inline opacity-70" />
            {user.role} Verified
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Workspace Utilization</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{loading ? '...' : Math.round(stats?.avgUtilization || 0)}%</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Peak efficiency last 30d</p>
            <div className="mt-8 h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.avgUtilization || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Platform Engagement</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{loading ? '...' : stats?.totalBookings || 0}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Successful bookings this month</p>
            <div className="mt-8 flex gap-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-4 w-full bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse" style={{animationDelay: `${i*0.2}s`}} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 dark:bg-blue-600 text-white border-none shadow-2xl shadow-slate-900/20 dark:shadow-blue-900/20 rounded-[2.5rem] overflow-hidden relative group cursor-pointer" onClick={onBook}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Armchair className="h-32 w-32" />
          </div>
          <CardHeader className="p-8 pb-4 relative z-10">
            <CardTitle className="text-[10px] font-black text-blue-400 dark:text-blue-100 uppercase tracking-[0.3em]">Priority Action</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 relative z-10">
            <div className="text-3xl font-black italic uppercase tracking-tighter leading-tight mb-8">Secure your<br />next spot</div>
            <Button 
              className="w-full bg-white text-slate-900 dark:text-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 hover:text-white dark:hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 transition-all"
            >
              Check Availability
              <ChevronRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-1 bg-slate-900 dark:bg-white w-12" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">System Protocols</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 space-y-8 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="flex gap-6 items-start">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Designated Access</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">Full priority on your Batch Days ({user.squads.batches.working_days.map((d: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d-1]).join(', ')}).</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                <Clock className="h-8 w-8" />
              </div>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Floating Protocol</p>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">Available after 11 AM of previous working day. Includes buffer zone and unassigned spots.</p>
                </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-1 bg-slate-900 dark:bg-white w-12" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">Upcoming Agenda</h3>
          </div>
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-20 flex items-center justify-center shadow-xl shadow-slate-200/20 dark:shadow-none">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between group hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl dark:hover:shadow-none transition-all duration-500">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-3 transition-transform">
                      <Armchair className="h-8 w-8" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1">Station {booking.seats.seat_number}</p>
                      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">{format(new Date(booking.date), 'EEEE, MMM dd')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-12 px-6 text-red-500 hover:text-white hover:bg-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleRelease(booking.id)}
                    disabled={releasing === booking.id}
                  >
                    {releasing === booking.id ? 'Processing...' : 'Cancel'}
                  </Button>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full py-10 border-dashed border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em] text-[10px] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                onClick={onBook}
              >
                + Book Another Spot
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-16 text-center shadow-xl shadow-slate-200/20 dark:shadow-none">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 mb-6 shadow-inner">
                <Calendar className="h-10 w-10" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">No Upcoming Missions Found</p>
              <Button className="bg-slate-900 dark:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] px-10 h-14 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none" onClick={onBook}>
                Initiate Booking
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
