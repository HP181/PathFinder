// app/api/upload-resume/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

// Configure file upload paths
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Extract text from a PDF file
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfData = await pdfParse.default(buffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from a DOCX file
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from a TXT file
 */
function extractTextFromTXT(buffer: Buffer): string {
  try {
    return buffer.toString('utf8');
  } catch (error) {
    console.error('Error extracting text from TXT:', error);
    throw new Error('Failed to extract text from TXT');
  }
}

/**
 * Handle resume file upload
 */
export async function POST(request: Request) {
  console.log('📝 Resume upload API route called');
  
  try {
    // Check if request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Check file type
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    console.log('📄 File uploaded:', { name: fileName, type: fileType, size: file.size });
    
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc') && !fileName.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.' },
        { status: 400 }
      );
    }
    
    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileExt = fileName.split('.').pop();
    const newFileName = `resume-${uniqueId}.${fileExt}`;
    const filePath = join(UPLOAD_DIR, newFileName);
    
    // Save the file
    try {
      await writeFile(filePath, buffer);
      console.log('✅ File saved to:', filePath);
    } catch (writeError) {
      console.error('Error saving file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save uploaded file' },
        { status: 500 }
      );
    }
    
    // Extract text from the file
    let extractedText = '';
    try {
      if (fileName.endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(buffer);
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        extractedText = await extractTextFromDOCX(buffer);
      } else if (fileName.endsWith('.txt')) {
        extractedText = extractTextFromTXT(buffer);
      }
      
      console.log('✅ Text extracted, length:', extractedText.length);
    } catch (extractError) {
      console.error('Error extracting text:', extractError);
      return NextResponse.json(
        { error: 'Failed to extract text from the uploaded file' },
        { status: 500 }
      );
    }
    
    // Generate URL for the uploaded file
    const fileUrl = `${BASE_URL}/uploads/${newFileName}`;
    
    // Return success response
    return NextResponse.json({
      url: fileUrl,
      filename: newFileName,
      text: extractedText,
      message: 'File uploaded and processed successfully'
    });
  } catch (error: any) {
    console.error('❌ Uncaught error in resume upload API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + error.message },
      { status: 500 }
    );
  }
}