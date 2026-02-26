import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

  export async function GET() {
    try {
      const { data: squads, error } = await supabaseAdmin
        .from('squads')
        .select('*, batches(*)');
  
      if (error) {
        console.error('Supabase error fetching squads:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
  
      return NextResponse.json(squads);
    } catch (err: any) {
      console.error('API error fetching squads:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
