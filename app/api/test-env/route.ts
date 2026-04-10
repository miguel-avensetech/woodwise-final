import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    exists: !!apiKey,
    length: apiKey?.length || 0,
    first20: apiKey?.substring(0, 20) || 'undefined',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI'))
  });
}
