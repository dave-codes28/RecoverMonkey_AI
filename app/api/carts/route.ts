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
    console.log('[API] Cookies:', cookies().getAll());
    console.log('[API] Fetching carts...');
    const supabase = getSupabaseServerClient();

    // Get the current user's shop ID
    let shopId;
    try {
      shopId = await getCurrentShopId(supabase);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'No shop_id found' }, { status: 403 });
    }

    // Get status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Query carts filtered by shop_id (and status if provided)
    let query = supabase.from('carts').select('*').eq('shop_id', shopId);
    if (status) {
      query = query.eq('status', status);
    }
    const { data: carts, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ carts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('[API] Cookies:', cookies().getAll());
    const supabase = getSupabaseServerClient();

    const { cartId, status } = await req.json();
    
    console.log('[API] Updating cart status:', { cartId, status });

    const { error } = await supabase
      .from('carts')
      .update({ status })
      .eq('id', cartId);

    if (error) {
      console.error('[API] Error updating cart:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 