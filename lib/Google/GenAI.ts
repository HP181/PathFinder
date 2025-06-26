// lib/Google/genai.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ParsedResume } from './Document-AI';

// Log environment information for debugging
console.log('🔧 GenAI environment check:');
console.log(`- Node environment: ${process.env.NODE_ENV}`);
console.log(`- API Key: ${process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Not set'}`);

// Initialize the client
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('✅ Initialized GoogleGenerativeAI with API Key');
  } else {
    console.error('❌ No API Key provided for GoogleGenerativeAI');
    console.log('⚠️ Running in mock mode - no real AI will be used');
  }
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI:', error);
  console.log('⚠️ Running in mock mode due to initialization error');
}

// Define models
export const MODELS = {
  GEMINI_PRO: 'gemini-1.5-pro',
  GEMINI_FLASH: 'gemini-1.5-flash',
};

// Default generation configuration
const DEFAULT_CONFIG = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 4096,
};

// Safety settings - relaxed for resume analysis
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
 * Test the connection to the AI service
 */
export const testConnection = async (): Promise<{status: string; message: string}> => {
  console.log('🧪 Testing GenAI connection...');
  
  if (!genAI) {
    return {
      status: 'error',
      message: 'GoogleGenerativeAI not initialized. Check API Key.'
    };
  }
  
  try {
    // Create a model instance
    const model = genAI.getGenerativeModel({ model: MODELS.GEMINI_FLASH });
    
    // Send a simple prompt
    const result = await model.generateContent('Say "Hello, world!" if you can read this.');
    const text = result.response.text();
    
    console.log('✅ Connection test successful:', text);
    return {
      status: 'success',
      message: 'Successfully connected to Google GenAI'
    };
  } catch (error: any) {
    console.error('❌ Connection test failed:', error);
    return {
      status: 'error',
      message: `Failed to connect to Google GenAI: ${error.message}`
    };
  }
};

/**
 * Create a chat instance
 */
export const createChat = (modelName = MODELS.GEMINI_FLASH, config = {}) => {
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized. Check API Key.');
  }
  
  const generationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig,
    safetySettings: SAFETY_SETTINGS
  });
};

/**
 * Create a structured prompt based on parsed resume data
 */
function createStructuredPrompt(
  parsedResume: ParsedResume | null, 
  resumeText: string, 
  targetRole: string, 
  targetIndustry: string
): string {
  // If we have parsed resume data, use it to create a structured prompt
  if (parsedResume) {
    // Format experience
    const experienceSection = parsedResume.experience.map(exp => {
      return `- ${exp.title || 'Position'} at ${exp.company || 'Company'}${exp.location ? ` (${exp.location})` : ''} ${exp.startDate || ''} - ${exp.endDate || 'Present'}
  ${exp.description || 'No description available'}`;
    }).join('\n');

    // Format education
    const educationSection = parsedResume.education.map(edu => {
      return `- ${edu.degree || ''} in ${edu.fieldOfStudy || ''} from ${edu.institution || 'Institution'} ${edu.startDate || ''} - ${edu.endDate || ''}`;
    }).join('\n');

    // Create a structured prompt using the parsed data
    return `Analyze this resume for a ${targetRole} position in the ${targetIndustry} industry for the Canadian job market.

CANDIDATE INFORMATION:
Name: ${parsedResume.name || 'Not specified'}
Email: ${parsedResume.email || 'Not specified'}
Phone: ${parsedResume.phone || 'Not specified'}

PROFESSIONAL SUMMARY:
${parsedResume.summary || 'No summary provided in resume'}

SKILLS:
${parsedResume.skills.join(', ') || 'No skills listed'}

EXPERIENCE:
${experienceSection || 'No experience listed'}

EDUCATION:
${educationSection || 'No education listed'}

CERTIFICATIONS:
${parsedResume.certifications.join(', ') || 'No certifications listed'}

LANGUAGES:
${parsedResume.languages.join(', ') || 'No languages listed'}

Provide detailed feedback with the following sections in JSON format:
1. Strengths (5 specific strengths)
2. Areas for Improvement (5 specific areas to improve)
3. Canadian Market Fit (a paragraph on how well the resume aligns with Canadian expectations)
4. Recommended Changes (5 specific actionable recommendations)
5. Skill Gaps (5 specific skills to develop for this role in Canada)

Format your response as valid JSON with this structure:
{
  "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5"],
  "improvementAreas": ["area1", "area2", "area3", "area4", "area5"],
  "canadianMarketFit": "Detailed paragraph here...",
  "recommendedChanges": ["change1", "change2", "change3", "change4", "change5"],
  "skillGaps": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

Ensure the response is ONLY valid JSON with no markdown formatting or additional text.`;
  } else {
    // If no parsed data is available, use the raw text
    return `Analyze this resume for a ${targetRole} position in the ${targetIndustry} industry for the Canadian job market.

RESUME TEXT:
${resumeText}

Provide detailed feedback with the following sections in JSON format:
1. Strengths (5 specific strengths)
2. Areas for Improvement (5 specific areas to improve)
3. Canadian Market Fit (a paragraph on how well the resume aligns with Canadian expectations)
4. Recommended Changes (5 specific actionable recommendations)
5. Skill Gaps (5 specific skills to develop for this role in Canada)

Format your response as valid JSON with this structure:
{
  "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5"],
  "improvementAreas": ["area1", "area2", "area3", "area4", "area5"],
  "canadianMarketFit": "Detailed paragraph here...",
  "recommendedChanges": ["change1", "change2", "change3", "change4", "change5"],
  "skillGaps": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

Ensure the response is ONLY valid JSON with no markdown formatting or additional text.`;
  }
}

