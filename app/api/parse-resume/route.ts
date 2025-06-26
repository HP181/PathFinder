import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/Google/Document-AI';

export async function POST(req: NextRequest) {
  try {
    const { resumeUrl } = await req.json();

    if (!resumeUrl) {
      return NextResponse.json({ error: 'Missing resume URL' }, { status: 400 });
    }

    const parsedData = await parseResume(resumeUrl);

    return NextResponse.json({ parsedData });
  } catch (error: any) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
