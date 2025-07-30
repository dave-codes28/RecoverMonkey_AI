import { shopifyRequest } from './shopify-api';

/**
 * Comprehensive Shopify data discovery and fetching utilities
 * This module handles pulling live data from Shopify with all metadata
 */

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyProductOption[];
  images: ShopifyProductImage[];
  image: ShopifyProductImage | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyProductOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyProductImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

export interface ShopifyCart {
  id: number;
  token: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  user_id: number | null;
  note: string | null;
  line_items: ShopifyCartLineItem[];
  attributes: Record<string, any>;
  original_total_duties_set: string | null;
  total_discounts: string;
  total_duties_set: string | null;
  total_line_items_price: string;
  total_line_items_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_outstanding: string;
  total_price: string;
  total_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_tax: string;
  total_tax_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_weight: number;
  customer: ShopifyCustomer | null;
  buyer_identity: {
    country_code: string | null;
    customer: ShopifyCustomer | null;
    device_id: number | null;
    email: string | null;
    marketing_opt_in_level: string | null;
    phone: string | null;
  };
}

export interface ShopifyCartLineItem {
  id: number;
  quantity: number;
  cost: {
    total_amount: {
      amount: string;
      currency_code: string;
    };
    total_amount_shop_money: {
      amount: string;
      currency_code: string;
    };
    total_tax_amount: {
      amount: string;
      currency_code: string;
    };
    total_tax_amount_shop_money: {
      amount: string;
      currency_code: string;
    };
  };
  properties: Record<string, any>;
  merchandise: {
    id: number;
    title: string;
    product: ShopifyProduct;
    variant: ShopifyVariant;
  };
  discount_allocations: any[];
  duties: any[];
  taxable: boolean;
  gift_card: boolean;
  total_discount: string;
  total_discount_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number | null;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  tags: string;
  last_order_name: string | null;
  currency: string;
  phone: string | null;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: string[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress | null;
}

export interface ShopifyAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}

export interface ShopifyOrder {
  id: number;
  email: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  number: number;
  note: string | null;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_weight: number;
  total_tax: string;
  taxes_included: boolean;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  name: string;
  processed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  total_price_usd: string;
  checkout_token: string;
  reference: string | null;
  user_id: number | null;
  location_id: number | null;
  source_identifier: string | null;
  source_url: string | null;
  processed_at: string | null;
  device_id: number | null;
  phone: string | null;
  customer_locale: string | null;
  app_id: number | null;
  browser_ip: string | null;
  landing_site: string | null;
  landing_site_ref: string | null;
  referring_site: string | null;
  order_number: number;
  discount_applications: any[];
  discount_codes: any[];
  note_attributes: any[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: number | null;
  source_name: string;
  fulfillment_status: string | null;
  tax_lines: any[];
  tags: string;
  contact_email: string;
  order_status_url: string;
  presentment_currency: string;
  total_line_items_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_discounts_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_shipping_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  subtotal_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_tax_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  line_items: ShopifyOrderLineItem[];
  shipping_lines: any[];
  billing_address: ShopifyAddress;
  shipping_address: ShopifyAddress;
  fulfillments: any[];
  client_details: {
    browser_ip: string | null;
    accept_language: string | null;
    user_agent: string | null;
    session_hash: string | null;
    browser_width: number | null;
    browser_height: number | null;
  };
  refunds: any[];
  customer: ShopifyCustomer;
  customer_locale: string | null;
  line_items_name: string;
  total_line_items_price: string;
  total_duties_set: string | null;
  total_tip_received: string;
  original_total_duties_set: string | null;
  reference: string | null;
  admin_graphql_api_id: string;
}

export interface ShopifyOrderLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string | null;
  vendor: string | null;
  fulfillment_service: string;
  product_id: number;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: Record<string, any>;
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string | null;
  price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_discount_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  discount_allocations: any[];
  duties: any[];
  admin_graphql_api_id: string;
  tax_lines: any[];
}

/**
 * Discover and analyze your Shopify store data
 */
export async function discoverShopifyStore() {
  try {
    console.log('[Shopify Discovery] Starting store analysis...');

    // Get store information
    const shop = await shopifyRequest('shop.json');
    console.log('[Shopify Discovery] Store info:', {
      name: shop.shop?.name,
      domain: shop.shop?.domain,
      email: shop.shop?.email,
      currency: shop.shop?.currency,
      timezone: shop.shop?.timezone
    });

    // Get products count
    const products = await shopifyRequest('products/count.json');
    console.log('[Shopify Discovery] Products count:', products.count);

    // Get customers count
    const customers = await shopifyRequest('customers/count.json');
    console.log('[Shopify Discovery] Customers count:', customers.count);

    // Get orders count
    const orders = await shopifyRequest('orders/count.json');
    console.log('[Shopify Discovery] Orders count:', orders.count);

    // Get abandoned checkouts count
    const abandonedCheckouts = await shopifyRequest('checkouts/count.json');
    console.log('[Shopify Discovery] Abandoned checkouts count:', abandonedCheckouts.count);

    return {
      shop: shop.shop,
      counts: {
        products: products.count,
        customers: customers.count,
        orders: orders.count,
        abandonedCheckouts: abandonedCheckouts.count
      }
    };
  } catch (error) {
    console.error('[Shopify Discovery] Error:', error);
    throw error;
  }
}

