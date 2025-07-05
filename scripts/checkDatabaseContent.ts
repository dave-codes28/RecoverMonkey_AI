import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use the same environment variables as the app
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDatabaseContent() {
  console.log('Checking database content...\n');

  try {
    // Check all customers
    console.log('1. All customers:');
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError);
    } else {
      console.log(`✅ Found ${customers.length} customers:`);
      customers.forEach((customer: any) => {
        console.log(`   - ${customer.name} (${customer.email}) - Created: ${customer.created_at}`);
      });
    }

    // Check all carts with customer data
    console.log('\n2. All carts with customer data:');
    const { data: carts, error: cartsError } = await supabaseAdmin
      .from('carts')
      .select(`
        *,
        customer:customers(
          id,
          name,
          email,
          shopify_customer_id
        )
      `)
      .order('created_at', { ascending: false });

    if (cartsError) {
      console.error('❌ Error fetching carts:', cartsError);
    } else {
      console.log(`✅ Found ${carts.length} carts:`);
      carts.forEach((cart: any) => {
        const customerName = cart.customer?.name || 'No customer linked';
        const customerEmail = cart.customer?.email || cart.email || 'No email';
        console.log(`   - Cart ${cart.shopify_cart_id} - Customer: ${customerName} (${customerEmail}) - $${cart.total_price} - Status: ${cart.status} - Items: ${cart.items?.length || 0}`);
        
        // Show items structure if available
        if (cart.items && cart.items.length > 0) {
          console.log(`     Items: ${JSON.stringify(cart.items.slice(0, 2))}${cart.items.length > 2 ? '...' : ''}`);
        }
      });
    }

    // Check abandoned carts specifically
    console.log('\n3. Abandoned carts only:');
    const { data: abandonedCarts, error: abandonedError } = await supabaseAdmin
      .from('carts')
      .select(`
        *,
        customer:customers(
          id,
          name,
          email,
          shopify_customer_id
        )
      `)
      .eq('status', 'abandoned')
      .order('created_at', { ascending: false });

    if (abandonedError) {
      console.error('❌ Error fetching abandoned carts:', abandonedError);
    } else {
      console.log(`✅ Found ${abandonedCarts.length} abandoned carts`);
      abandonedCarts.forEach((cart: any) => {
        const customerName = cart.customer?.name || 'No customer linked';
        console.log(`   - Cart ${cart.shopify_cart_id} - Customer: ${customerName} - $${cart.total_price} - Items: ${cart.items?.length || 0}`);
      });
    }

    // Check all cart statuses
    console.log('\n4. Cart statuses:');
    const { data: statusCounts, error: statusError } = await supabaseAdmin
      .from('carts')
      .select('status');

    if (statusError) {
      console.error('❌ Error fetching cart statuses:', statusError);
    } else {
      const statusMap = statusCounts.reduce((acc: Record<string, number>, cart: any) => {
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