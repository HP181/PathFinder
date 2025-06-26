import { VertexAI } from '@google-cloud/vertexai';

// Initialize the Vertex AI client
const vertexai = new VertexAI({
  project: process.env.GOOGLE_VERTEX_AI_PROJECT || '',
  location: process.env.GOOGLE_VERTEX_AI_LOCATION || '',
});

// The Generative AI model
const generativeModel = vertexai.preview.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.2,
    topP: 0.8,
    topK: 40,
  },
});

interface CredentialEquivalencyResult {
  canadianEquivalent: string;
  requiredLicenses: string[];
  recommendedActions: string[];
  explanation: string;
}

// Generate credential equivalency analysis
export const analyzeCredentialEquivalency = async (
  credential: string,
  country: string,
  industry: string
): Promise<CredentialEquivalencyResult> => {
  try {
    const prompt = `
      Analyze the following credential and provide its Canadian equivalent:
      
      Credential: ${credential}
      Country of Origin: ${country}
      Industry: ${industry}
      
      Please provide:
      1. The Canadian equivalent of this credential
      2. Any required licenses or certifications needed in Canada
      3. Recommended actions for the immigrant to take
      4. A brief explanation of the equivalency
      
      Format the response as JSON with the following structure:
      {
        "canadianEquivalent": "string",
        "requiredLicenses": ["string"],
        "recommendedActions": ["string"],
        "explanation": "string"
      }
    `;
    
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    
    // Added null/undefined checks
    if (!response?.candidates || response.candidates.length === 0) {
      throw new Error('No response generated from Vertex AI');
    }
    
    const text = response.candidates[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No text content in response');
    }
    
    // Parse the JSON response
    return JSON.parse(text) as CredentialEquivalencyResult;
  } catch (error) {
    console.error('Error analyzing credential equivalency:', error);
    throw new Error('Failed to analyze credential equivalency');
  }
};

interface ResumeAnalysisResult {
  strengths: string[];
  improvementAreas: string[];
  canadianMarketFit: string;
  recommendedChanges: string[];
  skillGaps: string[];
}

// Generate resume analysis
export const analyzeResume = async (
  resumeData: any,
  targetRole: string,
  targetIndustry: string
): Promise<ResumeAnalysisResult> => {
  try {
    const prompt = `
      Analyze the following resume data for an immigrant looking to work in Canada:
      
      Resume: ${JSON.stringify(resumeData)}
      Target Role: ${targetRole}
      Target Industry: ${targetIndustry}
      
      Please provide:
      1. Strengths of the resume
      2. Areas for improvement
      3. How well the resume fits the Canadian job market
      4. Recommended changes to make the resume more appealing to Canadian employers
      5. Skill gaps that should be addressed
      
      Format the response as JSON with the following structure:
      {
        "strengths": ["string"],
        "improvementAreas": ["string"],
        "canadianMarketFit": "string",
        "recommendedChanges": ["string"],
        "skillGaps": ["string"]
      }
    `;
    
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    
    // Added null/undefined checks
    if (!response?.candidates || response.candidates.length === 0) {
      throw new Error('No response generated from Vertex AI');
    }
    
    const text = response.candidates[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No text content in response');
    }
    
    // Parse the JSON response
    return JSON.parse(text) as ResumeAnalysisResult;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
};

interface MockInterviewQuestion {
  question: string;
  context: string;
  tips: string[];
}

// Generate mock interview questions
export const generateMockInterviewQuestions = async (
  industry: string,
  role: string,
  experienceLevel: string
): Promise<MockInterviewQuestion[]> => {
  try {
    const prompt = `
      Generate 5 mock interview questions for an immigrant looking for a job in Canada:
      
      Industry: ${industry}
      Role: ${role}
      Experience Level: ${experienceLevel}
      
      For each question, please provide:
      1. The interview question
      2. Context about why this question might be asked
      3. Tips for answering well
      
      Format the response as JSON with the following structure:
      [
        {
          "question": "string",
          "context": "string",
          "tips": ["string"]
        }
      ]
    `;
    
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    
    // Added null/undefined checks
    if (!response?.candidates || response.candidates.length === 0) {
      throw new Error('No response generated from Vertex AI');
    }
    
    const text = response.candidates[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No text content in response');
    }
    
    // Parse the JSON response
    return JSON.parse(text) as MockInterviewQuestion[];
  } catch (error) {
    console.error('Error generating mock interview questions:', error);
    throw new Error('Failed to generate mock interview questions');
  }
};