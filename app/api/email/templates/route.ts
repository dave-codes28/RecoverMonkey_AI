import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper to get shop_id from request (for now, from query or body)
function getShopId(req: NextRequest): string | null {
  if (req.method === 'GET') {
    return req.nextUrl.searchParams.get('shop_id');
  } else {
    try {
      const body = req.json ? req.json() : null;
      return body?.shop_id || null;
    } catch {
      return null;
    }
  }
}

export async function GET(req: NextRequest) {
  const shop_id = getShopId(req);
  if (!shop_id) {
    return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('shop_id', shop_id)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ templates: data });
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { shop_id, name, subject, body: templateBody, is_default } = body;
  if (!shop_id || !name || !subject || !templateBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // If is_default, unset previous defaults for this shop
  if (is_default) {
    await supabase
      .from('email_templates')
      .update({ is_default: false })
      .eq('shop_id', shop_id)
      .eq('is_default', true);
  }
  // Insert new template
  const { data, error } = await supabase
    .from('email_templates')
    .insert([{ shop_id, name, subject, body: templateBody, is_default: !!is_default }])
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ template: data[0] });
} 