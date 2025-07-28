import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCurrentShopId } from '@/lib/utils';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { generateResponse } from '@/lib/chatbot/openrouter-client';

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

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    const supabase = getSupabaseServerClient();
    const shopId = await getCurrentShopId(supabase);
    console.log('[API/assistant-query] Received question:', question);
    console.log('[API/assistant-query] shopId:', shopId);

    // Fetch shop name for context
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('store_name')
      .eq('id', shopId)
      .single();
    if (shopError) {
      console.log('[API/assistant-query] Shop fetch error:', shopError);
    }
    const store_name = shop?.store_name || '';
    console.log('[API/assistant-query] Using store_name:', store_name);

    // Formatting system message
    const formattingMsg = {
      role: 'system',
      content: `When answering, do NOT use markdown headings (no #, ##, ###, ---), blockquotes (>), or excessive bold/italics. Write in clear, friendly sentences or simple bullet points. Use only basic formatting (like * for emphasis or - for lists) if needed, but keep it minimal and natural for easy reading in a web chat.`
    };

    // Prepare system messages for analytics
    const systemMessages = [];
    let handled = false;

    // Abandoned carts
    if (question && /abandoned\s*carts?/i.test(question)) {
      const { count, error } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'abandoned');
      if (!error) {
        systemMessages.push({
          role: 'system',
          content: `There are currently ${count} abandoned carts in the database.`,
        });
        handled = true;
      }
    }

    // Recovery rate
    if (question && /recovery\s*rate/i.test(question)) {
      const { count: total, error: totalError } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);
      const { count: recovered, error: recError } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'recovered');
      if (!totalError && !recError) {
        const rate = total && recovered ? ((recovered / total) * 100).toFixed(1) : '0';
        systemMessages.push({
          role: 'system',
          content: `The current recovery rate is ${rate}%. There are ${recovered} recovered carts out of ${total} total carts.`,
        });
        handled = true;
      }
    }

    // Recovered carts
    if (question && /recovered\s*carts?/i.test(question)) {
      const { count, error } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'recovered');
      if (!error) {
        systemMessages.push({
          role: 'system',
          content: `There are currently ${count} recovered carts in the database.`,
        });
        handled = true;
      }
    }

    // Emails sent
    if (question && /emails?\s*sent/i.test(question)) {
      const { count, error } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);
      if (!error) {
        systemMessages.push({
          role: 'system',
          content: `You have sent ${count} recovery emails so far.`,
        });
        handled = true;
      }
    }

    // Total sales
    if (question && /total\s*sales?/i.test(question)) {
      const { data, error } = await supabase
        .from('carts')
        .select('cart_value')
        .eq('shop_id', shopId)
        .eq('status', 'recovered');
      if (!error && data) {
        const totalSales = data.reduce((sum, cart) => sum + (cart.cart_value || 0), 0);
        systemMessages.push({
          role: 'system',
          content: `Total sales from recovered carts: $${totalSales}.`,
        });
        handled = true;
      }
    }

    // Customer count
    if (question && /customers?/i.test(question)) {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);
      if (!error) {
        systemMessages.push({
          role: 'system',
          content: `You have ${count} customers in your store.`,
        });
        handled = true;
      }
    }

    // If any analytics were handled, use formatting + system messages + user question
    if (handled && systemMessages.length > 0) {
      let llmAnswer = '';
      try {
        llmAnswer = await generateResponse(
          [formattingMsg, ...systemMessages, { role: 'user', content: question }],
          { store_name }
        );
      } catch (llmErr) {
        console.log('[API/assistant-query] LLM error:', llmErr);
        return NextResponse.json({ answer: 'Sorry, I am having trouble responding right now.' }, { status: 500 });
      }
      return NextResponse.json({ answer: llmAnswer });
    }

    // Default LLM flow for other questions
    let llmAnswer = '';
    try {
      llmAnswer = await generateResponse(
        [formattingMsg, { role: 'user', content: question }],
        { store_name }
      );
    } catch (llmErr) {
      console.log('[API/assistant-query] LLM error:', llmErr);
      return NextResponse.json({ answer: 'Sorry, I am having trouble responding right now.' }, { status: 500 });
    }
    return NextResponse.json({ answer: llmAnswer });
  } catch (err: any) {
    console.log('[API/assistant-query] Error:', err);
    return NextResponse.json({ answer: 'Internal server error.' }, { status: 500 });
  }
} 