import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

// Process cart abandonment event
async function processCartAbandonment(cartData: any) {
  try {
    console.log('Processing cart abandonment:', cartData);

    // Extract customer information
    const customer = cartData.customer || {};
    const customerData = {
      shopify_customer_id: customer.id?.toString(),
      email: customer.email,
      name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
      metadata: {
        shopify_data: customer,
        source: 'shopify_webhook'
      }
    };

    // Extract cart information - only use columns that exist
    const cartDataToStore = {
      shopify_cart_id: cartData.id?.toString(),
      shopify_customer_id: customer.id?.toString(),
      email: customer.email,
      total_price: parseFloat(cartData.total_price || '0'),
      items: cartData.line_items || [],
      status: 'abandoned',
      metadata: {
        shopify_cart_data: cartData,
        source: 'shopify_webhook'
      }
    };

    console.log('Customer data to store:', customerData);
    console.log('Cart data to store:', cartDataToStore);

    // Insert or update customer
    let customerResult = null;
    if (customer.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customer.email)
        .single();

      if (existingCustomer) {
        // Update existing customer
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', existingCustomer.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating customer:', updateError);
          return false;
        }
        customerResult = updatedCustomer;
      } else {
        // Insert new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([customerData])
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting customer:', insertError);
          return false;
        }
        customerResult = newCustomer;
      }
    }

    // Insert cart data
    const { data: cartResult, error: cartError } = await supabase
      .from('carts')
      .insert([cartDataToStore])
      .select()
      .single();

    if (cartError) {
      console.error('Error inserting cart:', cartError);
      return false;
    }

    console.log('Successfully processed cart abandonment:', {
      customer: customerResult,
      cart: cartResult
    });

    return true;
  } catch (error) {
    console.error('Error processing cart abandonment:', error);
    return false;
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Shopify webhook endpoint is active', 
    timestamp: new Date().toISOString(),
    webhookUrl: '/api/shopify/webhook',
    status: 'ready'
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Shopify Webhook] Starting webhook processing...');
    
    // Get the raw body
    const body = await req.text();
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    
    console.log('[Shopify Webhook] Headers:', Object.fromEntries(req.headers.entries()));
    console.log('[Shopify Webhook] Raw body length:', body.length);
    console.log('[Shopify Webhook] HMAC header:', hmacHeader);

    if (!body || body.trim().length === 0) {
      console.error('[Shopify Webhook] ERROR: Received empty request body.');
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    // Skip HMAC verification for testing
    console.log('[Shopify Webhook] Skipping HMAC verification for testing');

    // Parse the JSON body
    let webhookData;
    try {
      webhookData = JSON.parse(body);
      console.log('[Shopify Webhook] JSON parsed successfully');
    } catch (err) {
      console.error('Failed to parse webhook body:', err, '\nBody received:', body);
      return NextResponse.json({ error: 'Invalid JSON', body }, { status: 400 });
    }

    console.log('[Shopify Webhook] Parsed data:', JSON.stringify(webhookData, null, 2));

    // Get webhook topic
    const topic = req.headers.get('x-shopify-topic');
    console.log('[Shopify Webhook] Topic:', topic);

    // Handle different webhook topics
    switch (topic) {
      case 'carts/update':
      case 'carts/create':
        console.log('[Shopify Webhook] Processing cart event...');
        // Check if cart is abandoned (no checkout_id and not completed)
        const cart = webhookData;
        if (cart && !cart.checkout_id && cart.updated_at) {
          // Simple heuristic: if cart was updated more than 1 hour ago, consider it abandoned
          const cartUpdatedAt = new Date(cart.updated_at);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          console.log('[Shopify Webhook] Cart updated at:', cartUpdatedAt);
          console.log('[Shopify Webhook] One hour ago:', oneHourAgo);
          
          if (cartUpdatedAt < oneHourAgo) {
            console.log('[Shopify Webhook] Cart is abandoned, processing...');
            await processCartAbandonment(cart);
          } else {
            console.log('Cart is not abandoned yet (updated recently)');
          }
        } else {
          console.log('Cart has checkout_id or missing updated_at, skipping');
        }
        break;

      case 'checkouts/update':
        // Handle checkout updates
        console.log('Checkout updated:', webhookData);
        break;

      case 'orders/create':
        // Handle new orders
        console.log('Order created:', webhookData);
        break;

      default:
        console.log('Unhandled webhook topic:', topic);
    }

  return NextResponse.json({ 
      message: 'Webhook processed successfully',
      topic,
    timestamp: new Date().toISOString()
  });

  } catch (error) {
    console.error('[Shopify Webhook] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 