import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Hardcoded Admin Logic
  if (email === 'admin@wissen.com') {
    return NextResponse.json({
      id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@wissen.com',
      role: 'ADMIN',
      squad_id: null,
      squads: {
        name: 'Infrastructure & Admin',
        batches: {
          name: 'Full Access',
          working_days: [1, 2, 3, 4, 5, 6, 7]
        }
      }
    });
  }

  const { data: employee, error } = await supabaseAdmin
    .from('employees')
    .select('*, squads(*, batches(*))')
    .eq('email', email)
    .single();

  if (error || !employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json(employee);
}
