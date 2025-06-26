// app/api/review-coding-answers/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getCodingAssessment } from '@/lib/Firebase/Firestore';

// Configuration
const MOCK_MODE = process.env.CODING_REVIEW_MOCK_MODE === 'true';
const FALLBACK_TO_MOCK = process.env.CODING_REVIEW_FALLBACK_TO_MOCK === 'true';

// Initialize GenAI
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('✅ Initialized GoogleGenerativeAI for coding review');
  } else {
    console.error('❌ No API Key provided for GoogleGenerativeAI');
    console.log('⚠️ Running in mock mode for coding review');
  }
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI for coding review:', error);
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
 * Review coding answers using GenAI
 */
async function reviewCodingAnswer(question: string, answer: string, language: string, expectedOutput?: string): Promise<any> {
  console.log('🔍 Reviewing coding answer');
  
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized. Check API Key.');
  }
  
  try {
    // Create a model instance
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 4096,
      },
      safetySettings: SAFETY_SETTINGS
    });
    
    // Create the prompt
    const prompt = `You are an expert coding interviewer and instructor. Please review this coding solution and provide detailed, constructive feedback.

QUESTION:
${question}

${expectedOutput ? `EXPECTED OUTPUT/CRITERIA:\n${expectedOutput}\n\n` : ''}

CANDIDATE'S SOLUTION (${language}):
\`\`\`${language}
${answer}
\`\`\`

Provide a comprehensive review of this code in JSON format, including:

1. Correctness: Evaluate if the solution correctly solves the problem (score 0-100)
2. Efficiency: Analyze time and space complexity, identify inefficient patterns (score 0-100)
3. Readability: Assess code style, naming, structure, and documentation (score 0-100)
4. Overall score: A weighted average of the above (score 0-100)
5. Detailed feedback: Specific observations about the solution
6. Improvements: Concrete suggestions for how to improve the code

Format your response as valid JSON with this structure:
{
  "correctness": 85,
  "efficiency": 70,
  "readability": 80,
  "overallScore": 78,
  "feedback": "Detailed feedback text here...",
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ]
}

Only provide the JSON with no additional text or explanation.`;
    
    console.log('🚀 Sending code review request to GenAI...');
    
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
    console.error('❌ Error reviewing coding answer:', error);
    throw error;
  }
}

/**
 * Generate mock review for a coding answer
 */
function generateMockReview(questionId: string): any {
  console.log('🧪 Generating mock review for question:', questionId);
  
  // Random scores between 60-95
  const correctness = Math.floor(Math.random() * 36) + 60;
  const efficiency = Math.floor(Math.random() * 36) + 60;
  const readability = Math.floor(Math.random() * 36) + 60;
  const overallScore = Math.floor((correctness + efficiency + readability) / 3);
  
  const reviews = {
    good: [
      "Good use of appropriate data structures",
      "Solution correctly handles the core requirements",
      "Code is generally well-structured and readable",
      "Appropriate use of language features",
      "Solution demonstrates understanding of the problem domain"
    ],
    bad: [
      "Solution may have edge cases that aren't handled",
      "Variable naming could be more descriptive",
      "Missing comments explaining complex logic",
      "Some redundant code that could be simplified",
      "Could improve time/space complexity"
    ]
  };
  
  const improvements = [
    "Add input validation to handle edge cases",
    "Consider using more descriptive variable names",
    "Add comments explaining your thought process",
    "Refactor repeated code into helper functions",
    "Consider a more efficient algorithm to improve time complexity",
    "Add unit tests to verify correctness",
    "Use more modern language features where appropriate"
  ];
  
  // Select feedback based on score
  let feedback = "";
  if (overallScore > 85) {
    feedback = "Your solution is strong overall. " + reviews.good[Math.floor(Math.random() * reviews.good.length)];
    if (correctness < 90) feedback += " " + reviews.bad[0];
    if (efficiency < 90) feedback += " " + reviews.bad[4];
  } else if (overallScore > 70) {
    feedback = "Your solution is good but has some areas for improvement. " + 
               reviews.good[Math.floor(Math.random() * reviews.good.length)] + " " +
               reviews.bad[Math.floor(Math.random() * reviews.bad.length)];
  } else {
    feedback = "Your solution works but needs significant improvements. " + 
               reviews.bad[Math.floor(Math.random() * reviews.bad.length)] + " " + 
               reviews.bad[(Math.floor(Math.random() * reviews.bad.length) + 1) % reviews.bad.length];
  }
  
  // Select 3 random improvement suggestions
  // Fixed: Added explicit type annotation for selectedImprovements
  const selectedImprovements: string[] = [];
  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * improvements.length));
  }
  indices.forEach(i => selectedImprovements.push(improvements[i]));
  
  return {
    correctness,
    efficiency,
    readability,
    overallScore,
    feedback,
    improvements: selectedImprovements,
    reviewedAt: new Date().toISOString()
  };
}

