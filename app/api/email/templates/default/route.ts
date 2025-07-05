import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const shop_id = req.nextUrl.searchParams.get('shop_id');
  if (!shop_id) {
    return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('shop_id', shop_id)
    .eq('is_default', true)
    .single();
  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return NextResponse.json({ error: 'Default template not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ template: data });
} 