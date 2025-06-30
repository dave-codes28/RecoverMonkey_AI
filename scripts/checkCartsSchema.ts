import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function checkCartsSchema() {
  console.log('Checking carts table schema and RLS...\n');

  try {
    // Check if we can access the carts table at all
    console.log('1. Testing basic carts table access...');
    const { data: carts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .limit(1);

    if (cartsError) {
      console.error('❌ Carts table access error:', cartsError);
      
      // Check if it's an RLS issue
      if (cartsError.code === 'PGRST116') {
        console.log('🔒 This looks like an RLS (Row Level Security) issue');
        console.log('You need to enable RLS policies or disable RLS for testing');
      }
    } else {
      console.log('✅ Carts table accessible');
      if (carts && carts.length > 0) {
        console.log('Sample cart structure:');
        const cart = carts[0];
        Object.keys(cart).forEach(key => {
          console.log(`   - ${key}: ${typeof cart[key]} (${cart[key]})`);
        });
      } else {
        console.log('No carts found, but table is accessible');
      }
    }

    // Try to get table schema information
    console.log('\n2. Checking table schema...');
    try {
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'carts')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (schemaError) {
        console.error('❌ Error getting schema info:', schemaError);
      } else {
        console.log('✅ Carts table columns:');
        schemaInfo?.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } catch (schemaErr) {
      console.log('⚠️ Could not get schema info (might be RLS restricted)');
    }

    // Test inserting with minimal data
    console.log('\n3. Testing minimal cart insertion...');
    const minimalCart = {
      shopify_cart_id: 'test-minimal-123',
      email: 'test-minimal@example.com',
      total_price: 50.00,
      status: 'abandoned'
    };

    const { data: insertedCart, error: insertError } = await supabase
      .from('carts')
      .insert([minimalCart])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Minimal cart insertion error:', insertError);
      
      if (insertError.code === 'PGRST116') {
        console.log('🔒 RLS is blocking the insertion');
        console.log('You need to either:');
        console.log('1. Disable RLS on the carts table');
        console.log('2. Create RLS policies that allow insertion');
        console.log('3. Use service role key instead of anon key');
      }
    } else {
      console.log('✅ Minimal cart inserted successfully:', insertedCart);
      
      // Clean up
      await supabase.from('carts').delete().eq('id', insertedCart.id);
      console.log('✅ Test cart cleaned up');
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkCartsSchema(); 