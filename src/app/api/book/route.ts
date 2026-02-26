import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { addDays, isAfter, setHours, setMinutes, startOfDay } from 'date-fns';

export async function POST(request: Request) {
  const { employeeId, seatId, date, type } = await request.json();

  if (!employeeId || !seatId || !date) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // 1. Get Employee, Seat info
  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('*, squads(*)')
    .eq('id', employeeId)
    .single();

  const { data: seat, error: seatError } = await supabaseAdmin
    .from('seats')
    .select('*')
    .eq('id', seatId)
    .single();

  if (employeeError || seatError) {
    return NextResponse.json({ error: 'System error fetching dependencies' }, { status: 500 });
  }

  // 2. Booking Rules Enforcement
  const now = new Date();
  const targetDate = new Date(date);
  const prevDay3PM = setMinutes(setHours(startOfDay(addDays(targetDate, -1)), 15), 0);
  const prevDay10PM = setMinutes(setHours(startOfDay(addDays(targetDate, -1)), 22), 0);

  const dayOfWeek = targetDate.getDay();
  const pgDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const { data: batch } = await supabaseAdmin.from('batches').select('id').contains('working_days', [pgDay]).single();
  const isBatchDay = batch?.id === employee.squads.batch_id;

  // Buffer Seat check
  if (seat.type === 'BUFFER') {
    // Buffer seats can be booked anytime on batch day, or after 3 PM prev day otherwise
    if (!isBatchDay && !isAfter(now, prevDay3PM)) {
      return NextResponse.json({ error: 'Buffer seats can only be booked after 3 PM previous day' }, { status: 400 });
    }
  }

  // Designated Seat check
  if (seat.type === 'DESIGNATED') {
    if (isBatchDay) {
      // Allowed anytime on batch day (User: "i can book from all 40n seats in my day")
    } else {
      // Not batch day, must be after 10 PM previous day (Smart Optimization)
      if (!isAfter(now, prevDay10PM)) {
        return NextResponse.json({ error: 'Designated seats are reserved for the active batch until 10 PM previous day' }, { status: 400 });
      }
    }
  }

  // 3. Check if employee already has a booking for this date
  const { data: existingBooking } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', date)
    .eq('status', 'BOOKED')
    .maybeSingle();

  if (existingBooking) {
    return NextResponse.json({ error: 'You already have a seat booked for this day' }, { status: 400 });
  }

  // 4. Check if seat is already booked
  const { data: seatBooking } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('seat_id', seatId)
    .eq('date', date)
    .eq('status', 'BOOKED')
    .maybeSingle();

  if (seatBooking) {
    return NextResponse.json({ error: 'Seat is already booked' }, { status: 400 });
  }

  // 5. Create booking
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert([
      {
        employee_id: employeeId,
        seat_id: seatId,
        date,
        booking_type: type, // 'DESIGNATED' or 'FLOATING'
        status: 'BOOKED'
      }
    ])
    .select()
    .single();

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  return NextResponse.json(booking);
}
