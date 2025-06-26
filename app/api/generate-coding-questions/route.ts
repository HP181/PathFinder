// app/api/generate-coding-questions/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { getUserProfile } from '@/lib/Firebase/Firestore';
import { storage } from '@/lib/Firebase/Config';
import { ref, getBytes } from 'firebase/storage';

// Configuration
const MOCK_MODE = process.env.CODING_QUESTIONS_MOCK_MODE === 'true';
const FALLBACK_TO_MOCK = process.env.CODING_QUESTIONS_FALLBACK_TO_MOCK === 'true';

// Initialize GenAI
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('✅ Initialized GoogleGenerativeAI for coding questions');
  } else {
    console.error('❌ No API Key provided for GoogleGenerativeAI');
    console.log('⚠️ Running in mock mode for coding questions');
  }
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI for coding questions:', error);
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
 * Extract text from a PDF resume
 */
async function extractResumeText(resumeUrl: string): Promise<string | null> {
  try {
    console.log('📄 Extracting text from resume:', resumeUrl);
    
    // Get the file from Firebase Storage
    const storageRef = ref(storage, resumeUrl);
    const fileBuffer = await getBytes(storageRef);
    console.log(`✅ Downloaded resume file (${fileBuffer.byteLength} bytes)`);
    
    // Convert to text (simplified approach)
    // For a real implementation, use a PDF parsing library
    const text = Buffer.from(fileBuffer).toString('utf8');
    
    // Clean up the extracted text (remove non-printable characters)
    const cleanedText = text.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    
    // Extract only ASCII text content
    const asciiText = cleanedText.replace(/[^\x20-\x7E\n]/g, '');
    
    console.log(`✅ Extracted approximately ${asciiText.length} characters from resume`);
    
    return asciiText.length > 100 ? asciiText : null;
  } catch (error) {
    console.error('❌ Error extracting text from resume:', error);
    return null;
  }
}

/**
 * Fixed function to parse potentially malformed JSON from GenAI
 */
function parseResponseJson(responseText: string) {
  console.log('Attempting to parse GenAI response...');
  
  try {
    // First try simple JSON parsing
    return JSON.parse(responseText);
  } catch (error) {
    console.log('Standard JSON parsing failed, attempting to fix common issues...');
    
    // Common error: Missing commas, incorrect separators, etc.
    try {
      // Fix q4 issue with double colons
      let fixedText = responseText.replace(/"id": "q4": "/, '"id": "q4", "question": "');
      
      // Fix other common issues
      fixedText = fixedText.replace(/"id": "q\d+":\s*"/, (match) => {
        return match.replace(':', ', "question": "');
      });
      
      // Try parsing again
      return JSON.parse(fixedText);
    } catch (error) {
      console.log('First fix attempt failed, trying deeper repair...');
      
      // If that didn't work, try a more manual approach to extract the data
      try {
        // Extract title
        const titleMatch = responseText.match(/"title": "([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : "Coding Assessment";
        
        // Extract description
        const descMatch = responseText.match(/"description": "([^"]+)"/);
        const description = descMatch ? descMatch[1] : "Coding assessment based on your resume";
        
        // Extract questions using regex
        const questionsData = [];
        const questionRegex = /"id": "([^"]+)"[,:]?\s*(?:"question": )?["']?([^"]+?)["']?,\s*"difficulty": "([^"]+)",\s*"category": "([^"]+)",\s*"expectedOutput": "([^"]+)"/g;
        
        let match;
        while ((match = questionRegex.exec(responseText)) !== null) {
          questionsData.push({
            id: match[1],
            question: match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
            difficulty: match[3],
            category: match[4],
            expectedOutput: match[5].replace(/\\n/g, '\n').replace(/\\"/g, '"')
          });
        }
        
        // If we couldn't extract questions, throw error
        if (questionsData.length === 0) {
          throw new Error('Could not extract questions from response');
        }
        
        return {
          title,
          description,
          questions: questionsData
        };
      } catch (deepError) {
        console.error('Deep repair failed:', deepError);
        
        // If all else fails, use raw text for manual inspection
        console.log('All parsing attempts failed. Raw response:', responseText);
        
        // Create a very basic structure so we can still proceed
        return {
          title: "Coding Assessment",
          description: "This assessment had parsing issues but we created basic questions",
          questions: [
            {
              id: "q1",
              question: "Parse a JSON string and handle potential errors",
              difficulty: "medium",
              category: "Error Handling",
              expectedOutput: "Function should return a valid object or throw a helpful error"
            },
            // Add a few more generic questions
            {
              id: "q2",
              question: "Create a function that validates user input for a form",
              difficulty: "easy",
              category: "Input Validation",
              expectedOutput: "Function should return true for valid input and false for invalid input"
            },
            {
              id: "q3",
              question: "Implement a basic caching mechanism for API responses",
              difficulty: "medium",
              category: "Performance",
              expectedOutput: "Function should return cached response if available, otherwise fetch and cache new response"
            }
          ]
        };
      }
    }
  }
}