/**
 * Fetch all products with full metadata
 */
export async function fetchAllProducts(limit = 250): Promise<ShopifyProduct[]> {
  try {
    console.log('[Shopify Discovery] Fetching all products...');
    
    const products = await shopifyRequest(`products.json?limit=${limit}&status=active`);
    
    console.log(`[Shopify Discovery] Fetched ${products.products?.length || 0} products`);
    
    return products.products || [];
  } catch (error) {
    console.error('[Shopify Discovery] Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetch abandoned checkouts with full product details
 */
export async function fetchAbandonedCheckouts(limit = 50): Promise<ShopifyCart[]> {
  try {
    console.log('[Shopify Discovery] Fetching abandoned checkouts...');
    
    const checkouts = await shopifyRequest(`checkouts.json?limit=${limit}&status=open`);
    
    console.log(`[Shopify Discovery] Fetched ${checkouts.checkouts?.length || 0} abandoned checkouts`);
    
    return checkouts.checkouts || [];
  } catch (error) {
    console.error('[Shopify Discovery] Error fetching abandoned checkouts:', error);
    throw error;
  }
}

/**
 * Fetch recent orders with full details
 */
export async function fetchRecentOrders(limit = 50): Promise<ShopifyOrder[]> {
  try {
    console.log('[Shopify Discovery] Fetching recent orders...');
    
    const orders = await shopifyRequest(`orders.json?limit=${limit}&status=any`);
    
    console.log(`[Shopify Discovery] Fetched ${orders.orders?.length || 0} orders`);
    
    return orders.orders || [];
  } catch (error) {
    console.error('[Shopify Discovery] Error fetching orders:', error);
    throw error;
  }
}

/**
 * Fetch customers with full details
 */
export async function fetchCustomers(limit = 50): Promise<ShopifyCustomer[]> {
  try {
    console.log('[Shopify Discovery] Fetching customers...');
    
    const customers = await shopifyRequest(`customers.json?limit=${limit}`);
    
    console.log(`[Shopify Discovery] Fetched ${customers.customers?.length || 0} customers`);
    
    return customers.customers || [];
  } catch (error) {
    console.error('[Shopify Discovery] Error fetching customers:', error);
    throw error;
  }
}

/**
 * Transform Shopify cart data to our database format with full metadata
 */
export function transformCartData(shopifyCart: ShopifyCart) {
  const lineItems = shopifyCart.line_items?.map(item => ({
    id: item.id,
    product_id: item.merchandise?.product?.id,
    variant_id: item.merchandise?.variant?.id,
    title: item.merchandise?.title,
    quantity: item.quantity,
    price: item.cost?.total_amount?.amount,
    total: item.cost?.total_amount?.amount,
    sku: item.merchandise?.variant?.sku,
    product: {
      id: item.merchandise?.product?.id,
      title: item.merchandise?.product?.title,
      handle: item.merchandise?.product?.handle,
      vendor: item.merchandise?.product?.vendor,
      product_type: item.merchandise?.product?.product_type,
      tags: item.merchandise?.product?.tags,
      images: item.merchandise?.product?.images,
      variants: item.merchandise?.product?.variants
    },
    variant: {
      id: item.merchandise?.variant?.id,
      title: item.merchandise?.variant?.title,
      price: item.merchandise?.variant?.price,
      sku: item.merchandise?.variant?.sku,
      inventory_quantity: item.merchandise?.variant?.inventory_quantity,
      option1: item.merchandise?.variant?.option1,
      option2: item.merchandise?.variant?.option2,
      option3: item.merchandise?.variant?.option3
    }
  })) || [];

  return {
    shopify_cart_id: shopifyCart.id?.toString(),
    shopify_customer_id: shopifyCart.customer?.id?.toString(),
    email: shopifyCart.customer?.email || shopifyCart.buyer_identity?.email,
    total_price: parseFloat(shopifyCart.total_price || '0'),
    items: lineItems,
    status: 'abandoned',
    metadata: {
      shopify_cart_data: shopifyCart,
      source: 'shopify_discovery',
      customer: shopifyCart.customer,
      buyer_identity: shopifyCart.buyer_identity,
      created_at: shopifyCart.created_at,
      updated_at: shopifyCart.updated_at,
      expires_at: shopifyCart.expires_at
    }
  };
}

/**
 * Transform Shopify customer data to our database format
 */
export function transformCustomerData(shopifyCustomer: ShopifyCustomer) {
  return {
    shopify_customer_id: shopifyCustomer.id?.toString(),
    email: shopifyCustomer.email,
    name: `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim(),
    metadata: {
      shopify_data: shopifyCustomer,
      source: 'shopify_discovery',
      orders_count: shopifyCustomer.orders_count,
      total_spent: shopifyCustomer.total_spent,
      verified_email: shopifyCustomer.verified_email,
      accepts_marketing: shopifyCustomer.accepts_marketing,
      tags: shopifyCustomer.tags,
      addresses: shopifyCustomer.addresses,
      default_address: shopifyCustomer.default_address
    }
  };
} 