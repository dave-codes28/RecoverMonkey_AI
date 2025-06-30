// DEVELOPMENT ONLY: Populates dashboard with test data. Do not run in production.
import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function createDashboardTestData() {
  console.log('Creating dashboard test data...\n');

  try {
    // Create customers with unique timestamps
    const timestamp = Date.now();
    console.log('1. Creating test customers...');
    
    const customers = [
      {
        shopify_customer_id: `dashboard-test-${timestamp}-1`,
        email: `john.doe.${timestamp}@example.com`,
        name: 'John Doe',
        metadata: { source: 'dashboard-test' }
      },
      {
        shopify_customer_id: `dashboard-test-${timestamp}-2`,
        email: `jane.smith.${timestamp}@example.com`,
        name: 'Jane Smith',
        metadata: { source: 'dashboard-test' }
      },
      {
        shopify_customer_id: `dashboard-test-${timestamp}-3`,
        email: `mike.wilson.${timestamp}@example.com`,
        name: 'Mike Wilson',
        metadata: { source: 'dashboard-test' }
      },
      {
        shopify_customer_id: `dashboard-test-${timestamp}-4`,
        email: `sarah.jones.${timestamp}@example.com`,
        name: 'Sarah Jones',
        metadata: { source: 'dashboard-test' }
      }
    ];

    const { data: createdCustomers, error: customerError } = await supabase
      .from('customers')
      .insert(customers)
      .select();

    if (customerError) {
      console.error('❌ Customer creation failed:', customerError);
      return;
    }

    console.log(`✅ Created ${createdCustomers.length} customers`);

    // Create carts using the created customers
    console.log('\n2. Creating test carts...');
    const carts = [
      // Abandoned carts
      {
        shopify_cart_id: `dashboard-abandoned-${timestamp}-1`,
        shopify_customer_id: createdCustomers[0].shopify_customer_id,
        email: createdCustomers[0].email,
        customer_id: createdCustomers[0].id,
        total_price: 89.99,
        currency: 'USD',
        items: [{ id: 1, title: 'Premium Widget', quantity: 2, price: '44.99' }],
        status: 'abandoned',
        metadata: { source: 'dashboard-test' }
      },
      {
        shopify_cart_id: `dashboard-abandoned-${timestamp}-2`,
        shopify_customer_id: createdCustomers[1].shopify_customer_id,
        email: createdCustomers[1].email,
        customer_id: createdCustomers[1].id,
        total_price: 156.50,
        currency: 'USD',
        items: [{ id: 2, title: 'Deluxe Package', quantity: 1, price: '156.50' }],
        status: 'abandoned',
        metadata: { source: 'dashboard-test' }
      },
      // Recovered carts
      {
        shopify_cart_id: `dashboard-recovered-${timestamp}-1`,
        shopify_customer_id: createdCustomers[2].shopify_customer_id,
        email: createdCustomers[2].email,
        customer_id: createdCustomers[2].id,
        total_price: 234.00,
        currency: 'USD',
        items: [{ id: 3, title: 'Ultimate Bundle', quantity: 1, price: '234.00' }],
        status: 'recovered',
        metadata: { source: 'dashboard-test' }
      },
      {
        shopify_cart_id: `dashboard-recovered-${timestamp}-2`,
        shopify_customer_id: createdCustomers[3].shopify_customer_id,
        email: createdCustomers[3].email,
        customer_id: createdCustomers[3].id,
        total_price: 67.25,
        currency: 'USD',
        items: [{ id: 4, title: 'Basic Kit', quantity: 1, price: '67.25' }],
        status: 'recovered',
        metadata: { source: 'dashboard-test' }
      }
    ];

    const { data: createdCarts, error: cartError } = await supabase
      .from('carts')
      .insert(carts)
      .select();

    if (cartError) {
      console.error('❌ Cart creation failed:', cartError);
      return;
    }

    console.log(`✅ Created ${createdCarts.length} carts`);

    // Create emails
    console.log('\n3. Creating test emails...');
    const emails = [
      {
        customer_id: createdCustomers[0].id,
        cart_id: createdCarts[0].id,
        email_type: 'abandoned_cart',
        status: 'sent',
        subject: 'Complete your purchase!',
        metadata: { source: 'dashboard-test' }
      },
      {
        customer_id: createdCustomers[1].id,
        cart_id: createdCarts[1].id,
        email_type: 'abandoned_cart',
        status: 'sent',
        subject: 'Your cart is waiting for you!',
        metadata: { source: 'dashboard-test' }
      }
    ];

    const { data: createdEmails, error: emailError } = await supabase
      .from('emails')
      .insert(emails)
      .select();

    if (emailError) {
      console.error('❌ Email creation failed:', emailError);
      return;
    }

    console.log(`✅ Created ${createdEmails.length} emails`);

    console.log('\n🎉 Dashboard test data created successfully!');
    console.log('Your dashboard should now show:');
    console.log('- 2 abandoned carts');
    console.log('- 2 recovered carts');
    console.log('- 2 emails sent');
    console.log('- 50% recovery rate');
    console.log('- Recent activity with real customer data');

  } catch (error) {
    console.error('❌ Dashboard test data creation failed:', error);
  }
}

createDashboardTestData(); 