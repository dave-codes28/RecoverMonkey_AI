import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testAuth() {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  // Try sign up
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  if (signupError) {
    console.error('Sign up error:', signupError.message);
  } else {
    console.log('Sign up success:', signupData);
  }

  // Try login
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (loginError) {
    console.error('Login error:', loginError.message);
  } else {
    console.log('Login success:', loginData);
  }
}

testAuth(); 