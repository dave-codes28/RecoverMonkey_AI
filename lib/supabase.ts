import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing. Check your .env setup.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function to check Supabase connectivity and list tables
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables') // Note: This table may not be accessible depending on Supabase policy
      .select('table_name')
      .limit(10)

    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }

    console.log('Supabase tables:', data)
    return true
  } catch (err) {
    console.error('Unexpected Supabase error:', err)
    return false
  }
}