/**
 * Main API endpoint for reviewing coding answers
 */
export async function POST(request: Request) {
  console.log('📝 Review coding answers API route called');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body received, parsing...');
    
    const { userId, assessmentId, answers } = body;
    
    // Validate inputs
    if (!userId || !assessmentId || !answers) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'User ID, assessment ID, and answers are required' },
        { status: 400 }
      );
    }
    
    // MOCK MODE: Return mock data immediately without further processing
    if (MOCK_MODE) {
      console.log('🔄 Using MOCK mode, returning simulated reviews');
      
      // Add a slight delay to simulate API processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the assessment to simulate updating it
      const assessment = await getCodingAssessment(userId, assessmentId);
      
      if (!assessment) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }
      
      // Generate mock reviews for each answer
      const reviews: Record<string, any> = {};
      Object.keys(answers).forEach(questionId => {
        reviews[questionId] = generateMockReview(questionId);
      });
      
      // Update the assessment with reviews
      const updatedAssessment = {
        ...assessment,
        status: 'reviewed',
        answers,
        reviews,
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ Returning mock reviews');
      return NextResponse.json(updatedAssessment);
    }
    
    // Get the assessment to retrieve questions
    const assessment = await getCodingAssessment(userId, assessmentId);
    
    if (!assessment) {
      console.error('❌ Assessment not found');
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    // Prepare to review each answer
    const reviews: Record<string, any> = {};
    const reviewPromises: Promise<void>[] = [];
    
    for (const questionId in answers) {
      const answer = answers[questionId];
      const question = assessment.questions.find(q => q.id === questionId);
      
      if (!question) {
        console.warn(`⚠️ Question ${questionId} not found in assessment`);
        continue;
      }
      
      const reviewPromise = (async () => {
        try {
          const review = await reviewCodingAnswer(
            question.question,
            answer.answer,
            answer.language,
            question.expectedOutput
          );
          
          reviews[questionId] = {
            ...review,
            questionId,
            reviewedAt: new Date().toISOString()
          };
          
          console.log(`✅ Completed review for question ${questionId}`);
        } catch (error) {
          console.error(`❌ Error reviewing answer for question ${questionId}:`, error);
          
          if (FALLBACK_TO_MOCK) {
            console.log(`🔄 Falling back to mock review for question ${questionId}`);
            reviews[questionId] = generateMockReview(questionId);
          }
        }
      })();
      
      reviewPromises.push(reviewPromise);
    }
    
    // Wait for all reviews to complete
    await Promise.all(reviewPromises);
    
    // Update the assessment with reviews
    const updatedAssessment = {
      ...assessment,
      status: 'reviewed',
      answers,
      reviews,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ All answers reviewed successfully');
    return NextResponse.json(updatedAssessment);
  } catch (error: any) {
    // Handle any other errors
    console.error('❌ Uncaught error in review coding answers API:', error);
    
    if (FALLBACK_TO_MOCK) {
      console.log('🔄 Falling back to mock review due to error');
      return NextResponse.json({
        error: 'An unexpected error occurred, falling back to mock review',
        _mockReview: true,
        message: error.message
      });
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
}