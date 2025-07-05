import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const customers = [
  {
    email: 'testuser@example.com',
    name: 'Test User',
    shop_id: 'dae9b65f-1a54-4820-97e4-d662fce6c3e8',
  },
  {
    email: 'bob@example.com',
    name: 'Bob',
    shop_id: 'dae9b65f-1a54-4820-97e4-d662fce6c3e8',
  },
];

async function insertCustomers() {
  for (const customer of customers) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer]);
    if (error) {
      console.error(`❌ Error inserting ${customer.email}:`, error.message);
    } else {
      console.log(`✅ Inserted customer: ${customer.email}`);
    }
  }
  console.log('Done!');
}

insertCustomers(); 