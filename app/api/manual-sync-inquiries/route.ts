import { NextRequest, NextResponse } from 'next/server';
import { runSyncScript } from '@/lib/manualSync';

export async function POST(req: NextRequest) {
  try {
    const result = await runSyncScript();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 