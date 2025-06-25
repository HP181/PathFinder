import { VertexAI, GenerateContentResult } from '@google-cloud/vertexai';

/**
 * Initialize the Vertex AI client
 * @returns A configured Vertex AI instance
 */
const initializeVertexAI = (): VertexAI => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION;
  
  if (!projectId || !location) {
    throw new Error('Missing Google Cloud configuration: GOOGLE_PROJECT_ID or GOOGLE_LOCATION');
  }
  
  return new VertexAI({
    project: projectId,
    location: location,
  });
};

/**
 * Helper function to safely extract text from Vertex AI response
 * @param response The response from Vertex AI
 * @returns The extracted text or empty string if not available
 */
const extractTextFromResponse = (response: GenerateContentResult): string => {
  // Check if candidates exist and are non-empty
  if (!response.response?.candidates || response.response.candidates.length === 0) {
    throw new Error('No response generated from Vertex AI');
  }
  
  // Get the first candidate
  const candidate = response.response.candidates[0];
  
  // Extract parts from content (or empty array if undefined)
  const contentParts = candidate.content?.parts || [];
  
  // Extract text from the first part (or empty string if undefined)
  return contentParts[0]?.text || '';
};

// Interface for resume analysis response
interface ResumeAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// Interface for job recommendation
interface JobRecommendation {
  title: string;
  description: string;
  matchScore: number;
}

// Interface for interview question
interface InterviewQuestion {
  question: string;
  difficulty: string;
  category: string;
}

/**
 * Analyzes resume data using Google Vertex AI
 * @param resumeData The resume data to analyze
 * @returns Analysis of the resume
 */
export const analyzeResume = async (resumeData: any): Promise<ResumeAnalysisResult> => {
  try {
    // Initialize the Vertex AI client
    const vertexAI = initializeVertexAI();
    
    // Get the generative model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
    });
    
    // Prepare the prompt with instructions
    const prompt = `
      Analyze this resume data and provide:
      1. Top 3 strengths
      2. Areas for improvement
      3. Recommendations for career growth
      
      Resume data: ${JSON.stringify(resumeData)}
      
      Format your response as JSON with these keys: strengths, weaknesses, recommendations.
    `;
    
    // Generate content
    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    // Extract text from response
    const resultText = extractTextFromResponse(response);
    
    // Parse the JSON response
    try {
      const parsedResult = JSON.parse(resultText) as ResumeAnalysisResult;
      return {
        strengths: parsedResult.strengths || [],
        weaknesses: parsedResult.weaknesses || [],
        recommendations: parsedResult.recommendations || [],
      };
    } catch (parseError) {
      console.error('Failed to parse Vertex AI response as JSON:', parseError);
      return {
        strengths: [],
        weaknesses: [],
        recommendations: [resultText], // Use the raw text as a recommendation if parsing fails
      };
    }
  } catch (error) {
    console.error('Error analyzing resume with Vertex AI:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze resume');
  }
};

/**
 * Generates job recommendations based on skills
 * @param skills Array of skills to base recommendations on
 * @returns Array of job recommendations
 */
export const generateJobRecommendations = async (skills: string[]): Promise<JobRecommendation[]> => {
  try {
    // Initialize the Vertex AI client
    const vertexAI = initializeVertexAI();
    
    // Get the generative model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
    });
    
    // Prepare the prompt
    const prompt = `
      Based on these skills: ${skills.join(', ')}
      
      Recommend 5 suitable jobs. Format your response as a JSON array with objects having these properties:
      - title: the job title
      - description: a brief description of the job
      - matchScore: a number from 1-100 indicating how well the skills match the job
    `;
    
    // Generate content
    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    // Extract text from response
    const resultText = extractTextFromResponse(response);
    
    // Parse the JSON response
    try {
      return JSON.parse(resultText) as JobRecommendation[];
    } catch (parseError) {
      console.error('Failed to parse job recommendations as JSON:', parseError);
      // Return a single job with the raw text as fallback
      return [{
        title: 'Recommendation',
        description: resultText,
        matchScore: 50,
      }];
    }
  } catch (error) {
    console.error('Error generating job recommendations:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate job recommendations');
  }
};

/**
 * Generates interview questions based on job description
 * @param jobDescription The job description to generate questions for
 * @returns Array of interview questions
 */
export const generateInterviewQuestions = async (jobDescription: string): Promise<InterviewQuestion[]> => {
  try {
    // Initialize the Vertex AI client
    const vertexAI = initializeVertexAI();
    
    // Get the generative model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
    });
    
    // Prepare the prompt
    const prompt = `
      Generate 5 technical interview questions for this job: 
      
      ${jobDescription}
      
      Format your response as a JSON array with objects having these properties:
      - question: the full interview question
      - difficulty: "easy", "medium", or "hard"
      - category: the skill area this tests (e.g. "problem-solving", "technical knowledge")
    `;
    
    // Generate content
    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    // Extract text from response
    const resultText = extractTextFromResponse(response);
    
    // Parse the JSON response
    try {
      return JSON.parse(resultText) as InterviewQuestion[];
    } catch (parseError) {
      console.error('Failed to parse interview questions as JSON:', parseError);
      // Return a single question with the raw text as fallback
      return [{
        question: resultText,
        difficulty: 'medium',
        category: 'general',
      }];
    }
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate interview questions');
  }
};

/**
 * Generates a personalized cover letter based on resume and job description
 * @param resumeData The resume data
 * @param jobDescription The job description
 * @returns A generated cover letter
 */
export const generateCoverLetter = async (resumeData: any, jobDescription: string): Promise<string> => {
  try {
    // Initialize the Vertex AI client
    const vertexAI = initializeVertexAI();
    
    // Get the generative model
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
    });
    
    // Prepare the prompt
    const prompt = `
      Generate a personalized cover letter for this job description:
      
      ${jobDescription}
      
      Based on this resume data:
      ${JSON.stringify(resumeData)}
      
      The cover letter should highlight relevant experience and skills that match the job requirements.
    `;
    
    // Generate content
    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    // Extract and return text from response
    return extractTextFromResponse(response);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate cover letter');
  }
};