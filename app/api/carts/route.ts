import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    console.log('[API] Fetching carts...');

    // Get status filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('carts')
      .select('*') // Temporarily remove customer join until we fix the schema
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching carts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} carts`);
    // Log sample cart data for debugging
    if (data && data.length > 0) {
      console.log('[API] Sample cart data:', {
        id: data[0].id,
        shopify_cart_id: data[0].shopify_cart_id,
        customer_email: data[0].customer_email,
        line_items: data[0].line_items,
        status: data[0].status,
        customer_id: data[0].customer_id // Check if this column exists
      });
    }
    
    return NextResponse.json({ 
      carts: data || [],
      total: data?.length || 0,
      status: status || 'all'
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { cartId, status } = await req.json();
    
    console.log('[API] Updating cart status:', { cartId, status });

    const { error } = await supabaseAdmin
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