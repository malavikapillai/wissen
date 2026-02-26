import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId) {
    return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*, seats(seat_number, type)')
    .eq('employee_id', employeeId)
    .eq('status', 'BOOKED')
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(bookings);
}
