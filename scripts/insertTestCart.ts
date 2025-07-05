// DEVELOPMENT ONLY: Inserts a test abandoned cart and customer. Do not run in production.
import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function insertTestCart() {
  console.log('Inserting test abandoned cart...\n');

  try {
    // First, create a test customer
    console.log('1. Creating test customer...');
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert([{
        email: 'test-cart@example.com',
        name: 'Test Cart Customer',
        metadata: { source: 'test-script' }
      }])
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error creating customer:', customerError);
      return;
    }

    console.log('✅ Customer created:', customer);

    // Then, create a test abandoned cart
    console.log('\n2. Creating test abandoned cart...');
    const { data: cart, error: cartError } = await supabaseAdmin
      .from('carts')
      .insert([{
        shopify_cart_id: 'test-cart-123',
        shopify_customer_id: 'test-customer-456',
        email: 'test-cart@example.com',
        total_price: 99.99,
        currency: 'USD',
        items: [
          {
            id: 1,
            title: 'Test Product',
            quantity: 2,
            price: '49.99'
          }
        ],
        status: 'abandoned',
        metadata: {
          source: 'test-script',
          test: true
        }
      }])
      .select()
      .single();

    if (cartError) {
      console.error('❌ Error creating cart:', cartError);
      return;
    }

    console.log('✅ Cart created:', cart);
    console.log('\n Test data inserted successfully!');
    console.log('Now check your frontend at http://localhost:3000/carts');

  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  }
}

insertTestCart(); 