import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const { name, email, squad_id } = await request.json();

  if (!name || !email || !squad_id) {
    return NextResponse.json({ error: 'Name, email, and squad are required' }, { status: 400 });
  }

  // Check if email already exists
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('employees')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  // Insert new employee
  const { data: employee, error } = await supabaseAdmin
    .from('employees')
    .insert([{
      name,
      email,
      squad_id,
      role: 'Employee' // Default role
    }])
    .select('*, squads(*, batches(*))')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(employee);
}
