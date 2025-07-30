import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id') || 'd5a79116-842f-4a4b-afd6-a4bb225119cf';

    console.log('[API/faqs/test-upload] Testing upload endpoint for shop:', shopId);

    return NextResponse.json({
      success: true,
      message: 'Upload endpoint is accessible',
      shop_id: shopId,
      upload_url: `/api/upload-faq-file?shop_id=${shopId}`,
      test_instructions: [
        '1. Go to Customer Inquiries page',
        '2. Click "Upload FAQ File" button',
        '3. Select a PDF/DOCX file with FAQ content',
        '4. The file should be processed and FAQs imported'
      ],
      expected_file_formats: [
        'PDF (.pdf)',
        'DOCX (.docx)', 
        'TXT (.txt)'
      ],
      expected_content_format: [
        'Q: Your question here?',
        'Your answer here.',
        'Category: Your category'
      ]
    });

  } catch (error) {
    console.error('[API/faqs/test-upload] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 