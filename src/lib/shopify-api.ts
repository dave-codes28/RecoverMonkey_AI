import fetch from 'node-fetch';

/**
 * Makes an authenticated request to the Shopify REST API.
 * @param endpoint The Shopify API endpoint (e.g., 'orders.json')
 * @param method HTTP method (default: 'GET')
 * @param body Optional request body (object)
 * @returns The parsed JSON response from Shopify
 */
export async function shopifyRequest(endpoint: string, method: string = 'GET', body?: any) {
  const shop = process.env.SHOPIFY_STORE;
  const accessToken = process.env.SHOPIFY_API_PASSWORD; // or SHOPIFY_ACCESS_TOKEN

  if (!shop || !accessToken) {
    throw new Error('Missing Shopify credentials in environment variables');
  }

  const url = `https://${shop}/admin/api/2023-04/${endpoint}`;
  const headers: Record<string, string> = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Shopify API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
} 