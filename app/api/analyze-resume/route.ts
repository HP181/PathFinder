// app/api/analyze-resume/route.ts
import { NextResponse } from 'next/server';
import { analyzeResume, testConnection, isAvailable } from '@/lib/Google/GenAI';
import { ParsedResume } from '@/lib/Google/Document-AI';

// Configuration - read from environment
const MOCK_MODE = process.env.RESUME_ANALYSIS_MOCK_MODE === 'true';
const FALLBACK_TO_MOCK = process.env.RESUME_ANALYSIS_FALLBACK_TO_MOCK === 'true';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

console.log(`🧪 Resume Analysis API config:`, {
  mockMode: MOCK_MODE,
  fallbackToMock: FALLBACK_TO_MOCK,
  debugMode: DEBUG_MODE,
  genAIAvailable: isAvailable()
});

// Sample resume text for testing or when text extraction fails
const SAMPLE_RESUME_TEXT = 
  "Experienced software developer with 5 years of experience in web development. " +
  "Proficient in JavaScript, TypeScript, React, and Node.js. " +
  "Led development of multiple projects with a focus on clean code and user experience. " +
  "Managed teams of up to 5 developers. " +
  "Implemented CI/CD pipelines that reduced deployment times by 40%. " +
  "Bachelor's degree in Computer Science from University of Toronto. " +
  "Strong problem-solving skills and ability to learn new technologies quickly.";

// Helper to generate mock data customized to inputs
function generateMockResult(targetRole: string, targetIndustry: string) {
  console.log(`🧪 Generating mock result for role: ${targetRole}, industry: ${targetIndustry}`);
  
  return {
    strengths: [
      `Strong technical background relevant to ${targetRole} positions`,
      `Experience with key technologies used in the ${targetIndustry} industry`,
      "Clear progression in roles and responsibilities",
      "Quantifiable achievements demonstrating impact",
      "Educational qualifications align with Canadian standards"
    ],
    improvementAreas: [
      "Resume lacks Canadian-specific terminology and keywords",
      `Insufficient emphasis on skills specific to ${targetRole} roles`,
      "Limited demonstration of soft skills valued in Canadian workplace",
      "Employment gaps not adequately explained",
      "Certifications may need Canadian equivalents"
    ],
    canadianMarketFit: `Your resume shows moderate alignment with Canadian market expectations for ${targetRole} positions in the ${targetIndustry} industry. While your technical skills and experience are valuable, you would benefit from adapting your resume to Canadian formats and highlighting transferable skills more explicitly. Canadian employers typically value clear communication skills, teamwork, and adaptability, which could be emphasized more in your resume.`,
    recommendedChanges: [
      "Add a professional summary highlighting your value proposition for Canadian employers",
      `Incorporate ${targetIndustry} industry keywords specific to ${targetRole} roles`,
      "Quantify achievements using metrics that resonate with Canadian employers",
      "Include any Canadian connections, experiences, or familiarity with Canadian work culture",
      "Structure your resume in reverse chronological order with clear section headings"
    ],
    skillGaps: [
      `Knowledge of Canadian ${targetIndustry} regulations and standards`,
      `Experience with ${targetRole}-specific Canadian software or methodologies`,
      "Demonstrated cross-cultural communication skills",
      "Local Canadian references or testimonials",
      "Canadian-specific certifications or credentials"
    ],
    _notice: "This is mock data. To enable real AI analysis, set up GOOGLE_API_KEY in your environment variables."
  };
}

/**
 * Extract resume URL from various possible formats
 */
function extractResumeUrl(resumeData: any): string | null {
  // If resumeData is an object with url property, use that
  if (resumeData && typeof resumeData === 'object') {
    // Check for direct url property
    if (resumeData.url && typeof resumeData.url === 'string') {
      return resumeData.url;
    }
    
    // Check for resumeUrl property
    if (resumeData.resumeUrl && typeof resumeData.resumeUrl === 'string') {
      return resumeData.resumeUrl;
    }
    
    // Check for fileUri property
    if (resumeData.fileUri && typeof resumeData.fileUri === 'string') {
      return resumeData.fileUri;
    }
  }
  
  return null;
}

/**
 * Extract resume text from various possible formats
 */
function extractResumeText(resumeData: any): string | null {
  // If resumeData is already a string, use it directly
  if (typeof resumeData === 'string') {
    return resumeData;
  }
  
  // If resumeData is an object with rawText property, use that
  if (resumeData && typeof resumeData === 'object') {
    if (resumeData.rawText && typeof resumeData.rawText === 'string') {
      return resumeData.rawText;
    }
    
    // If there's no rawText but there's a text property, use that
    if (resumeData.text && typeof resumeData.text === 'string') {
      return resumeData.text;
    }
  }
  
  return null;
}

/**
 * Extract parsed resume data if available
 */
function extractParsedResume(resumeData: any): ParsedResume | null {
  if (resumeData && typeof resumeData === 'object' && resumeData.parsedData) {
    return resumeData.parsedData;
  }
  return null;
}

/**
 * Main API endpoint for resume analysis
 */
