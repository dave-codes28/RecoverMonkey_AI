import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use the same environment variables as the app
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixDatabaseSchema() {
  console.log('Checking and fixing database schema...\n');

  try {
    // 1. Check current carts table structure
    console.log('1. Checking current carts table structure...');
    const { data: carts, error: cartsError } = await supabaseAdmin
      .from('carts')
      .select('*')
      .limit(1);

    if (cartsError) {
      console.error('❌ Error accessing carts table:', cartsError);
      return;
    }

    if (carts && carts.length > 0) {
      const cart = carts[0];
      console.log('✅ Current carts table columns:');
      Object.keys(cart).forEach(key => {
        console.log(`   - ${key}: ${typeof cart[key]}`);
      });
    }

    // 2. Check if customer_id column exists
    console.log('\n2. Checking if customer_id column exists...');
    const hasCustomerId = carts && carts.length > 0 && 'customer_id' in carts[0];
    console.log(`   - customer_id column exists: ${hasCustomerId}`);

    if (!hasCustomerId) {
      console.log('\n3. Adding customer_id column to carts table...');
      console.log('   ⚠️  This requires manual SQL execution in Supabase dashboard');
      console.log('   Run this SQL in your Supabase SQL editor:');
      console.log(`
ALTER TABLE carts 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Update existing carts to link with customers based on email
UPDATE carts 
SET customer_id = customers.id 
FROM customers 
WHERE carts.email = customers.email 
AND carts.customer_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
      `);
    } else {
      console.log('\n3. ✅ customer_id column already exists');
    }

    // 4. Check current data relationships
    console.log('\n4. Checking current data relationships...');
    const { data: allCarts, error: allCartsError } = await supabaseAdmin
      .from('carts')
      .select('id, shopify_cart_id, email, customer_id')
      .limit(5);

    if (allCartsError) {
      console.error('❌ Error fetching carts:', allCartsError);
    } else {
      console.log(`✅ Sample carts with customer relationships:`);
      allCarts?.forEach((cart: any) => {
        console.log(`   - Cart ${cart.shopify_cart_id}: email=${cart.email}, customer_id=${cart.customer_id || 'NULL'}`);
      });
    }

    // 5. Test the join query that was failing
    console.log('\n5. Testing customer join query...');
    const { data: joinedCarts, error: joinError } = await supabaseAdmin
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
      .limit(1);

    if (joinError) {
      console.error('❌ Join query still failing:', joinError);
      console.log('   This means the customer_id column or foreign key relationship is missing');
    } else {
      console.log('✅ Join query working! Sample data:');
      if (joinedCarts && joinedCarts.length > 0) {
        const cart = joinedCarts[0];
        console.log(`   - Cart: ${cart.shopify_cart_id}`);
        console.log(`   - Customer: ${cart.customer?.name || 'No customer linked'}`);
        console.log(`   - Items: ${cart.items?.length || 0}`);
      }
    }

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  }
}

fixDatabaseSchema(); 