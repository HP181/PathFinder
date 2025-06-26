// app/api/debug-vertex/route.ts
import { NextResponse } from 'next/server';
import { captureVertexAIHtmlError } from '@/lib/Google/Vertex-AI';

/**
 * Debug endpoint to capture and analyze HTML errors from Vertex AI
 */
export async function GET() {
  console.log('📝 Debug Vertex AI HTML error route called');
  
  try {
    // Capture the HTML error response
    const errorDetails = await captureVertexAIHtmlError();
    
    // Log the results
    if (errorDetails.status === 'error') {
      console.log('📄 Captured HTML error response');
      
      // Look for common error patterns in the HTML
      const htmlContent = errorDetails.htmlResponse || '';
      
      // Check for auth errors
      if (htmlContent.includes('Authentication required') || 
          htmlContent.includes('Not authorized') ||
          htmlContent.includes('Please sign in')) {
        console.log('🔑 Authentication error detected');
        errorDetails.errorType = 'authentication';
      } 
      // Check for billing errors
      else if (htmlContent.includes('billing') || 
               htmlContent.includes('payment') || 
               htmlContent.includes('upgrade your account')) {
        console.log('💰 Billing error detected');
        errorDetails.errorType = 'billing';
      }
      // Check for quota errors 
      else if (htmlContent.includes('quota') || 
               htmlContent.includes('rate limit') || 
               htmlContent.includes('too many requests')) {
        console.log('⚠️ Quota/rate limit error detected');
        errorDetails.errorType = 'quota';
      }
      // Check for proxy/network errors
      else if (htmlContent.includes('proxy') || 
               htmlContent.includes('network') || 
               htmlContent.includes('connection')) {
        console.log('🌐 Proxy/network error detected');
        errorDetails.errorType = 'network';
      }
      // Default to unknown
      else {
        console.log('❓ Unknown error type');
        errorDetails.errorType = 'unknown';
      }
    } else {
      console.log('✅ No HTML error detected, Vertex AI is responding correctly');
    }
    
    // Return the result
    return NextResponse.json(errorDetails);
  } catch (error: any) {
    console.error('❌ Error in debug route:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error in debug route: ' + error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}