import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

  // Parse and log the event
  try {
    const payload = JSON.parse(rawBody.toString('utf8'));
    console.log(`[Shopify Webhook] Topic: ${topic}`);
    console.log(payload);
  } catch (err) {
    console.error('Failed to parse webhook payload', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Respond OK
  return NextResponse.json({ ok: true });
}

// Only allow POST
export const GET = () => NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); 