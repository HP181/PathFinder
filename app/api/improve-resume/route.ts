// app/api/improve-resume/route.ts
import { NextResponse } from 'next/server'; // Fixed import path
import { improveResume, isAvailable } from '@/lib/Google/GenAI'; // Fixed casing to match existing file

// Configuration - read from environment
const MOCK_MODE = process.env.RESUME_ANALYSIS_MOCK_MODE === 'true';
const FALLBACK_TO_MOCK = process.env.RESUME_ANALYSIS_FALLBACK_TO_MOCK === 'true';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

console.log(`🧪 Resume Improvement API config:`, {
  mockMode: MOCK_MODE,
  fallbackToMock: FALLBACK_TO_MOCK,
  debugMode: DEBUG_MODE,
  genAIAvailable: isAvailable()
});

/**
 * Generate a mock improved resume
 */
function generateMockImprovedResume(
  resumeText: string,
  targetRole: string,
  targetIndustry: string
): string {
  console.log('🧪 Generating mock improved resume');
  
  // If resume text is empty, use a sample resume
  if (!resumeText || resumeText.trim().length === 0) {
    resumeText = `JOHN DOE
123 Main Street, Toronto, ON M5V 2K7
Phone: (123) 456-7890 | Email: john.doe@email.com

EXPERIENCE
Software Developer, ABC Tech, 2018-Present
• Developed web applications using React, Node.js, and TypeScript
• Implemented CI/CD pipelines for automated testing and deployment
• Led a team of 3 developers for a major client project

Junior Developer, XYZ Solutions, 2016-2018
• Assisted in the development of mobile applications using React Native
• Collaborated with design team to implement UI/UX improvements

EDUCATION
Bachelor of Computer Science, University of Toronto, 2016

SKILLS
• Programming: JavaScript, TypeScript, Python, Java
• Frameworks: React, Node.js, Express
• Tools: Git, Docker, Jenkins
• Languages: English (Fluent)`;
  }
  
  // Split the resume into sections
  const lines = resumeText.split('\n');
  
  // Add a professional summary
  let improved = `PROFESSIONAL SUMMARY
Dedicated and results-driven ${targetRole} with a proven track record of delivering impactful solutions in the ${targetIndustry} industry. Strong technical expertise combined with excellent communication and collaboration skills. Experienced in Canadian work environments with a focus on innovation and continuous improvement.

`;
  
  // Add the original content with some enhancements
  improved += lines.map(line => {
    // Add Canadian-specific enhancements
    if (line.toLowerCase().includes('experience') && !line.toLowerCase().includes('canadian')) {
      return line + ' (with Canadian Standards)';
    }
    
    // Add quantifiable metrics to achievements
    if (line.toLowerCase().includes('develop') || line.toLowerCase().includes('implement') || line.toLowerCase().includes('lead')) {
      return line + ' resulting in 30% improvement in efficiency';
    }
    
    // Add Canadian-specific skills
    if (line.toLowerCase().includes('skills')) {
      return line + '\n• Familiar with Canadian workplace culture and standards\n• Cross-cultural communication';
    }
    
    return line;
  }).join('\n');
  
  // Add a new section for Canadian market fit
  improved += `

CANADIAN MARKET RELEVANCE
• Familiar with Canadian ${targetIndustry} industry standards and regulations
• Excellent adaptability to diverse team environments
• Strong understanding of Canadian workplace culture
• Committed to continuous professional development in the Canadian ${targetIndustry} sector
`;
  
  return improved;
}

/**
 * Main API endpoint for resume improvement
 */
export async function POST(request: Request) {
  console.log('📝 Resume improvement API route called');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body received, parsing...');
    
    const { resumeData, targetRole, targetIndustry, analysisResult } = body;
    
    // Validate inputs
    if (!targetRole || !targetIndustry) {
      console.error('❌ Missing required fields in request');
      return NextResponse.json(
        { error: 'Target role and industry are required' },
        { status: 400 }
      );
    }
    
    // Extract resume text
    let resumeText = '';
    if (typeof resumeData === 'string') {
      resumeText = resumeData;
    } else if (typeof resumeData === 'object') {
      if (resumeData.rawText && typeof resumeData.rawText === 'string') {
        resumeText = resumeData.rawText;
      }
    }
    
    console.log('📄 Resume text extracted:', {
      textLength: resumeText?.length || 0
    });
    
    // MOCK MODE: Return mock data immediately without further processing
    if (MOCK_MODE) {
      console.log('🔄 Using MOCK mode, returning simulated improved resume');
      
      // Add a slight delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock improved resume
      const improvedResume = generateMockImprovedResume(resumeText, targetRole, targetIndustry);
      
      console.log('✅ Returning mock improved resume');
      return NextResponse.json({
        improvedResume,
        _notice: "This is a simulated improved resume for demonstration purposes"
      });
    }
    
    // If we get here, use GenAI to improve the resume
    if (!resumeText) {
      console.error('❌ No resume text found in request');
      return NextResponse.json(
        { error: 'No resume text found in request' },
        { status: 400 }
      );
    }
    
    try {
      // Call GenAI to improve the resume - using only 4 parameters
      const result = await improveResume(resumeText, targetRole, targetIndustry, analysisResult);
      
      console.log('✅ Resume improvement completed successfully');
      return NextResponse.json({ improvedResume: result });
    } catch (error: any) {
      console.error('❌ Error during resume improvement:', error);
      
      // If we have fallback enabled, use mock data
      if (FALLBACK_TO_MOCK) {
        console.log('🔄 GenAI improvement failed, falling back to mock data');
        const improvedResume = generateMockImprovedResume(resumeText, targetRole, targetIndustry);
        
        return NextResponse.json({
          improvedResume,
          _notice: "This is a mock improved resume because the AI improvement failed: " + error.message
        });
      }
      
      // Otherwise return an error
      return NextResponse.json(
        { error: 'Resume improvement failed: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle any other errors
    console.error('❌ Uncaught error in resume improvement API:', error);
    
    // If we have fallback enabled, use mock data
    if (FALLBACK_TO_MOCK) {
      return NextResponse.json({
        improvedResume: "An error occurred while generating the improved resume. Please try again later.",
        _notice: "This is a fallback response due to an unexpected error: " + error.message
      });
    }
    
    // Otherwise return an error
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
}