/**
 * Generate coding questions based on resume content - UPDATED with language-neutral approach
 */
async function generateQuestions(resumeText: string): Promise<any> {
  console.log('🔍 Generating coding questions based on resume');
  
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized. Check API Key.');
  }
  
  try {
    // Create a model instance
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
      },
      safetySettings: SAFETY_SETTINGS
    });
    
    // Create the prompt - UPDATED for language-neutral questions
    const prompt = `You are an expert technical interviewer. I need you to analyze this resume and create 5 coding questions tailored to the candidate's experience and skills. The questions should help assess their coding abilities for potential employment in Canada.

RESUME TEXT:
${resumeText}

Generate 5 coding questions that:
1. Match the technologies and skills mentioned in the resume
2. Include a mix of difficulty levels (easy, medium, hard)
3. Cover different areas relevant to the candidate's background
4. Are generic algorithm or problem-solving questions that can be answered in ANY programming language
5. Include expected output or acceptance criteria where appropriate

IMPORTANT GUIDELINES:
- Do NOT specify a programming language in the question (like "Implement in Python" or "Create a React component")
- Questions should be language-agnostic - the user will choose which language to use
- Focus on general programming concepts, algorithms, data structures, and problem-solving
- Avoid framework-specific questions (like FastAPI, React, Angular, etc.)
- Do not mention specific libraries or technologies in the questions themselves
- Make questions concise and clear with specific inputs/outputs

Format your response as valid JSON following EXACTLY this structure:
{
  "title": "Coding Assessment based on Resume Analysis",
  "description": "This assessment is tailored to your experience in [main technologies from resume]",
  "questions": [
    {
      "id": "q1",
      "question": "Detailed question text...",
      "difficulty": "easy|medium|hard",
      "category": "category name",
      "expectedOutput": "Expected output or acceptance criteria"
    }
  ]
}

CRITICAL: Each question must have these exact properties: "id", "question", "difficulty", "category", and "expectedOutput".
DO NOT include additional properties. DO NOT use colons inside property keys.
Ensure the generated JSON is valid and properly formatted. All strings must be in double quotes.

Make questions practical, not theoretical, and specific enough that the candidate can write actual code to solve them in any language of their choice.`;
    
    console.log('🚀 Sending question generation request to GenAI...');
    
    // Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('📥 Received response from GenAI (length:', responseText.length, 'characters)');
    
    // Use the improved parsing function
    const parsedResult = parseResponseJson(responseText);
    
    // Add UUIDs to questions
    parsedResult.questions = parsedResult.questions.map((q: any) => ({
      ...q,
      id: uuidv4()
    }));
    
    console.log('✅ Successfully processed and fixed response');
    return parsedResult;
  } catch (error) {
    console.error('❌ Error generating coding questions:', error);
    throw error;
  }
}

/**
 * Generate mock coding questions
 */
