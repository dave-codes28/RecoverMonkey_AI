import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function checkCurrentData() {
  console.log('Checking current database data...\n');

  try {
    // Check customers
    console.log('1. Customers:');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError);
    } else {
      console.log(`✅ Found ${customers.length} customers:`);
      customers.forEach(customer => {
        console.log(`   - ${customer.name} (${customer.email}) - Created: ${customer.created_at}`);
      });
    }

    // Check carts
    console.log('\n2. Carts:');
    const { data: carts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .order('abandoned_at', { ascending: false })
      .limit(5);

    if (cartsError) {
      console.error('❌ Error fetching carts:', cartsError);
    } else {
      console.log(`✅ Found ${carts.length} carts:`);
      carts.forEach(cart => {
        console.log(`   - Cart ${cart.shopify_cart_id} - ${cart.email} - $${cart.total_price} - Status: ${cart.status} - Abandoned: ${cart.abandoned_at}`);
      });
    }

    // Check abandoned carts specifically
    console.log('\n3. Abandoned Carts:');
    const { data: abandonedCarts, error: abandonedError } = await supabase
      .from('carts')
      .select('*')
      .eq('status', 'abandoned')
      .order('abandoned_at', { ascending: false });

    if (abandonedError) {
      console.error('❌ Error fetching abandoned carts:', abandonedError);
    } else {
      console.log(`✅ Found ${abandonedCarts.length} abandoned carts`);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkCurrentData(); 