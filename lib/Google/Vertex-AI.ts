// lib/Google/Vertex-AI.ts
import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';

// Log environment information for debugging
console.log('🔧 Environment check:');
console.log(`- Node environment: ${process.env.NODE_ENV}`);
console.log(`- Vertex AI Project: ${process.env.GOOGLE_VERTEX_AI_PROJECT || 'Not set'}`);
console.log(`- Vertex AI Location: ${process.env.GOOGLE_VERTEX_AI_LOCATION || 'Not set'}`);
console.log(`- Credentials path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Not set'}`);

// Check if credentials file exists
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
let credsExist = false;

if (credPath) {
  try {
    credsExist = fs.existsSync(path.resolve(credPath));
    console.log(`- Credentials file exists: ${credsExist ? '✅' : '❌'}`);
  } catch (error) {
    console.error(`❌ Error checking credentials file:`, error);
  }
}

// Initialize Vertex AI
let vertexai: VertexAI | null = null;
let generativeModel: any = null;

try {
  if (process.env.GOOGLE_VERTEX_AI_PROJECT && process.env.GOOGLE_VERTEX_AI_LOCATION) {
    vertexai = new VertexAI({
      project: process.env.GOOGLE_VERTEX_AI_PROJECT,
      location: process.env.GOOGLE_VERTEX_AI_LOCATION,
    });
    
    // Setup Generative Model
    generativeModel = vertexai.preview.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
    });
    
    console.log('✅ Vertex AI client initialized');
  } else {
    console.warn('⚠️ Missing Vertex AI project or location in environment variables');
  }
} catch (error) {
  console.error('❌ Failed to initialize Vertex AI client:', error);
}

/**
 * Parse JSON response from Vertex AI with robust error handling
 */
function parseJsonResponse(text: string) {
  if (!text) {
    console.error('❌ Empty response text from Vertex AI');
    throw new Error('Empty response text from Vertex AI');
  }

  // Check if response is HTML (usually an auth error)
  if (text.trim().startsWith('<')) {
    console.error('❌ Vertex AI returned HTML (likely an auth or billing error):\n', text.substring(0, 200));
    throw new Error('Authentication error with Vertex AI. Check credentials and billing status.');
  }

  // Try to find JSON in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('❌ Found JSON-like content but failed to parse');
    }
  }

  // Try to parse the text directly
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('❌ Failed to parse Vertex AI response as JSON');
    throw new Error('Invalid JSON response from Vertex AI');
  }
}

/**
 * Test the Vertex AI connection
 */
export const testVertexAIConnection = async (): Promise<{status: string; message: string}> => {
  console.log('🧪 Testing Vertex AI connection...');
  
  if (!generativeModel) {
    return {
      status: 'error',
      message: 'Vertex AI client not initialized. Check environment variables.'
    };
  }
  
  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Return the JSON: {"test": "success"}' }] }],
    });
    
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      parseJsonResponse(text);
      return {
        status: 'success',
        message: 'Successfully connected to Vertex AI'
      };
    } catch (parseError: any) {
      return {
        status: 'error',
        message: `Connected to Vertex AI but received invalid response: ${parseError.message}`
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: `Failed to connect to Vertex AI: ${error.message}`
    };
  }
};

/**
 * Analyze resume text for the Canadian job market
 */
export const analyzeResume = async (
  resumeText: string,
  targetRole: string,
  targetIndustry: string
): Promise<any> => {
  console.log('🔍 Analyzing resume for:', { targetRole, targetIndustry });
  
  if (!generativeModel) {
    throw new Error('Vertex AI client not initialized. Check environment variables.');
  }
  
  // Validate inputs
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('Resume text is required and must be substantial enough for analysis');
  }
  
  if (!targetRole || !targetIndustry) {
    throw new Error('Target role and industry are required');
  }

  // Create the prompt for AI analysis
  const prompt = `
    You are an expert Canadian career coach and resume reviewer. Your goal is to provide comprehensive, 
    actionable feedback on a resume, tailored for the Canadian job market, specifically for the target role 
    and industry provided.
    
    Analyze the following resume text for an immigrant looking to work in Canada:

    Resume Text:
    ${resumeText.length > 10000 ? resumeText.substring(0, 10000) + '... (text truncated due to length)' : resumeText}
    
    Target Role: ${targetRole}
    Target Industry: ${targetIndustry}

    Provide a detailed analysis in JSON format with the following structure:
    {
      "strengths": [
        "Clear and specific strength point 1",
        "Clear and specific strength point 2",
        "Clear and specific strength point 3"
      ],
      "improvementAreas": [
        "Specific area for improvement 1",
        "Specific area for improvement 2",
        "Specific area for improvement 3"
      ],
      "canadianMarketFit": "Detailed paragraph on how well the resume aligns with Canadian standards and expectations",
      "recommendedChanges": [
        "Specific actionable change recommendation 1",
        "Specific actionable change recommendation 2",
        "Specific actionable change recommendation 3",
        "Specific actionable change recommendation 4"
      ],
      "skillGaps": [
        "Specific skill gap for the Canadian job market 1",
        "Specific skill gap for the Canadian job market 2",
        "Specific skill gap for the Canadian job market 3"
      ]
    }

    Be detailed, specific, and actionable in your feedback. Focus on Canadian job market expectations and standards.
    Pay special attention to how the resume could be better tailored for the ${targetRole} role in the ${targetIndustry} industry in Canada.
    
    The response MUST be in valid JSON format. Do not include any explanatory text outside the JSON structure.
  `;

  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseJsonResponse(responseText);
  } catch (error: any) {
    console.error('❌ Vertex AI error:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
};

// Simplified implementation of other functions

export const analyzeCredentialEquivalency = async (
  credential: string,
  country: string,
  industry: string
): Promise<any> => {
  // Implementation...
  throw new Error('Not implemented');
};

export const generateMockInterviewQuestions = async (
  industry: string,
  role: string,
  experienceLevel: string
): Promise<any> => {
  // Implementation...
  throw new Error('Not implemented');
};

export const runVertexAIDiagnostics = async (): Promise<any> => {
  // Implementation...
  throw new Error('Not implemented');
};

export const captureVertexAIHtmlError = async (): Promise<any> => {
  // Implementation...
  throw new Error('Not implemented');
};

// Export the generative model
export const getGenerativeModel = () => generativeModel;