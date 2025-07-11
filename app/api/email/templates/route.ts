import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCurrentShopId } from '@/lib/utils';

function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {}, // no-op
        remove: () => {}, // no-op
      }
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
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
    const supabase = getSupabaseServerClient();
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
    console.error("API /api/email/templates POST error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 