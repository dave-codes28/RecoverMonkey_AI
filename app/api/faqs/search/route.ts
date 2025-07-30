import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id');
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');
    const category = searchParams.get('category') || '';

    if (!shopId) {
      return NextResponse.json(
        { error: 'shop_id is required' },
        { status: 400 }
      );
    }

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'search query is required' },
        { status: 400 }
      );
    }

    console.log('[API/faqs/search] Searching FAQs for shop:', shopId, 'query:', query, 'limit:', limit);

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

    // Build search query with relevance scoring
    let searchQuery = supabase
      .from('faqs')
      .select('*')
      .eq('shop_id', shopId);

    // Add category filter if provided
    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }

    // Add search filter - search in question, answer, and category
    searchQuery = searchQuery.or(
      `question.ilike.%${query}%,answer.ilike.%${query}%,category.ilike.%${query}%`
    );

    // Order by relevance (exact matches first, then partial matches)
    searchQuery = searchQuery.order('created_at', { ascending: false });

    // Limit results
    searchQuery = searchQuery.limit(limit);

    const { data: faqs, error } = await searchQuery;

    if (error) {
      console.error('[API/faqs/search] Error searching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to search FAQs' },
        { status: 500 }
      );
    }

    console.log('[API/faqs/search] Found FAQs:', faqs?.length || 0);

    // Calculate relevance scores for better ranking
    const scoredFaqs = (faqs || []).map(faq => {
      let score = 0;
      const queryLower = query.toLowerCase();
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();
      const categoryLower = faq.category.toLowerCase();

      // Exact matches get higher scores
      if (questionLower.includes(queryLower)) score += 10;
      if (answerLower.includes(queryLower)) score += 5;
      if (categoryLower.includes(queryLower)) score += 3;

      // Word boundary matches
      const queryWords = queryLower.split(/\s+/);
      queryWords.forEach(word => {
        if (questionLower.includes(word)) score += 2;
        if (answerLower.includes(word)) score += 1;
      });

      return { ...faq, relevance_score: score };
    });

    // Sort by relevance score (highest first)
    scoredFaqs.sort((a, b) => b.relevance_score - a.relevance_score);

    return NextResponse.json({
      faqs: scoredFaqs,
      count: scoredFaqs.length,
      query: query,
      shop_id: shopId
    });

  } catch (error) {
    console.error('[API/faqs/search] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 