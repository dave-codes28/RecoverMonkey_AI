import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id') || 'd5a79116-842f-4a4b-afd6-a4bb225119cf';

    console.log('[API/faqs/test] Testing FAQ system for shop:', shopId);

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Test 1: Check if faqs table exists and is accessible
    const { data: faqs, error: fetchError } = await supabase
      .from('faqs')
      .select('*')
      .eq('shop_id', shopId)
      .limit(5);

    if (fetchError) {
      console.error('[API/faqs/test] Error fetching FAQs:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch FAQs',
        details: fetchError.message
      }, { status: 500 });
    }

    // Test 2: Check table structure
    const { data: sampleFaq, error: sampleError } = await supabase
      .from('faqs')
      .select('*')
      .eq('shop_id', shopId)
      .limit(1)
      .single();

    console.log('[API/faqs/test] FAQ system test completed successfully');

    return NextResponse.json({
      success: true,
      message: 'FAQ system is working correctly',
      shop_id: shopId,
      faqs_count: faqs?.length || 0,
      sample_faq: sampleFaq || null,
      endpoints: {
        get_faqs: `/api/faqs?shop_id=${shopId}`,
        search_faqs: `/api/faqs/search?shop_id=${shopId}&q=test`,
        upload_faqs: `/api/upload-faq-file?shop_id=${shopId}`
      }
    });

  } catch (error) {
    console.error('[API/faqs/test] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 