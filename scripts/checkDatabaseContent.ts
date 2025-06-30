import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function checkDatabaseContent() {
  console.log('Checking database content...\n');

  try {
    // Check all customers
    console.log('1. All customers:');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError);
    } else {
      console.log(`✅ Found ${customers.length} customers:`);
      customers.forEach(customer => {
        console.log(`   - ${customer.name} (${customer.email}) - Created: ${customer.created_at}`);
      });
    }

    // Check all carts
    console.log('\n2. All carts:');
    const { data: carts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .order('created_at', { ascending: false });

    if (cartsError) {
      console.error('❌ Error fetching carts:', cartsError);
    } else {
      console.log(`✅ Found ${carts.length} carts:`);
      carts.forEach(cart => {
        console.log(`   - Cart ${cart.shopify_cart_id} - ${cart.email} - $${cart.total_price} - Status: ${cart.status} - Created: ${cart.created_at}`);
      });
    }

    // Check abandoned carts specifically
    console.log('\n3. Abandoned carts only:');
    const { data: abandonedCarts, error: abandonedError } = await supabase
      .from('carts')
      .select('*')
      .eq('status', 'abandoned')
      .order('created_at', { ascending: false });

    if (abandonedError) {
      console.error('❌ Error fetching abandoned carts:', abandonedError);
    } else {
      console.log(`✅ Found ${abandonedCarts.length} abandoned carts`);
      abandonedCarts.forEach(cart => {
        console.log(`   - Cart ${cart.shopify_cart_id} - ${cart.email} - $${cart.total_price} - Created: ${cart.created_at}`);
      });
    }

    // Check all cart statuses
    console.log('\n4. Cart statuses:');
    const { data: statusCounts, error: statusError } = await supabase
      .from('carts')
      .select('status');

    if (statusError) {
      console.error('❌ Error fetching cart statuses:', statusError);
    } else {
      const statusMap = statusCounts.reduce((acc, cart) => {
        acc[cart.status] = (acc[cart.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('✅ Cart status distribution:');
      Object.entries(statusMap).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabaseContent(); 