// app/api/credential-assessment/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Configuration - read from environment
const MOCK_MODE = process.env.CREDENTIAL_ASSESSMENT_MOCK_MODE === 'true';
const FALLBACK_TO_MOCK = process.env.CREDENTIAL_ASSESSMENT_FALLBACK_TO_MOCK === 'true';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

console.log(`🧪 Credential Assessment API config:`, {
  mockMode: MOCK_MODE,
  fallbackToMock: FALLBACK_TO_MOCK,
  debugMode: DEBUG_MODE
});

// Initialize GenAI
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('✅ Initialized GoogleGenerativeAI for credential assessment');
  } else {
    console.error('❌ No API Key provided for GoogleGenerativeAI');
    console.log('⚠️ Running in mock mode for credential assessment');
  }
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI for credential assessment:', error);
}

// Safety settings
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Assess educational credentials using GenAI
 */
async function assessCredentials(
  credential: string,
  country: string,
  industry: string,
  documentUrl?: string
): Promise<any> {
  console.log('🔍 Assessing credentials:', { credential, country, industry, hasUrl: !!documentUrl });
  
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized. Check API Key.');
  }
  
  try {
    // Create a model instance
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 4096,
      },
      safetySettings: SAFETY_SETTINGS
    });
    
    // Create the prompt
    const prompt = `You are an expert in international educational credential assessment, particularly for immigrants coming to Canada.

I need you to assess the following foreign credential and provide its Canadian equivalent:

- Credential: ${credential}
- Country of Origin: ${country}
- Industry: ${industry}
${documentUrl ? `- Document URL: ${documentUrl}` : ''}

Please provide a comprehensive assessment with the following information in JSON format:

1. "canadianEquivalent": The Canadian equivalent of this credential (e.g., "Bachelor of Science in Computer Science")
2. "requiredLicenses": Array of licenses or certifications needed to practice in Canada with this credential
3. "recommendedActions": Array of specific steps the credential holder should take to maximize recognition in Canada
4. "explanation": A detailed explanation of the equivalency assessment

Your assessment should be based on:
- Educational credential assessment standards in Canada
- Provincial and territorial variation in credential recognition
- Industry-specific requirements
- Regulated vs. non-regulated professions in Canada

Format your response as valid JSON with this structure:
{
  "canadianEquivalent": "string",
  "requiredLicenses": ["string", "string", ...],
  "recommendedActions": ["string", "string", ...],
  "explanation": "string"
}

Ensure your response is accurate, detailed, and follows Canadian credential assessment standards. The response must be valid JSON only, with no additional text.`;
    
    console.log('🚀 Sending credential assessment request to GenAI...');
    
    // Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('📥 Received response from GenAI (length:', responseText.length, 'characters)');
    
    // Parse the response as JSON
    try {
      // First, try to extract JSON from the response if it's not clean JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      
      const result = JSON.parse(jsonText);
      console.log('✅ Successfully parsed response as JSON');
      return result;
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.log('Raw response:', responseText);
      throw new Error('Invalid JSON response from AI service');
    }
  } catch (error) {
    console.error('❌ Error assessing credentials:', error);
    throw error;
  }
}

/**
 * Generate mock credential assessment result
 */
