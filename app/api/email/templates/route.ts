import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentShopId } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to extract access token from cookies or Authorization header
function extractAccessToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('sb-access-token')?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = extractAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    let shopId;
    try {
      shopId = await getCurrentShopId(supabase);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'No shop_id found' }, { status: 403 });
  }
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
      .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ templates: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = extractAccessToken(req);
    if (!accessToken) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    let shopId;
    try {
      shopId = await getCurrentShopId(supabase);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'No shop_id found' }, { status: 403 });
    }
    let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
    const { name, subject, body: templateBody, is_default } = body;
    if (!name || !subject || !templateBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // If is_default, unset previous defaults for this shop
  if (is_default) {
    await supabase
      .from('email_templates')
      .update({ is_default: false })
        .eq('shop_id', shopId)
      .eq('is_default', true);
  }
  // Insert new template
  const { data, error } = await supabase
    .from('email_templates')
      .insert([{ shop_id: shopId, name, subject, body: templateBody, is_default: !!is_default }])
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ template: data[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 