import supabaseAdmin from './supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// Helper: get conversation_ids already in inquiries
async function getConversationIdsInInquiries() {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .select('conversation_id');
  if (error || !data) return [];
  return data.map((row: any) => row.conversation_id) || [];
}

// Helper: extract cart info from metadata JSON
function extractCartInfo(metadata: any) {
  if (!metadata || typeof metadata !== 'object') return {};
  // Adjust this logic if your cart info is nested differently
  const cart = metadata.cart || metadata.cart_info || {};
  return {
    cart_id: cart.cart_id || null,
    cart_value: cart.cart_value || null,
    currency: cart.currency || null,
  };
}

export async function runSyncScript() {
  // 1. Get all ended chat_log rows with summary, not yet in inquiries
  const conversationIdsInInquiries = await getConversationIdsInInquiries();
  const { data: chatLogs, error } = await supabaseAdmin
    .from('chat_log')
    .select('*')
    .eq('status', 'ended')
    .not('summary', 'is', null);

  if (error) {
    console.error('Error fetching chat_log:', error);
    throw new Error('Error fetching chat_log: ' + error.message);
  }
  if (!chatLogs || chatLogs.length === 0) {
    console.log('No ended chat logs found.');
    return { inserted: 0 };
  }

  // Filter out those already in inquiries
  const newLogs = chatLogs.filter(
    log => !conversationIdsInInquiries.includes(log.session_id)
  );

  console.log(`Found ${newLogs.length} new logs to upsert.`);

  let inserted = 0;
  for (const log of newLogs) {
    // Extract cart info from metadata (if present)
    const cartInfo = extractCartInfo(log.metadata);

    // Prepare inquiry row
    const inquiry = {
      id: uuidv4(),
      shop_id: log.shop_id, // use shop_id
      customer_email: log.customer_email,
      cart_id: cartInfo.cart_id,
      cart_value: cartInfo.cart_value,
      currency: cartInfo.currency,
      query_summary: log.summary,
      full_query: log.messages, // or log.text if you want just the last message
      conversation_id: log.session_id,
      status: log.status,
      response: null,
      created_at: log.ended_at || log.timestamp,
      responded_at: null,
      updated_at: log.ended_at || log.timestamp,
      session_id: log.session_id,
    };

    console.log('Upserting inquiry:', inquiry);

    // Upsert into inquiries (by conversation_id)
    try {
      const { error: upsertError, data: upsertData } = await supabaseAdmin
        .from('inquiries')
        .upsert([inquiry], { onConflict: 'conversation_id' });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
      } else {
        console.log('Upsert success:', upsertData);
        inserted++;
      }
    } catch (err) {
      // Log error but continue
      console.error('Failed to upsert inquiry for session', log.session_id, err);
    }
  }
  console.log(`Inserted ${inserted} inquiries.`);
  return { inserted };
} 