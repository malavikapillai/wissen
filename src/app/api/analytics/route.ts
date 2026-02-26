import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { subDays, format } from 'date-fns';

export async function GET(request: Request) {
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  // 1. Get all bookings for the last 30 days
  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('*, employees(id, squad_id, squads(name)), seats(seat_number, id)')
    .gte('date', thirtyDaysAgo)
    .eq('status', 'BOOKED');

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // 2. Seat usage heat map (use seat number for labels)
  const seatUsage: any = {};
  bookings?.forEach(b => {
    const seatNum = (b.seats as any)?.seat_number || b.seat_id;
    seatUsage[seatNum] = (seatUsage[seatNum] || 0) + 1;
  });

  // 3. Squad presence %
  const squadPresence: any = {};
  bookings?.forEach(b => {
    const squadName = (b.employees as any)?.squads?.name;
    if (squadName) {
      squadPresence[squadName] = (squadPresence[squadName] || 0) + 1;
    }
  });

  // 4. Office utilization % (Daily avg)
  const dailyBookings: any = {};
  bookings?.forEach(b => {
    const date = b.date;
    dailyBookings[date] = (dailyBookings[date] || 0) + 1;
  });

  const dailyCounts = Object.values(dailyBookings) as number[];
  const avgUtilization = dailyCounts.length > 0 
    ? (dailyCounts.reduce((a, b) => a + b, 0) / (dailyCounts.length * 50)) * 100 
    : 0;

  return NextResponse.json({
    seatUsage,
    squadPresence,
    avgUtilization,
    totalBookings: bookings?.length
  });
}
