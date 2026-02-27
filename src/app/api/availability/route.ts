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
    let employee;
    if (employeeId === 'admin-001') {
      employee = {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@wissen.com',
        role: 'ADMIN',
        squad_id: null,
        squads: {
          name: 'Infrastructure & Admin',
          batch_id: 'batch-admin',
          batches: {
            id: 'batch-admin',
            name: 'Full Access',
            working_days: [1, 2, 3, 4, 5, 6, 7]
          }
        }
      };
    } else {
      const { data, error: employeeError } = await supabaseAdmin
        .from('employees')
        .select('*, squads(*, batches(*))')
        .eq('id', employeeId)
        .single();
        
      if (employeeError || !data) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      employee = data;
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

  // 4. Get bookings for the day with employee details
  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('*, employees(*, squads(*, batches(*)))')
    .eq('date', dateStr)
    .eq('status', 'BOOKED');

  const myBooking = bookings?.find(b => b.employee_id === employeeId);

  // 5. Booking Rules Logic
  const now = new Date();
  const isBatchDay = activeBatch && employee.squads.batch_id === activeBatch.id;
  
  // Rule: Buffer seats bookable after 11 AM of the designated day.
  // Special Rule: For Monday bookings, buffer seats are bookable from Friday 11 AM.
  const getBufferReleaseTime = (target: Date) => {
    const d = target.getDay();
    let daysToSub = 1;
    if (d === 1) daysToSub = 3; // Monday -> Friday
    else if (d === 0) daysToSub = 2; // Sunday -> Friday
    return setMinutes(setHours(startOfDay(addDays(target, -daysToSub)), 11), 0);
  };

  const bufferReleaseTime = getBufferReleaseTime(date);
  const canBookBufferRule = isAfter(now, bufferReleaseTime);

  // Rule: Unused designated seats become floating after 10 PM previous day
  const prevDay10PM = setMinutes(setHours(startOfDay(addDays(date, -1)), 22), 0);
  const isAfter10PMPrev = isAfter(now, prevDay10PM);

      const processedSeats = seats?.map(seat => {
        const seatBooking = bookings?.find(b => b.seat_id === seat.id);
        const isBooked = !!seatBooking;
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
            bookingId: seatBooking?.id,
            label: label || (seat.type === 'BUFFER' ? 'Floating' : 'Designated'),
            booker: isBooked ? {
              name: seatBooking.employees.name,
              squad: seatBooking.employees.squads?.name,
              batch: seatBooking.employees.squads?.batches?.name
            } : null
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
