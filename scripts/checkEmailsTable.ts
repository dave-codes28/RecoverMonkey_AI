import 'dotenv/config';
import { supabase } from '../lib/supabase';

async function checkEmailsTable() {
  console.log('Checking emails table structure...\n');

  try {
    // Check if emails table exists and what columns it has
    console.log('1. Testing emails table access...');
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('*')
      .limit(1);

    if (emailsError) {
      console.error('❌ Emails table error:', emailsError);
      console.log('\n🔧 The emails table might not exist or have the wrong schema.');
      console.log('Let\'s create it with the correct structure.');
      
      // Try to create a simple email record to see what the actual error is
      console.log('\n2. Trying to create a simple email record...');
      const simpleEmail = {
        customer_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        cart_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        email_type: 'test',
        status: 'sent',
        subject: 'Test Email'
      };

      const { data: testEmail, error: testError } = await supabase
        .from('emails')
        .insert([simpleEmail])
        .select()
        .single();

      if (testError) {
        console.error('❌ Test email creation error:', testError);
        console.log('\n📋 Manual SQL needed to create emails table:');
        console.log(`
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policy for full access (development)
CREATE POLICY "Enable full access to emails" ON emails FOR ALL USING (true);
        `);
      } else {
        console.log('✅ Test email created successfully:', testEmail);
        // Clean up test email
        await supabase.from('emails').delete().eq('id', testEmail.id);
        console.log('✅ Test email cleaned up');
      }
    } else {
      console.log('✅ Emails table accessible');
      if (emails && emails.length > 0) {
        console.log('Sample email structure:', emails[0]);
      } else {
        console.log('Emails table is empty');
      }
    }

  } catch (error) {
    console.error('❌ Emails table check failed:', error);
  }
}

checkEmailsTable(); 