'use server'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function generateResponse(
  messages: Array<{ role: string; content: string }>,
  shopContext: { store_name: string },
  cartData?: { items: any[]; total_price: number }
): Promise<string> {
  // Compose the system prompt with shop and cart context
  const systemPrompt = `You are a helpful customer service chatbot for ${shopContext.store_name || 'this store'}. 
    Help customers with questions about products, shipping, returns, and cart recovery. 
    Be friendly, concise, and helpful. If they mention abandoned carts, offer to help recover them with a recovery email option.
    ${cartData ? `The customer has items in their cart: ${JSON.stringify(cartData.items)} with a total of $${cartData.total_price}.` : ''}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://recovermonkey.com',
      'X-Title': 'RecoverMonkey Chatbot',
    },
    body: JSON.stringify({
      model: 'nousresearch/hermes-3-llama-3.1-405b:free',
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