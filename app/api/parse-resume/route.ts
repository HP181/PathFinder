// app/api/parse-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/Google/Document-AI';

export async function POST(req: NextRequest) {
  console.log('📝 Parse resume API route called');
  
  try {
    // Parse request body
    const body = await req.json();
    const { resumeUrl } = body;
    
    console.log('📦 Received parse request for URL:', resumeUrl?.substring(0, 50) + '...');

    // Validate input
    if (!resumeUrl) {
      console.error('❌ Missing resume URL');
      return NextResponse.json(
        { error: 'Missing resume URL' },
        { status: 400 }
      );
    }

    // Parse the resume (will use mock data if Document AI is not configured)
    console.log('🔍 Parsing resume from URL');
    const parsedData = await parseResume(resumeUrl);
    console.log('✅ Resume parsed successfully');

    // Return the parsed data
    return NextResponse.json({ parsedData });
  } catch (error: any) {
    // Log the error details
    console.error('Resume parse error:', error);
    
    // Return an appropriate error response
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}