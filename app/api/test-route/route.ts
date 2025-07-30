import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[API/test-route] GET request received');
  return NextResponse.json({ 
    message: 'Test route is working',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}

export async function POST(request: NextRequest) {
  console.log('[API/test-route] POST request received');
  return NextResponse.json({ 
    message: 'Test route POST is working',
    timestamp: new Date().toISOString(),
    url: request.url
  });
} 