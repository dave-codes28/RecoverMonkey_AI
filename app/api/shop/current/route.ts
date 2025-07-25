import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Replace with real session/shop lookup logic
  // For now, return a mock shopId
  return NextResponse.json({ shopId: "d5a79116-842f-4a4b-afd6-a4bb225119cf" });
} 