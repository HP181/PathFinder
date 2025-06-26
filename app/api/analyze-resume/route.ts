import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/Google/Vertex-AI';

export async function POST(req: NextRequest) {
  try {
    const { resumeData, targetRole, targetIndustry } = await req.json();

    const result = await analyzeResume(resumeData, targetRole, targetIndustry);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to analyze resume' }),
      { status: 500 }
    );
  }
}
