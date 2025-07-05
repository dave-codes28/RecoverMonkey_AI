import 'dotenv/config';
import { shopifyRequest } from '../lib/shopify-api';

async function testShopifyApi() {
  try {
    // Fetch shop info (safe, read-only)
    const shopInfo = await shopifyRequest('shop.json');
    console.log('Shop info:', shopInfo);

    // Optionally, fetch products
    // const products = await shopifyRequest('products.json');
    // console.log('Products:', products);
  } catch (error) {
    console.error('Shopify API test failed:', error);
  }
}

testShopifyApi(); 