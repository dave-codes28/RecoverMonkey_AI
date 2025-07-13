import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import supabase from '@/lib/supabaseClient';
import { ShopifyCart } from '@/lib/shopify-utils';

// Helper to get the raw body (Next.js edge API routes require this workaround)
async function getRawBody(req: NextRequest): Promise<Buffer> {
  const reader = req.body?.getReader();
  if (!reader) return Buffer.from('');
  let chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(value);
    done = doneReading;
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  // Get the raw body for HMAC verification
  const rawBody = await getRawBody(req);
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  const topic = req.headers.get('x-shopify-topic');
  const shopDomain = req.headers.get('x-shopify-shop-domain');

  // Get secret from env
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Missing SHOPIFY_WEBHOOK_SECRET in environment');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Compute HMAC
  const generatedHmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  // Compare HMACs
  if (hmacHeader !== generatedHmac) {
    console.warn('Shopify webhook HMAC verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Look up shop by domain
  if (!shopDomain) {
    return NextResponse.json({ error: 'Missing shop domain' }, { status: 400 });
  }
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id')
    .eq('shopify_domain', shopDomain)
    .single();
  if (!shop) {
    console.error('Shop not found for domain:', shopDomain, shopError);
    return NextResponse.json({ error: 'Shop not found' }, { status: 400 });
  }
  const shopId = shop.id;

  // Parse and process the event
  try {
    const payload = JSON.parse(rawBody.toString('utf8'));
    console.log(`[Shopify Webhook] Topic: ${topic}`);
    console.log(payload);

    if (topic === 'carts/update' || topic === 'carts/create') {
      await upsertCustomerAndCart(payload as ShopifyCart, shopId);
    } else {
      // For other topics, just log for now
      console.log('Unhandled topic, event logged.');
    }
  } catch (err) {
    console.error('Failed to parse webhook payload', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Respond OK
  return NextResponse.json({ ok: true });
}

// Update upsertCustomerAndCart to accept shopId and save it
async function upsertCustomerAndCart(cart: ShopifyCart, shopId: string) {
  try {
    // Upsert customer
    let customerId: string | null = null;
    if (cart.customer && cart.customer.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', cart.customer.email)
        .eq('shop_id', shopId)
        .single();
      if (existingCustomer) {
        // Update
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            shop_id: shopId,
            shopify_customer_id: cart.customer.id?.toString(),
            email: cart.customer.email,
            name: `${cart.customer.first_name || ''} ${cart.customer.last_name || ''}`.trim(),
            metadata: { source: 'shopify_webhook', shopify_data: cart.customer }
          })
          .eq('id', existingCustomer.id)
          .select()
          .single();
        if (updateError) {
          console.error('Error updating customer:', updateError);
        } else {
          customerId = updatedCustomer.id;
        }
      } else {
        // Insert
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([{
            shop_id: shopId,
            shopify_customer_id: cart.customer.id?.toString(),
            email: cart.customer.email,
            name: `${cart.customer.first_name || ''} ${cart.customer.last_name || ''}`.trim(),
            metadata: { source: 'shopify_webhook', shopify_data: cart.customer }
          }])
          .select()
          .single();
        if (insertError) {
          console.error('Error inserting customer:', insertError);
        } else {
          customerId = newCustomer.id;
        }
      }
    }
    // Upsert cart
    const cartDataToStore = {
      shop_id: shopId,
      shopify_cart_id: cart.id?.toString(),
      shopify_customer_id: cart.customer?.id?.toString(),
      email: cart.customer?.email,
      customer_id: customerId,
      total_price: parseFloat(cart.total_price || '0'),
      currency: cart.currency,
      items: cart.line_items || [],
      status: 'abandoned',
      metadata: { shopify_cart_data: cart, source: 'shopify_webhook' },
      created_at: cart.created_at,
      updated_at: cart.updated_at
    };
    const { data: upsertedCart, error: cartError } = await supabase
      .from('carts')
      .upsert([cartDataToStore], { onConflict: 'shopify_cart_id' })
      .select()
      .single();
    if (cartError) {
      console.error('Error upserting cart:', cartError);
    } else {
      console.log('Cart upserted:', upsertedCart);
    }
  } catch (err) {
    console.error('Error in upsertCustomerAndCart:', err);
  }
}

// Only allow POST
export const GET = () => NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); 