/**
 * Analyze a resume with the given parameters
 */
export const analyzeResume = async (
  resumeUrl: string | null,
  targetRole: string,
  targetIndustry: string,
  resumeText?: string,
  parsedResume?: ParsedResume | null
): Promise<any> => {
  console.log('🔍 Analyzing resume:', { 
    targetRole, 
    targetIndustry, 
    hasUrl: !!resumeUrl, 
    hasText: !!resumeText,
    hasParsedData: !!parsedResume
  });
  
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized. Check API Key.');
  }
  
  try {
    // Create a model instance
    const model = createChat(MODELS.GEMINI_FLASH, {
      maxOutputTokens: 8192, // Larger output for detailed analysis
      temperature: 0.2, // Low temperature for more factual responses
    });
    
    // Create a structured prompt based on parsed data (if available) or raw text
    const prompt = createStructuredPrompt(
      parsedResume || null, 
      resumeText || "No resume text provided.", 
      targetRole, 
      targetIndustry
    );
    
    console.log('🚀 Sending resume to GenAI for analysis...');
    
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
    console.error('❌ Error analyzing resume:', error);
    throw error;
  }
};

/**
 * Improve a resume based on analysis
 */
export const improveResume = async (
  resumeText: string,
  targetRole: string,
  targetIndustry: string,
  analysisResult: any,
  parsedResume?: ParsedResume | null
): Promise<string> => {
  console.log('🔍 Generating improved resume based on analysis');
  
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized. Check API Key.');
  }

  try {
    // Create a model instance
    const model = createChat(MODELS.GEMINI_FLASH, {
      maxOutputTokens: 8192, // Larger output for complete resume
      temperature: 0.3, // Low temperature for more factual responses
    });
    
    // Extract key points from analysis
    const strengths = analysisResult.strengths?.join('\n- ') || '';
    const improvements = analysisResult.improvementAreas?.join('\n- ') || '';
    const recommendations = analysisResult.recommendedChanges?.join('\n- ') || '';
    const skillGaps = analysisResult.skillGaps?.join('\n- ') || '';
    
    // Create the base prompt
    let prompt = `You are a professional resume writer who specializes in creating resumes for the Canadian job market. 
    I need you to improve this resume for a ${targetRole} position in the ${targetIndustry} industry in Canada.`;
    
    // Add structured data if available
    if (parsedResume) {
      prompt += `

CURRENT RESUME STRUCTURE:
Name: ${parsedResume.name || 'Not specified'}
Email: ${parsedResume.email || 'Not specified'}
Phone: ${parsedResume.phone || 'Not specified'}

Skills: ${parsedResume.skills.join(', ') || 'None listed'}

Experience: 
${parsedResume.experience.map(exp => 
  `- ${exp.title || 'Position'} at ${exp.company || 'Company'} (${exp.startDate || ''} - ${exp.endDate || 'Present'})`
).join('\n')}

Education:
${parsedResume.education.map(edu => 
  `- ${edu.degree || ''} in ${edu.fieldOfStudy || ''} from ${edu.institution || 'Institution'}`
).join('\n')}`;
    } else {
      // Add the raw text if no structured data
      prompt += `

CURRENT RESUME:
${resumeText}`;
    }
    
    // Add analysis results
    prompt += `

ANALYSIS RESULTS:

Strengths:
- ${strengths}

Areas for Improvement:
- ${improvements}

Recommended Changes:
- ${recommendations}

Skill Gaps:
- ${skillGaps}

Please rewrite the resume to:
1. Address all the improvement areas and recommended changes
2. Maintain and highlight the existing strengths
3. Add relevant skills and experience for a ${targetRole} in ${targetIndustry} in Canada
4. Use Canadian resume formatting standards
5. Include appropriate keywords for ATS systems
6. Focus on quantifiable achievements and impact
7. Make sure the resume is concise, professional, and well-structured

Return only the improved resume text without any explanations or comments.`;
    
    console.log('🚀 Sending resume improvement request to GenAI...');
    
    // Generate content
    const result = await model.generateContent(prompt);
    const improvedResume = result.response.text();
    
    console.log('📥 Received improved resume from GenAI (length:', improvedResume.length, 'characters)');
    
    return improvedResume;
  } catch (error) {
    console.error('❌ Error improving resume:', error);
    throw error;
  }
};

// Export constants and utility functions
export const AVAILABLE_MODELS = MODELS;
export const isAvailable = () => !!genAI;