import crypto from 'crypto';

/**
 * Verify Shopify webhook HMAC signature
 * @param body Raw request body
 * @param hmacHeader HMAC header from Shopify
 * @param secret Webhook secret from environment
 * @returns boolean indicating if signature is valid
 */
export function verifyShopifyWebhook(body: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader || !secret) {
    console.error('[HMAC] Missing HMAC header or secret');
    return false;
  }

  try {
    // Create HMAC using SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body, 'utf8');
    const calculatedHmac = hmac.digest('base64');

    // Compare with provided HMAC
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedHmac, 'base64'),
      Buffer.from(hmacHeader, 'base64')
    );

    console.log('[HMAC] Verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('[HMAC] Error during verification:', error);
    return false;
  }
}

/**
 * Generate HMAC for webhook registration
 * @param body Request body
 * @param secret Webhook secret
 * @returns Base64 encoded HMAC
 */
export function generateHmac(body: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  return hmac.digest('base64');
} 