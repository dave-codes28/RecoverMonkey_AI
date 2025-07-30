import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function parseFAQContent(text: string): Array<{ question: string; answer: string; category: string }> {
  console.log('[API/upload-faq-file] parseFAQContent called with text length:', text.length);
  const faqs: Array<{ question: string; answer: string; category: string }> = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentQuestion = '';
  let currentAnswer = '';
  let currentCategory = 'General';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^(Q:|Question:|^\d+\.|^[A-Z][^.!?]*\?)/i)) {
      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.trim(),
          category: currentCategory
        });
      }
      currentQuestion = line.replace(/^(Q:|Question:|\d+\.)/i, '').trim();
      currentAnswer = '';
    } else if (line.match(/^(Category:|Section:|Topic:)/i)) {
      currentCategory = line.replace(/^(Category:|Section:|Topic:)/i, '').trim();
    } else if (currentQuestion) {
      currentAnswer += (currentAnswer ? '\n' : '') + line;
    }
  }

  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.trim(),
      category: currentCategory
    });
  }

  if (faqs.length === 0) {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
    paragraphs.forEach((paragraph) => {
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length >= 2) {
        faqs.push({
          question: sentences[0].trim() + '?',
          answer: sentences.slice(1).join('. ').trim() + '.',
          category: 'General'
        });
      }
    });
  }

  return faqs;
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Upload FAQ file endpoint is working' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API/upload-faq-file] POST request received');
    
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id');

    if (!shopId) {
      return NextResponse.json({ error: 'shop_id is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('[API/upload-faq-file] File received:', file.name, file.type, file.size);

    // Basic security: prevent suspicious filenames or oversized uploads
    if (file.name?.includes('..') || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Invalid or oversized file.' }, { status: 400 });
    }

    // For now, only support text files to avoid PDF parsing issues
    if (file.type !== 'text/plain') {
      return NextResponse.json(
        { error: 'Currently only text files (.txt) are supported. Please convert your PDF/DOCX to a text file with the following format:\n\nQ: Your question here?\nA: Your answer here\n\nCategory: Category Name' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const textContent = buffer.toString('utf-8');

    if (!textContent.trim()) {
      return NextResponse.json(
        { error: 'No text content found in file' },
        { status: 400 }
      );
    }

    console.log('[API/upload-faq-file] Text content length:', textContent.length);

    const parsedFaqs = parseFAQContent(textContent);

    if (parsedFaqs.length === 0) {
      return NextResponse.json(
        { error: 'No FAQs found in file. Please ensure the file contains question-answer pairs in the format:\nQ: Question?\nA: Answer\n\nCategory: Category Name' },
        { status: 400 }
      );
    }

    console.log('[API/upload-faq-file] Parsed FAQs:', parsedFaqs.length);

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
              // Ignore if setAll fails
            }
          },
        },
      }
    );

    const faqsToInsert = parsedFaqs.map(faq => ({
      shop_id: shopId,
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    }));

    console.log('[API/upload-faq-file] Inserting FAQs into database...');

    const { data, error } = await supabase
      .from('faqs')
      .insert(faqsToInsert)
      .select();

    if (error) {
      console.error('[DB] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save FAQs to database' },
        { status: 500 }
      );
    }

    console.log('[API/upload-faq-file] Successfully inserted FAQs');

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${parsedFaqs.length} FAQs`,
      inserted: parsedFaqs.length,
      faqs: data
    });

  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 