function generateMockAssessment(credential: string, country: string, industry: string): any {
  console.log('🧪 Generating mock credential assessment');
  
  // Map common degrees to Canadian equivalents
  let canadianEquivalent = '';
  let requiredLicenses: string[] = [];
  let recommendedActions: string[] = [];
  let explanation = '';
  
  // Determine Canadian equivalent based on credential and country
  if (credential.toLowerCase().includes('bachelor')) {
    // Bachelor's degree equivalents
    canadianEquivalent = `Bachelor's degree equivalent in ${industry}`;
    
    explanation = `Your ${credential} from ${country} is generally considered equivalent to a Canadian bachelor's degree in ${industry}. The typical Canadian bachelor's degree is a 3-4 year undergraduate program. Educational systems vary by country, so the exact equivalency may depend on the specific institution and program structure.`;
    
  } else if (credential.toLowerCase().includes('master')) {
    // Master's degree equivalents
    canadianEquivalent = `Master's degree equivalent in ${industry}`;
    
    explanation = `Your ${credential} from ${country} is generally considered equivalent to a Canadian master's degree in ${industry}. In Canada, a master's degree typically requires 1-2 years of study after a bachelor's degree. The exact equivalency may depend on the specific institution and program content.`;
    
  } else if (credential.toLowerCase().includes('doctor') || credential.toLowerCase().includes('phd')) {
    // Doctoral degree equivalents
    canadianEquivalent = `Doctoral degree equivalent in ${industry}`;
    
    explanation = `Your ${credential} from ${country} is generally considered equivalent to a Canadian doctoral degree in ${industry}. In Canada, a doctoral degree typically requires 3-5 years of study and original research beyond a master's degree. The exact equivalency may depend on the specific institution and depth of research.`;
    
  } else if (credential.toLowerCase().includes('diploma')) {
    // Diploma equivalents
    canadianEquivalent = `Diploma or Advanced Diploma equivalent in ${industry}`;
    
    explanation = `Your ${credential} from ${country} is generally considered equivalent to a Canadian diploma or advanced diploma in ${industry}. In Canada, diplomas are typically offered by colleges and technical institutions, ranging from 1-3 years of study. The exact equivalency may depend on the program length and content.`;
    
  } else {
    // Default for other credentials
    canadianEquivalent = `Partial equivalent to a Canadian credential in ${industry}`;
    
    explanation = `Your ${credential} from ${country} does not have a direct equivalent in the Canadian education system. However, it may be partially recognized depending on the specific content and duration of your studies. A formal credential assessment by a recognized service is highly recommended.`;
  }
  
  // Generate required licenses based on industry
  if (industry.toLowerCase().includes('health') || 
      industry.toLowerCase().includes('medic') || 
      industry.toLowerCase().includes('nurs')) {
    requiredLicenses = [
      "Provincial College of Physicians and Surgeons registration",
      "Medical Council of Canada Qualifying Examination (MCCQE)",
      "National Assessment Collaboration (NAC) examination"
    ];
  } else if (industry.toLowerCase().includes('engine') || 
             industry.toLowerCase().includes('tech')) {
    requiredLicenses = [
      "Professional Engineer (P.Eng.) license from provincial engineering association",
      "Engineering Intern (EIT) registration",
      "National Professional Practice Examination (NPPE)"
    ];
  } else if (industry.toLowerCase().includes('teach') || 
             industry.toLowerCase().includes('educ')) {
    requiredLicenses = [
      "Provincial Teacher Certification",
      "Language proficiency tests (if applicable)",
      "Subject matter competency assessments"
    ];
  } else if (industry.toLowerCase().includes('account') || 
             industry.toLowerCase().includes('financ')) {
    requiredLicenses = [
      "CPA (Chartered Professional Accountant) designation",
      "Provincial CPA membership",
      "CPA Professional Education Program (PEP)"
    ];
  } else {
    requiredLicenses = [
      `Professional certification relevant to ${industry}`,
      "Proof of language proficiency (IELTS or CELPIP)",
      "Provincial licensing if applicable"
    ];
  }
  
  // Generate recommended actions (generic)
  recommendedActions = [
    "Get an official Educational Credential Assessment (ECA) from a designated organization",
    "Contact the regulatory body for your profession in your target province",
    "Take language proficiency tests (IELTS or CELPIP)",
    "Join professional associations in your field",
    "Consider bridge training programs if available"
  ];
  
  return {
    canadianEquivalent,
    requiredLicenses,
    recommendedActions,
    explanation
  };
}

/**
 * Main API endpoint for credential assessment
 */
export async function POST(request: Request) {
  console.log('📝 Credential assessment API route called');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body received, parsing...');
    
    const { credential, country, industry, documentUrl } = body;
    
    // Validate inputs
    if (!credential || !country || !industry) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Credential, country, and industry are required' },
        { status: 400 }
      );
    }
    
    // MOCK MODE: Return mock data immediately without further processing
    if (MOCK_MODE) {
      console.log('🔄 Using MOCK mode, returning simulated assessment');
      
      // Add a slight delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock assessment
      const mockResult = generateMockAssessment(credential, country, industry);
      
      console.log('✅ Returning mock assessment results');
      return NextResponse.json(mockResult);
    }
    
    // If we get here, use GenAI to assess the credential
    try {
      const result = await assessCredentials(credential, country, industry, documentUrl);
      
      console.log('✅ Credential assessment completed successfully');
      return NextResponse.json(result);
    } catch (assessmentError: any) {
      console.error('❌ Error during credential assessment:', assessmentError);
      
      // If we have fallback enabled, use mock data
      if (FALLBACK_TO_MOCK) {
        console.log('🔄 GenAI assessment failed, falling back to mock data');
        const mockResult = generateMockAssessment(credential, country, industry);
        return NextResponse.json({
          ...mockResult,
          _notice: "This is mock data because the AI assessment failed: " + assessmentError.message
        });
      }
      
      // Otherwise return an error
      return NextResponse.json(
        { error: 'Credential assessment failed: ' + assessmentError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle any other errors
    console.error('❌ Uncaught error in credential assessment API:', error);
    
    // If we have fallback enabled, use mock data
    if (FALLBACK_TO_MOCK) {
      try {
        const body = await request.json();
        const { credential = 'Degree', country = 'International', industry = 'General' } = body;
        
        const mockResult = generateMockAssessment(credential, country, industry);
        return NextResponse.json({
          ...mockResult,
          _notice: "This is mock data due to an unexpected error: " + error.message
        });
      } catch (jsonError) {
        // If we can't parse the request body, just return generic mock data
        return NextResponse.json({
          ...generateMockAssessment('Degree', 'International', 'General'),
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