import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Try .env if .env.local doesn't work

console.log('Loaded env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);