function generateMockQuestions(): any {
  console.log('🧪 Generating mock coding questions');
  
  return {
    id: uuidv4(),
    title: "Coding Assessment Based on Resume Analysis",
    description: "This assessment is tailored to your experience in web development with JavaScript, React, and Node.js",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "not_started",
    questions: [
      {
        id: uuidv4(),
        question: "Write a function that takes an array of integers and returns the two numbers that add up to a specific target. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)",
        difficulty: "easy",
        category: "algorithms",
        expectedOutput: "Function should return the indices of the two numbers that add up to the target."
      },
      {
        id: uuidv4(),
        question: "Implement a function that checks if a string is a valid palindrome, considering only alphanumeric characters and ignoring cases.\n\nExample:\nInput: 'A man, a plan, a canal: Panama'\nOutput: true",
        difficulty: "easy",
        category: "string manipulation",
        expectedOutput: "Function should return a boolean indicating whether the input string is a palindrome."
      },
      {
        id: uuidv4(),
        question: "Implement a debounce function that limits how often a function can be called. The function should return a new function that can only be called once per specified time period.\n\nExample usage: When a user is typing in a search box, you want to limit API calls to once every 500ms after they stop typing.",
        difficulty: "medium",
        category: "function optimization",
        expectedOutput: "A debounce function that delays invoking the provided function until after a specified wait time has elapsed since the last time it was invoked."
      },
      {
        id: uuidv4(),
        question: "Create a function that performs a deep comparison between two objects to determine if they are equal. Two objects are considered equal when they have the same properties, values, and nested objects.\n\nExample:\nInput: obj1 = {a: 1, b: {c: 2}}, obj2 = {a: 1, b: {c: 2}}\nOutput: true",
        difficulty: "hard",
        category: "object comparison",
        expectedOutput: "Function should return a boolean indicating whether the two input objects are deeply equal."
      },
      {
        id: uuidv4(),
        question: "Implement a cache system with a Least Recently Used (LRU) eviction policy. The cache should have a maximum capacity and remove the least recently used items when it reaches capacity.\n\nThe cache should support the following operations: get(key), put(key, value), and should perform both operations in O(1) time complexity.",
        difficulty: "hard",
        category: "data structures",
        expectedOutput: "An implementation of an LRU cache with get and put methods that operate in O(1) time complexity."
      }
    ]
  };
}

/**
 * Main API endpoint for generating coding questions
 */
export async function POST(request: Request) {
  console.log('📝 Generate coding questions API route called');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body received, parsing...');
    
    const { userId, resumeUrl } = body;
    
    // Validate inputs
    if (!userId) {
      console.error('❌ Missing user ID');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // MOCK MODE: Return mock data immediately without further processing
    if (MOCK_MODE) {
      console.log('🔄 Using MOCK mode, returning simulated coding questions');
      
      // Add a slight delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock questions
      const mockResult = generateMockQuestions();
      
      console.log('✅ Returning mock coding questions');
      return NextResponse.json(mockResult);
    }
    
    // If resume URL wasn't provided, try to get it from the user's profile
    let resumeUrlToUse = resumeUrl;
    if (!resumeUrlToUse) {
      console.log('🔍 Resume URL not provided, fetching from profile');
      const profile = await getUserProfile(userId);
      
      if (!profile || !profile.resumeUrl) {
        console.error('❌ Resume URL not found in profile');
        
        if (FALLBACK_TO_MOCK) {
          console.log('🔄 Falling back to mock questions');
          return NextResponse.json(generateMockQuestions());
        }
        
        return NextResponse.json(
          { error: 'Resume URL not found. Please upload a resume first.' },
          { status: 400 }
        );
      }
      
      resumeUrlToUse = profile.resumeUrl;
    }
    
    console.log('📄 Using resume URL:', resumeUrlToUse);
    
    // Extract text from the resume
    const resumeText = await extractResumeText(resumeUrlToUse);
    
    if (!resumeText) {
      console.error('❌ Failed to extract text from resume');
      
      if (FALLBACK_TO_MOCK) {
        console.log('🔄 Falling back to mock questions');
        return NextResponse.json(generateMockQuestions());
      }
      
      return NextResponse.json(
        { error: 'Failed to extract text from resume' },
        { status: 500 }
      );
    }
    
    // Generate questions based on the resume
    try {
      const questions = await generateQuestions(resumeText);
      
      // Add assessment metadata
      const assessment = {
        id: uuidv4(),
        ...questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'not_started'
      };
      
      console.log('✅ Successfully generated coding questions');
      return NextResponse.json(assessment);
    } catch (error: any) {
      console.error('❌ Error generating questions:', error);
      
      if (FALLBACK_TO_MOCK) {
        console.log('🔄 Falling back to mock questions');
        return NextResponse.json(generateMockQuestions());
      }
      
      return NextResponse.json(
        { error: 'Failed to generate coding questions: ' + error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle any other errors
    console.error('❌ Uncaught error in generate coding questions API:', error);
    
    if (FALLBACK_TO_MOCK) {
      console.log('🔄 Falling back to mock questions due to error');
      return NextResponse.json(generateMockQuestions());
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
}