import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { verifyShopifyWebhook } from '@/lib/shopify-hmac';

// Function to process cart abandonment event
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

// Function to process order completion
async function processOrderCompletion(orderData: any) {
  try {
    console.log('Processing order completion:', orderData);

    const order = orderData;
    const customer = order.customer || {};
    const lineItems = order.line_items || [];

    console.log('Order details:', {
      orderId: order.id,
      customerEmail: customer.email,
      totalPrice: order.total_price,
      lineItemsCount: lineItems.length
    });

    // Update customer information if we have it
    if (customer.email) {
      const customerData = {
        shopify_customer_id: customer.id?.toString(),
        email: customer.email,
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        metadata: {
          shopify_data: customer,
          source: 'shopify_webhook',
          last_order: order.id
        }
      };

      // Upsert customer
      const { data: customerResult, error: customerError } = await supabase
        .from('customers')
        .upsert([customerData], { onConflict: 'email' })
        .select()
        .single();

      if (customerError) {
        console.error('Error upserting customer:', customerError);
      } else {
        console.log('Customer updated:', customerResult);
      }
    }

    // Find and mark related abandoned carts as recovered
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .eq('email', customer.email)
      .eq('status', 'abandoned');

    if (cartsError) {
      console.error('Error finding abandoned carts:', cartsError);
      return false;
    }

    console.log(`Found ${abandonedCarts?.length || 0} abandoned carts for ${customer.email}`);

    if (abandonedCarts && abandonedCarts.length > 0) {
      // Mark all abandoned carts as recovered
      const cartIds = abandonedCarts.map(cart => cart.id);
      
      const { data: updatedCarts, error: updateError } = await supabase
        .from('carts')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString(),
          recovered_order_id: order.id?.toString(),
          metadata: {
            ...abandonedCarts[0]?.metadata,
            recovered_order: {
              order_id: order.id,
              order_total: order.total_price,
              recovered_at: new Date().toISOString(),
              source: 'shopify_webhook'
            }
          }
        })
        .in('id', cartIds)
        .select();

      if (updateError) {
        console.error('Error marking carts as recovered:', updateError);
        return false;
      }

      console.log(`Successfully marked ${updatedCarts?.length || 0} carts as recovered`);
      
      // Log the recovery event
      const recoveryLog = {
        order_id: order.id?.toString(),
        customer_email: customer.email,
        carts_recovered: cartIds.length,
        order_total: parseFloat(order.total_price || '0'),
        line_items: lineItems,
        metadata: {
          order_data: order,
          source: 'shopify_webhook'
        }
      };

      console.log('Recovery event logged:', recoveryLog);
    }

    return true;
  } catch (error) {
    console.error('Error processing order completion:', error);
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

    // Verify HMAC signature
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Shopify Webhook] ERROR: Missing SHOPIFY_WEBHOOK_SECRET in environment');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const isValidHmac = verifyShopifyWebhook(body, hmacHeader, secret);
    if (!isValidHmac) {
      console.error('[Shopify Webhook] ERROR: HMAC verification failed');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    console.log('[Shopify Webhook] HMAC verification successful');

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

      case 'orders/create':
        console.log('[Shopify Webhook] Processing order creation...');
        await processOrderCompletion(webhookData);
        break;

      case 'checkouts/update':
        // Handle checkout updates
        console.log('Checkout updated:', webhookData);
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