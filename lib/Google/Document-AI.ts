import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { storage } from '../Firebase/Config';
import { ref, getBytes } from 'firebase/storage';

/**
 * Interface representing the parsed resume structure
 */
interface ParsedResume {
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

/**
 * Parses a resume PDF using Google Document AI
 * @param resumeUrl The Firebase storage URL to the resume PDF
 * @returns A structured ParsedResume object
 */
export const parseResume = async (resumeUrl: string): Promise<ParsedResume> => {
  try {
    // Get the file from Firebase Storage
    const storageRef = ref(storage, resumeUrl);
    const fileBuffer = await getBytes(storageRef);
    
    // Initialize the Document AI client
    const client = new DocumentProcessorServiceClient();

    // The full resource name of the processor
    const processorName = `projects/${process.env.GOOGLE_DOCUMENT_AI_PROJECT}/locations/${process.env.GOOGLE_DOCUMENT_AI_LOCATION}/processors/${process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID}`;

    // Convert the file to base64 - fixed to use Buffer
    const encodedFile = Buffer.from(fileBuffer).toString('base64');
    
    // Process the document
    const [result] = await client.processDocument({
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

    // Extract entities from the document
    const entities = document.entities || [];

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

    return parsedResume;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to parse resume');
  }
};