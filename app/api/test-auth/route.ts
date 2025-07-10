import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  // Pass the cookies function, not the result
  const supabase = createServerClient({
    cookies
  });

  // Call supabase.auth.getUser()
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('[TEST AUTH] userData:', userData, 'userError:', userError);

  return NextResponse.json({
    userData,
    userError
  });
} 