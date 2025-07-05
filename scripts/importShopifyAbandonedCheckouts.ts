// DEVELOPMENT ONLY: One-time import script for Shopify abandoned checkouts to Supabase. Do not run in production. Ensure all credentials are set in your .env file.
import 'dotenv/config';
import fetch from 'node-fetch';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_PASSWORD = process.env.SHOPIFY_API_PASSWORD; // Use your access token here if using a custom/public app
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_PASSWORD || !SHOPIFY_STORE || !SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing required environment variables. Please check your .env file.');
}

const supabase = supabaseAdmin;

async function fetchAbandonedCheckouts() {
  const url = `https://${SHOPIFY_API_KEY}:${SHOPIFY_API_PASSWORD}@${SHOPIFY_STORE}/admin/api/2023-04/checkouts.json?status=abandoned&limit=250`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch abandoned checkouts: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.checkouts || [];
}

async function importToSupabase(checkouts: any[]) {
  for (const checkout of checkouts) {
    // Map checkout fields to your Supabase schema
    const cartData = {
      shopify_cart_id: checkout.id?.toString(),
      email: checkout.email,
      total_price: parseFloat(checkout.total_price || '0'),
      items: checkout.line_items,
      status: 'abandoned',
      metadata: checkout,
      // Add more fields as needed to match your schema
    };
    const { error } = await supabase.from('carts').upsert([cartData], { onConflict: 'shopify_cart_id' });
    if (error) {
      console.error('Error upserting cart:', error, cartData);
    } else {
      console.log('Imported cart:', cartData.shopify_cart_id);
    }
  }
}

(async () => {
  try {
    console.log('Fetching abandoned checkouts from Shopify...');
    const checkouts = await fetchAbandonedCheckouts();
    console.log(`Fetched ${checkouts.length} abandoned checkouts.`);
    await importToSupabase(checkouts);
    console.log('Import complete!');
  } catch (err) {
    console.error('Error during import:', err);
  }
})(); 