import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { addDays, format, isAfter, setHours, setMinutes, startOfDay } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const employeeId = searchParams.get('employeeId');

  if (!dateStr || !employeeId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
  const pgDay = dayOfWeek === 0 ? 7 : dayOfWeek;

  // 1. Get Employee, Squad, and Batch info
  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('*, squads(*, batches(*))')
    .eq('id', employeeId)
    .single();

  if (employeeError || !employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  // 2. Identify the batch of the day
  const { data: activeBatches, error: batchError } = await supabaseAdmin
    .from('batches')
    .select('*')
    .contains('working_days', [pgDay]);

  const activeBatch = activeBatches?.[0];

  // 3. Get all seats
  const { data: seats, error: seatError } = await supabaseAdmin
    .from('seats')
    .select('*')
    .order('seat_number', { ascending: true });

  // 4. Get bookings for the day
  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('date', dateStr)
    .eq('status', 'BOOKED');

  const bookedSeatIds = new Set(bookings?.map(b => b.seat_id));
  const myBooking = bookings?.find(b => b.employee_id === employeeId);

  // 5. Booking Rules Logic
  const now = new Date();
  const isBatchDay = activeBatch && employee.squads.batch_id === activeBatch.id;
  
  // Rule: Buffer seats bookable after 3 PM previous day
  const prevDay3PM = setMinutes(setHours(startOfDay(addDays(date, -1)), 15), 0);
  const canBookBufferRule = isAfter(now, prevDay3PM);

  // Rule: Unused designated seats become floating after 10 PM previous day
  const prevDay10PM = setMinutes(setHours(startOfDay(addDays(date, -1)), 22), 0);
  const isAfter10PMPrev = isAfter(now, prevDay10PM);

      const processedSeats = seats?.map(seat => {
        const isBooked = bookedSeatIds.has(seat.id);
        const isMySeat = myBooking?.seat_id === seat.id;
        
        let canBook = false;
        let label = '';

        if (isBooked) {
          canBook = false;
          label = 'Booked';
        } else {
          if (seat.type === 'BUFFER') {
            // Buffer seats: ONLY for non-batch day employees after 3 PM prev day
            // Batch day employees should NOT book from the buffer zone
            canBook = !isBatchDay && canBookBufferRule;
            label = 'Floating';
          } else if (seat.type === 'DESIGNATED') {
            if (isBatchDay) {
              // On Batch Day, I can book ANY of the 40 designated seats
              canBook = true;
              label = 'Designated';
            } else {
              // NOT my batch day. Designated seats are restricted.
              canBook = false;
              label = 'Restricted';
            }
          }
        }

        return {
          ...seat,
          isBooked,
          isMySeat,
          canBook,
          label: label || (seat.type === 'BUFFER' ? 'Floating' : 'Designated')
        };
      });

  return NextResponse.json({
    seats: processedSeats,
    myBooking,
    isBatchDay,
    canBookFloating: canBookBufferRule,
    isAfter10PMPrev,
    employee
  });
}
