import { supabase } from './supabase';

export interface ShopifyCart {
  id: number;
  customer?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    total: string;
  }>;
  total_price: string;
  currency: string;
  created_at: string;
  updated_at: string;
  checkout_id?: string;
}

export async function logWebhookData(data: any, topic: string) {
  try {
    const { data: logEntry, error } = await supabase
      .from('webhook_logs')
      .insert([{
        topic,
        payload: data,
        received_at: new Date().toISOString(),
        processed: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error logging webhook:', error);
    } else {
      console.log('Webhook logged:', logEntry);
    }
  } catch (err) {
    console.error('Failed to log webhook:', err);
  }
}

export async function getRecentCarts(limit = 10) {
  const { data, error } = await supabase
    .from('carts')
    .select(`
      *,
      customers (
        id,
        email,
        name
      )
    `)
    .order('abandoned_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching carts:', error);
    return [];
  }

  return data;
}

export async function getCartStats() {
  const { data, error } = await supabase
    .from('carts')
    .select('status, total_price, currency');

  if (error) {
    console.error('Error fetching cart stats:', error);
    return null;
  }

  const stats = {
    total: data.length,
    abandoned: data.filter(cart => cart.status === 'abandoned').length,
    recovered: data.filter(cart => cart.status === 'recovered').length,
    totalValue: data.reduce((sum, cart) => sum + parseFloat(cart.total_price || '0'), 0)
  };

  return stats;
} 