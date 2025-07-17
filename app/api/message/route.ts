import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { generateResponse } from '@/lib/chatbot/openrouter-client';

export async function POST(req: NextRequest) {
  const { session_id, message, shop_id, customer_id } = await req.json();

  // Fetch shop and cart context
  const { data: shop } = await supabase
    .from('shops')
    .select('store_name')
    .eq('id', shop_id)
    .single();
  const { data: cart } = customer_id
    ? await supabase
        .from('carts')
        .select('items, total_price')
        .eq('customer_id', customer_id)
        .eq('shop_id', shop_id)
        .single()
    : { data: null };

  let response = '';
  try {
    response = await generateResponse(
      [{ role: 'user', content: message }],
      { store_name: shop?.store_name || '' },
      cart ? cart : undefined
    );
  } catch (error) {
    console.error('AI error:', error);
    response = 'Sorry, I am having trouble responding right now.';
  }

  await supabase.from('chat_logs').insert({
    session_id,
    customer_id,
    shop_id,
    message,
    response,
    intent: 'general', // To be refined by intent-detector
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ response, intent: 'general' });
} 