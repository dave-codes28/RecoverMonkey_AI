import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/lib/shopify-api';
import supabaseAdmin from '../../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  // Log all shops for debugging
  const allShops = await supabaseAdmin.from('shops').select('*');
  console.log('[SYNC] All shops:', allShops.data);
  // Get shop_id from request body or session (for demo, use body)
  const { shop_id } = await req.json();
  console.log('[SYNC] Incoming shop_id:', shop_id);
  if (!shop_id) {
    console.error('[SYNC] Missing shop_id');
    return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 });
  }
  // Get shop info from DB
  const { data: shop, error: shopError } = await supabaseAdmin
    .from('shops')
    .select('shopify_domain, shopify_access_token')
    .eq('id', shop_id)
    .single();
  console.log('[SYNC] Shop record from DB:', shop, 'Error:', shopError);
  if (!shop) {
    console.error('[SYNC] Shop not found for id', shop_id);
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }
  if (!shop.shopify_domain || !shop.shopify_access_token) {
    console.error('[SYNC] Missing Shopify credentials for shop', shop_id);
    return NextResponse.json({ error: 'Missing Shopify credentials' }, { status: 400 });
  }
  // Fetch abandoned checkouts from Shopify
  try {
    const shopifyUrl = `https://${shop.shopify_domain}/admin/api/2023-07/checkouts.json?status=abandoned`;
    console.log('[SYNC] Fetching from Shopify:', shopifyUrl);
    const shopifyRes = await fetch(shopifyUrl, {
      headers: {
        'X-Shopify-Access-Token': shop.shopify_access_token,
        'Content-Type': 'application/json',
      },
    });
    const shopifyData = await shopifyRes.json();
    console.log('[SYNC] Shopify API response:', JSON.stringify(shopifyData, null, 2));
    if (!shopifyRes.ok) {
      console.error('[SYNC] Shopify API error:', shopifyData);
      return NextResponse.json({ error: 'Shopify API error', details: shopifyData }, { status: 500 });
    }
    const abandonedCheckouts = shopifyData.checkouts || [];
    console.log('[SYNC] Abandoned checkouts found:', abandonedCheckouts.length);
    // Fetch existing carts from Supabase
    const { data: existingCarts, error: cartsError } = await supabaseAdmin
      .from('carts')
      .select('shopify_cart_id')
      .eq('shop_id', shop_id);
    console.log('[SYNC] Existing carts in Supabase:', existingCarts?.length, 'Error:', cartsError);
    let imported = 0;
    for (const checkout of abandonedCheckouts) {
      const alreadyExists = existingCarts?.some((c: any) => c.shopify_cart_id === checkout.id);
      if (!alreadyExists) {
        // Insert new cart
        const { error: insertError } = await supabaseAdmin.from('carts').insert({
          shop_id,
          shopify_cart_id: checkout.id,
          email: checkout.email,
          total_price: parseFloat(checkout.total_price || '0'),
          items: checkout.line_items,
          status: 'abandoned',
          metadata: checkout,
          created_at: checkout.created_at,
          updated_at: checkout.updated_at
        });
        if (insertError) {
          console.error('[SYNC] Error inserting cart', checkout.id, insertError);
        } else {
          console.log('[SYNC] Inserted new cart', checkout.id);
          imported++;
        }
      } else {
        console.log('[SYNC] Cart already exists in Supabase:', checkout.id);
      }
    }
    console.log('[SYNC] Import complete. New carts imported:', imported);
    return NextResponse.json({ imported });
  } catch (err) {
    console.error('[SYNC] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 });
  }
} 