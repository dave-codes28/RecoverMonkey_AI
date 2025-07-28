'use server'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507:free';

const DEFAULT_SYSTEM_PROMPT = `
You are an AI assistant for a Shopify store owner using RecoverMonkey.
Your job is to help the shop owner manage their store, answer questions about abandoned carts, recovery rates, email campaigns, customer activity, and analytics.
You have access to real-time store data via Supabase.
Always be concise, accurate, and proactive in your suggestions.
If you don't know the answer, say so honestly.
The store name is: {store_name}.
`;

const OPENROUTER_SYSTEM_PROMPT = process.env.OPENROUTER_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

export async function generateResponse(
  messages: Array<{ role: string; content: string }>,
  shopContext: { store_name: string },
  cartData?: { items: any[]; total_price: number }
): Promise<string> {
  // Compose the system prompt with shop context
  const systemPrompt = OPENROUTER_SYSTEM_PROMPT.replace('{store_name}', shopContext.store_name || 'this store');

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://recovermonkey.com',
      'X-Title': 'RecoverMonkey Chatbot',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenRouter API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
} 