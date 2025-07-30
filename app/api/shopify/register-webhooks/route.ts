import { NextRequest, NextResponse } from 'next/server';
import { shopifyRequest } from '@/lib/shopify-api';
import supabaseAdmin from '../../../../lib/supabaseAdmin';

// Webhook topics we want to register
const WEBHOOK_TOPICS = [
  'carts/create',
  'carts/update',
  'orders/create',
  'customers/create',
  'customers/update',
  'checkouts/create',
  'checkouts/update'
];

// Webhook format for registration
interface WebhookRegistration {
  webhook: {
    topic: string;
    address: string;
    format: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Webhook Registration] Starting webhook registration...');
    
    const { shop_id } = await req.json();
    
    if (!shop_id) {
      console.error('[Webhook Registration] Missing shop_id');
      return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 });
    }

    // Get shop info from database
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('shopify_domain, shopify_access_token')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      console.error('[Webhook Registration] Shop not found:', shopError);
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (!shop.shopify_domain || !shop.shopify_access_token) {
      console.error('[Webhook Registration] Missing Shopify credentials');
      return NextResponse.json({ error: 'Missing Shopify credentials' }, { status: 400 });
    }

    console.log('[Webhook Registration] Registering webhooks for shop:', shop.shopify_domain);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
    const webhookUrl = `${baseUrl}/api/shopify/webhook`;
    
    const results = {
      registered: [] as string[],
      failed: [] as string[],
      skipped: [] as string[]
    };

    // First, get existing webhooks
    try {
      const existingWebhooks = await shopifyRequest('webhooks.json');
      const existingTopics = existingWebhooks.webhooks?.map((wh: any) => wh.topic) || [];
      
      console.log('[Webhook Registration] Existing webhooks:', existingTopics);

      // Register each webhook topic
      for (const topic of WEBHOOK_TOPICS) {
        if (existingTopics.includes(topic)) {
          console.log(`[Webhook Registration] Webhook for ${topic} already exists, skipping`);
          results.skipped.push(topic);
          continue;
        }

        try {
          const webhookData: WebhookRegistration = {
            webhook: {
              topic,
              address: webhookUrl,
              format: 'json'
            }
          };

          console.log(`[Webhook Registration] Registering webhook for ${topic}...`);
          
          const response = await shopifyRequest('webhooks.json', 'POST', webhookData);
          
          if (response.webhook) {
            console.log(`[Webhook Registration] Successfully registered webhook for ${topic}`);
            results.registered.push(topic);
          } else {
            console.error(`[Webhook Registration] Failed to register webhook for ${topic}:`, response);
            results.failed.push(topic);
          }
        } catch (error) {
          console.error(`[Webhook Registration] Error registering webhook for ${topic}:`, error);
          results.failed.push(topic);
        }
      }
    } catch (error) {
      console.error('[Webhook Registration] Error fetching existing webhooks:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch existing webhooks',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('[Webhook Registration] Registration complete:', results);

    return NextResponse.json({
      message: 'Webhook registration completed',
      results,
      webhookUrl,
      shop: shop.shopify_domain
    });

  } catch (error) {
    console.error('[Webhook Registration] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shop_id = searchParams.get('shop_id');
    
    if (!shop_id) {
      return NextResponse.json({ error: 'Missing shop_id parameter' }, { status: 400 });
    }

    // Get shop info
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('shopify_domain, shopify_access_token')
      .eq('id', shop_id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Get existing webhooks
    const webhooks = await shopifyRequest('webhooks.json');
    
    return NextResponse.json({
      message: 'Current webhooks',
      webhooks: webhooks.webhooks || [],
      shop: shop.shopify_domain
    });

  } catch (error) {
    console.error('[Webhook Registration] Error fetching webhooks:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch webhooks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 