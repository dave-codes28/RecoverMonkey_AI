import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function checkCartsStructure() {
  console.log('Checking carts table structure...\n');

  try {
    // Check carts table structure
    console.log('1. Carts table structure:');
    const { data: carts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .limit(1);

    if (cartsError) {
      console.error('❌ Error fetching carts:', cartsError);
    } else if (carts && carts.length > 0) {
      console.log('✅ Carts table columns:');
      const cart = carts[0];
      Object.keys(cart).forEach(key => {
        console.log(`   - ${key}: ${typeof cart[key]} (${cart[key]})`);
      });
    } else {
      console.log('No carts found to check structure');
      
      // Try to get table info from Supabase
      console.log('\n2. Trying to get table info...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'carts')
        .eq('table_schema', 'public');

      if (tableError) {
        console.error('❌ Error getting table info:', tableError);
      } else {
        console.log('✅ Carts table columns from schema:');
        tableInfo?.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Structure check failed:', error);
  }
}

checkCartsStructure(); 