export async function POST(request: Request) {
  console.log('📝 Resume analysis API route called');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body received, parsing...');
    
    const { resumeData, targetRole, targetIndustry } = body;
    console.log('📋 Parsed request data:', { 
      hasResumeData: !!resumeData,
      resumeDataType: typeof resumeData,
      targetRole, 
      targetIndustry 
    });
    
    // Validate inputs
    if (!targetRole || !targetIndustry) {
      console.error('❌ Missing target role or industry in request');
      return NextResponse.json(
        { error: 'Target role and industry are required' },
        { status: 400 }
      );
    }
    
    // MOCK MODE: Return mock data immediately without further processing
    if (MOCK_MODE) {
      console.log('🔄 Using MOCK mode, returning simulated analysis');
      
      // Add a slight delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return customized mock data
      const mockResult = generateMockResult(targetRole, targetIndustry);
      console.log('✅ Returning mock analysis results');
      return NextResponse.json(mockResult);
    }
    
    // Extract resume URL, text, and parsed data from the request
    const resumeUrl = extractResumeUrl(resumeData);
    const resumeText = extractResumeText(resumeData) || SAMPLE_RESUME_TEXT;
    const parsedResume = extractParsedResume(resumeData);
    
    console.log('📄 Resume data extracted:', { 
      hasUrl: !!resumeUrl, 
      hasText: !!resumeText,
      textLength: resumeText?.length || 0,
      hasParsedData: !!parsedResume
    });
    
    // If we have a URL but no parsed data, try to parse the resume
    let parsedResumeData = parsedResume;
    if (resumeUrl && !parsedResume) {
      try {
        console.log('🔍 Attempting to parse resume from URL:', resumeUrl);
        // Fetch parsed resume data - FIX: Use absolute URL for Next.js server components
        const response = await fetch(new URL('/api/parse-resume', request.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeUrl })
        });
        
        if (response.ok) {
          const parseResult = await response.json();
          if (parseResult.parsedData) {
            parsedResumeData = parseResult.parsedData;
            console.log('✅ Successfully parsed resume data');
          }
        } else {
          console.warn('⚠️ Failed to parse resume, continuing with text only');
        }
      } catch (parseError) {
        console.warn('⚠️ Error parsing resume:', parseError);
      }
    }
    
    // Test the GenAI connection
    console.log('🧪 Testing GenAI connection...');
    const connectionTest = await testConnection();
    console.log('🧪 Connection test result:', connectionTest);
    
    if (connectionTest.status === 'error') {
      console.error('⚠️ GenAI connection test failed:', connectionTest.message);
      
      // If we have fallback enabled, use mock data
      if (FALLBACK_TO_MOCK) {
        console.log('🔄 GenAI unavailable, falling back to mock data');
        const mockResult = generateMockResult(targetRole, targetIndustry);
        mockResult._notice = "This is mock data because the AI service is currently unavailable: " + connectionTest.message;
        return NextResponse.json(mockResult);
      }
      
      // Otherwise return an error
      return NextResponse.json(
        { error: 'AI service unavailable: ' + connectionTest.message },
        { status: 503 }
      );
    }
    
    // If we get here, the connection test passed, so proceed with analysis
    console.log('🔍 Analyzing resume with GenAI');
    
    try {
      // Call GenAI to analyze the resume, including parsed data if available
      const result = await analyzeResume(resumeUrl, targetRole, targetIndustry, resumeText, parsedResumeData);
      
      console.log('✅ Resume analysis completed successfully');
      return NextResponse.json(result);
    } catch (analysisError: any) {
      console.error('❌ Error during AI analysis:', analysisError);
      
      // If we have fallback enabled, use mock data
      if (FALLBACK_TO_MOCK) {
        console.log('🔄 AI analysis failed, falling back to mock data');
        const mockResult = generateMockResult(targetRole, targetIndustry);
        mockResult._notice = "This is mock data because the AI analysis failed: " + analysisError.message;
        return NextResponse.json(mockResult);
      }
      
      // Otherwise return an error
      return NextResponse.json(
        { error: 'AI analysis failed: ' + analysisError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle any other errors
    console.error('❌ Uncaught error in resume analysis API:', error);
    
    // If we have fallback enabled, use mock data
    if (FALLBACK_TO_MOCK) {
      console.log('🔄 Uncaught error, falling back to mock data');
      
      try {
        const body = await request.json();
        const { targetRole = 'Professional', targetIndustry = 'General' } = body;
        
        const mockResult = generateMockResult(targetRole, targetIndustry);
        mockResult._notice = "This is mock data due to an unexpected error: " + error.message;
        return NextResponse.json(mockResult);
      } catch (jsonError) {
        // If we can't parse the request body, just return generic mock data
        return NextResponse.json({
          ...generateMockResult('Professional', 'General'),
          _notice: "This is mock data due to an unexpected error: " + error.message
        });
      }
    }
    
    // Otherwise return an error
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(request: Request) {
  try {
    // If we're in mock mode, just return success
    if (MOCK_MODE) {
      return NextResponse.json({
        status: 'success',
        message: 'Resume analysis API is running in MOCK mode',
        mockEnabled: true,
        fallbackEnabled: FALLBACK_TO_MOCK
      });
    }
    
    // Otherwise, test the GenAI connection
    const connectionTest = await testConnection();
    
    return NextResponse.json({
      ...connectionTest,
      mockEnabled: false,
      fallbackEnabled: FALLBACK_TO_MOCK
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message,
        mockEnabled: false,
        fallbackEnabled: FALLBACK_TO_MOCK
      },
      { status: 500 }
    );
  }
}