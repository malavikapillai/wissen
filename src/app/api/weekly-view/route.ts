import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get('weekStart'); // Expecting a date string

  if (!weekStart) {
    return NextResponse.json({ error: 'Missing weekStart' }, { status: 400 });
  }

  const start = startOfWeek(new Date(weekStart), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(weekStart), { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start, end });
  const dayStrings = days.map(d => format(d, 'yyyy-MM-dd'));

  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('*, employees(name, email, squads(name, squad_order)), seats(seat_number, type)')
    .in('date', dayStrings)
    .eq('status', 'BOOKED');

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Group by date
  const grouped = dayStrings.reduce((acc: any, date) => {
    acc[date] = bookings?.filter(b => b.date === date) || [];
    return acc;
  }, {});

  return NextResponse.json({
    bookings: grouped,
    weekRange: { start, end }
  });
}
