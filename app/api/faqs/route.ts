import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    if (!shopId) {
      return NextResponse.json(
        { error: 'shop_id is required' },
        { status: 400 }
      );
    }

    console.log('[API/faqs] Fetching FAQs for shop:', shopId, 'search:', search, 'category:', category);

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

    // Build query
    let query = supabase
      .from('faqs')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%,category.ilike.%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: faqs, error } = await query;

    if (error) {
      console.error('[API/faqs] Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }

    console.log('[API/faqs] Successfully fetched FAQs:', faqs?.length || 0);

    return NextResponse.json({
      faqs: faqs || [],
      count: faqs?.length || 0,
      shop_id: shopId
    });

  } catch (error) {
    console.error('[API/faqs] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint for creating FAQs (if needed for external apps)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop_id, question, answer, category } = body;

    if (!shop_id || !question || !answer || !category) {
      return NextResponse.json(
        { error: 'shop_id, question, answer, and category are required' },
        { status: 400 }
      );
    }

    console.log('[API/faqs] Creating FAQ for shop:', shop_id);

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

    const { data, error } = await supabase
      .from('faqs')
      .insert([{ shop_id, question, answer, category }])
      .select()
      .single();

    if (error) {
      console.error('[API/faqs] Error creating FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: 500 }
      );
    }

    console.log('[API/faqs] Successfully created FAQ:', data.id);

    return NextResponse.json({
      success: true,
      faq: data
    });

  } catch (error) {
    console.error('[API/faqs] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 