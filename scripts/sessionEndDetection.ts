import supabaseAdmin from '../src/lib/supabaseAdmin';

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

async function main() {
  // 1. Get all ended chat_log rows with summary, not yet in inquiries
  const conversationIdsInInquiries = await getConversationIdsInInquiries();
  const { data: chatLogs, error } = await supabaseAdmin
    .from('chat_log')
    .select('*')
    .eq('status', 'ended')
    .not('summary', 'is', null);

  if (error) {
    console.error('Error fetching chat_log:', error);
    return;
  }
  if (!chatLogs || chatLogs.length === 0) {
    console.log('No ended chat logs found.');
    return;
  }

  console.log(`Fetched ${chatLogs.length} ended chat logs.`);

  // Filter out those already in inquiries
  const newLogs = chatLogs.filter(
    log => !conversationIdsInInquiries.includes(log.session_id)
  );

  console.log(`Filtered to ${newLogs.length} new logs to upsert.`);
  if (newLogs.length > 0) {
    console.log('Sample new log:', newLogs[0]);
  }

  for (const log of newLogs) {
    // Extract cart info from metadata (if present)
    const cartInfo = extractCartInfo(log.metadata);

    // Prepare inquiry row
    const inquiry = {
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
      shop_id: log.shop_id,
      session_id: log.session_id,
    };

    console.log('Prepared inquiry:', inquiry);

    // Upsert into inquiries (by conversation_id)
    try {
      await supabaseAdmin.from('inquiries').upsert([inquiry], { onConflict: 'conversation_id' });
      console.log(`Upserted inquiry for session ${log.session_id}`);
    } catch (err) {
      console.error('Failed to upsert inquiry for session', log.session_id, err);
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 