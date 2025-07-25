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
        set: () => {},
        remove: () => {},
      }
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Debug log: print cookies and session info
    console.log('[API/inquiries] Cookies:', cookies().getAll());
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[API/inquiries] session:', session, 'sessionError:', sessionError);

    // Get the current user's shop ID
    let shopId;
    try {
      shopId = await getCurrentShopId(supabase);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'No shop_id found' }, { status: 403 });
    }

    // Optionally, get status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Query inquiries filtered by shop_id (and status if provided)
    let query = supabase.from('inquiries').select('*').eq('shop_id', shopId);
    if (status) {
      query = query.eq('status', status);
    }
    const { data: inquiries, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Debug log: log shopId and inquiries
    console.log('[API/inquiries] shopId:', shopId, 'inquiries:', inquiries);
    return NextResponse.json({ inquiries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 