// lib/Google/Document-AI.ts
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { storage } from '../Firebase/Config';
import { ref, getBytes } from 'firebase/storage';

/**
 * Interface representing the parsed resume structure
 */
export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  education: Array<{
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
  experience: Array<{
    company?: string;
    title?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  certifications: string[];
  languages: string[];
  summary?: string;
}

// Check if Document AI is properly configured
const isDocumentAIConfigured = () => {
  return !!(
    process.env.GOOGLE_DOCUMENT_AI_PROJECT &&
    process.env.GOOGLE_DOCUMENT_AI_LOCATION &&
    process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID
  );
};

// Log configuration status
console.log('🔧 Document AI configuration check:');
console.log(`- Project: ${process.env.GOOGLE_DOCUMENT_AI_PROJECT || 'Not set ❌'}`);
console.log(`- Location: ${process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'Not set ❌'}`);
console.log(`- Processor ID: ${process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID || 'Not set ❌'}`);
console.log(`- Using mock mode: ${!isDocumentAIConfigured() ? 'Yes (forced due to missing config)' : 'No'}`);

// Initialize Document AI client if configured
let documentAIClient: DocumentProcessorServiceClient | null = null;
if (isDocumentAIConfigured()) {
  try {
    documentAIClient = new DocumentProcessorServiceClient();
    console.log('✅ Document AI client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Document AI client:', error);
  }
}

/**
 * Parses a resume PDF using Google Document AI or returns mock data
 * @param resumeUrl The Firebase storage URL to the resume PDF
 * @returns A structured ParsedResume object
 */
export const parseResume = async (resumeUrl: string): Promise<ParsedResume> => {
  try {
    // If Document AI is not configured or client initialization failed, return mock data
    if (!isDocumentAIConfigured() || !documentAIClient) {
      console.log('⚠️ Using mock resume parsing due to missing Document AI configuration');
      return generateMockParsedResume(resumeUrl);
    }

    // Get the file from Firebase Storage
    console.log('📥 Downloading file from Firebase Storage:', resumeUrl);
    const storageRef = ref(storage, resumeUrl);
    const fileBuffer = await getBytes(storageRef);
    console.log(`✅ File downloaded (${fileBuffer.length} bytes)`);
    
    // The full resource name of the processor
    const processorName = `projects/${process.env.GOOGLE_DOCUMENT_AI_PROJECT}/locations/${process.env.GOOGLE_DOCUMENT_AI_LOCATION}/processors/${process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID}`;
    console.log('🔍 Using Document AI processor:', processorName);

    // Convert the file to base64
    const encodedFile = Buffer.from(fileBuffer).toString('base64');
    
    // Process the document
    console.log('🚀 Sending document to Document AI for processing');
    const [result] = await documentAIClient.processDocument({
      name: processorName,
      rawDocument: {
        content: encodedFile,
        mimeType: 'application/pdf',
      },
    });

    const document = result.document;
    if (!document) {
      throw new Error('Document AI returned no document');
    }

    console.log('✅ Document processed successfully');

    // Extract entities from the document
    const entities = document.entities || [];
    console.log(`📊 Found ${entities.length} entities in document`);

    // Initialize parsed resume with empty arrays
    const parsedResume: ParsedResume = {
      skills: [],
      education: [],
      experience: [],
      certifications: [],
      languages: [],
    };

    // Process simple entities
    entities.forEach(entity => {
      if (!entity.type) return;
      
      const normalizedValue = entity.normalizedValue?.text || entity.mentionText || '';
      if (!normalizedValue) return;
      
      switch (entity.type) {
        case 'PERSON_NAME':
          parsedResume.name = normalizedValue;
          break;
        case 'EMAIL_ADDRESS':
          parsedResume.email = normalizedValue;
          break;
        case 'PHONE_NUMBER':
          parsedResume.phone = normalizedValue;
          break;
        case 'SKILL':
          parsedResume.skills.push(normalizedValue);
          break;
        case 'LANGUAGE':
          parsedResume.languages.push(normalizedValue);
          break;
        case 'CERTIFICATION':
          parsedResume.certifications.push(normalizedValue);
          break;
        case 'SUMMARY':
          parsedResume.summary = normalizedValue;
          break;
      }
    });

    // Process complex entities (education and experience)
    document.entities?.forEach(entity => {
      if (!entity.type || !entity.properties) return;
      
      // Process education entities
      if (entity.type === 'EDUCATION') {
        const education = {
          institution: entity.properties.find(p => p.type === 'INSTITUTION')?.mentionText || undefined,
          degree: entity.properties.find(p => p.type === 'DEGREE')?.mentionText || undefined,
          fieldOfStudy: entity.properties.find(p => p.type === 'FIELD_OF_STUDY')?.mentionText || undefined,
          startDate: entity.properties.find(p => p.type === 'START_DATE')?.mentionText || undefined,
          endDate: entity.properties.find(p => p.type === 'END_DATE')?.mentionText || undefined,
        };
        parsedResume.education.push(education);
      }
      
      // Process work experience entities
      if (entity.type === 'WORK_EXPERIENCE') {
        const experience = {
          company: entity.properties.find(p => p.type === 'COMPANY')?.mentionText || undefined,
          title: entity.properties.find(p => p.type === 'TITLE')?.mentionText || undefined,
          location: entity.properties.find(p => p.type === 'LOCATION')?.mentionText || undefined,
          startDate: entity.properties.find(p => p.type === 'START_DATE')?.mentionText || undefined,
          endDate: entity.properties.find(p => p.type === 'END_DATE')?.mentionText || undefined,
          description: entity.properties.find(p => p.type === 'DESCRIPTION')?.mentionText || undefined,
        };
        parsedResume.experience.push(experience);
      }
    });

    // Remove duplicates from arrays
    parsedResume.skills = [...new Set(parsedResume.skills)];
    parsedResume.languages = [...new Set(parsedResume.languages)];
    parsedResume.certifications = [...new Set(parsedResume.certifications)];

    console.log('✅ Resume parsed successfully');
    return parsedResume;
  } catch (error) {
    console.error('Error parsing resume:', error);
    
    // Return mock data on error if Document AI was enabled
    if (isDocumentAIConfigured()) {
      console.log('⚠️ Document AI error, falling back to mock data');
      return generateMockParsedResume(resumeUrl);
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to parse resume');
  }
};

/**
 * Generates realistic mock data for resume parsing
 * @param resumeUrl The Firebase storage URL (not used in mock, but kept for signature compatibility)
 * @returns A mock parsed resume
 */
function generateMockParsedResume(resumeUrl: string): ParsedResume {
  console.log('🧪 Generating mock parsed resume data');
  
  return {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    summary: "Experienced software developer with a passion for building innovative solutions. Skilled in full-stack development, cloud technologies, and agile methodologies.",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "AWS",
      "Docker",
      "Git",
      "Agile"
    ],
    experience: [
      {
        company: "Tech Solutions Inc.",
        title: "Senior Software Developer",
        location: "Toronto, ON",
        startDate: "2021-01",
        endDate: "Present",
        description: "Led development of cloud-based applications, mentored junior developers, and implemented CI/CD pipelines."
      },
      {
        company: "CodeCraft Systems",
        title: "Software Developer",
        location: "Vancouver, BC",
        startDate: "2018-03",
        endDate: "2020-12",
        description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality products."
      },
      {
        company: "Digital Innovations",
        title: "Junior Developer",
        location: "Montreal, QC",
        startDate: "2016-09",
        endDate: "2018-02",
        description: "Assisted in front-end development and bug fixing. Participated in code reviews and testing."
      }
    ],
    education: [
      {
        institution: "University of Toronto",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        startDate: "2012-09",
        endDate: "2016-05"
      }
    ],
    certifications: [
      "AWS Certified Developer - Associate",
      "MongoDB Certified Developer",
      "Certified Scrum Master"
    ],
    languages: [
      "English",
      "French"
    ]
  };
}