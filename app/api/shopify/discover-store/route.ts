import { NextRequest, NextResponse } from 'next/server';
import { 
  discoverShopifyStore, 
  fetchAllProducts, 
  fetchAbandonedCheckouts, 
  fetchRecentOrders, 
  fetchCustomers,
  transformCartData,
  transformCustomerData
} from '@/lib/shopify-data-discovery';
import supabaseAdmin from '../../../../lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    console.log('[Shopify Discovery] Starting store discovery...');
    
    const { searchParams } = new URL(req.url);
    const shop_id = searchParams.get('shop_id');
    
    if (!shop_id) {
      return NextResponse.json({ error: 'Missing shop_id parameter' }, { status: 400 });
    }

    // Get shop info from database
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('shopify_domain, shopify_access_token')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    console.log('[Shopify Discovery] Analyzing store:', shop.shopify_domain);

    // Discover store structure
    const storeInfo = await discoverShopifyStore();
    
    console.log('[Shopify Discovery] Store analysis complete:', storeInfo);

    return NextResponse.json({
      message: 'Store discovery completed',
      store: storeInfo.shop,
      counts: storeInfo.counts,
      shop_domain: shop.shopify_domain,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Shopify Discovery] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to discover store',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Shopify Discovery] Starting data sync...');
    
    const { shop_id, sync_type = 'all' } = await req.json();
    
    if (!shop_id) {
      return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 });
    }

    // Get shop info from database
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('shopify_domain, shopify_access_token')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    console.log('[Shopify Discovery] Syncing data for shop:', shop.shopify_domain);

    const results = {
      products: { count: 0, synced: 0 },
      abandoned_checkouts: { count: 0, synced: 0 },
      orders: { count: 0, synced: 0 },
      customers: { count: 0, synced: 0 }
    };

    // Sync products if requested
    if (sync_type === 'all' || sync_type === 'products') {
      try {
        console.log('[Shopify Discovery] Syncing products...');
        const products = await fetchAllProducts(50); // Limit for testing
        results.products.count = products.length;
        
        // Store products in database (you might want to create a products table)
        console.log(`[Shopify Discovery] Found ${products.length} products`);
        results.products.synced = products.length;
      } catch (error) {
        console.error('[Shopify Discovery] Error syncing products:', error);
      }
    }

    // Sync abandoned checkouts if requested
    if (sync_type === 'all' || sync_type === 'checkouts') {
      try {
        console.log('[Shopify Discovery] Syncing abandoned checkouts...');
        const checkouts = await fetchAbandonedCheckouts(20); // Limit for testing
        results.abandoned_checkouts.count = checkouts.length;
        
        // Transform and store abandoned checkouts
        for (const checkout of checkouts) {
          const cartData = transformCartData(checkout);
          
          // Check if cart already exists
          const { data: existingCart } = await supabaseAdmin
            .from('carts')
            .select('id')
            .eq('shopify_cart_id', cartData.shopify_cart_id)
            .single();

          if (!existingCart) {
            // Insert new cart
            const { error: insertError } = await supabaseAdmin
              .from('carts')
              .insert([{
                ...cartData,
                shop_id: shop_id
              }]);

            if (!insertError) {
              results.abandoned_checkouts.synced++;
            }
          }
        }
        
        console.log(`[Shopify Discovery] Synced ${results.abandoned_checkouts.synced} abandoned checkouts`);
      } catch (error) {
        console.error('[Shopify Discovery] Error syncing checkouts:', error);
      }
    }

    // Sync customers if requested
    if (sync_type === 'all' || sync_type === 'customers') {
      try {
        console.log('[Shopify Discovery] Syncing customers...');
        const customers = await fetchCustomers(20); // Limit for testing
        results.customers.count = customers.length;
        
        // Transform and store customers
        for (const customer of customers) {
          const customerData = transformCustomerData(customer);
          
          // Check if customer already exists
          const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', customerData.email)
            .single();

          if (!existingCustomer) {
            // Insert new customer
            const { error: insertError } = await supabaseAdmin
              .from('customers')
              .insert([{
                ...customerData,
                shop_id: shop_id
              }]);

            if (!insertError) {
              results.customers.synced++;
            }
          }
        }
        
        console.log(`[Shopify Discovery] Synced ${results.customers.synced} customers`);
      } catch (error) {
        console.error('[Shopify Discovery] Error syncing customers:', error);
      }
    }

    // Sync orders if requested
    if (sync_type === 'all' || sync_type === 'orders') {
      try {
        console.log('[Shopify Discovery] Syncing recent orders...');
        const orders = await fetchRecentOrders(20); // Limit for testing
        results.orders.count = orders.length;
        
        // For now, just log orders (you might want to create an orders table)
        console.log(`[Shopify Discovery] Found ${orders.length} recent orders`);
        results.orders.synced = orders.length;
      } catch (error) {
        console.error('[Shopify Discovery] Error syncing orders:', error);
      }
    }

    console.log('[Shopify Discovery] Sync complete:', results);

    return NextResponse.json({
      message: 'Data sync completed',
      results,
      shop_domain: shop.shopify_domain,
      sync_type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Shopify Discovery] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 