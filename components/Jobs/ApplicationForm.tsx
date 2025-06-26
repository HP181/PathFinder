'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Job } from '@/lib/Firebase/Firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// Define the form schema explicitly
const formSchema = z.object({
  coverLetter: z.string().min(50, { message: 'Cover letter must be at least 50 characters' }),
  useResume: z.boolean(),
});

// Define the FormValues type explicitly matching the schema
type FormValues = {
  coverLetter: string;
  useResume: boolean;
};

interface ApplicationFormProps {
  job: Job;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ApplicationForm({ job, onSubmit, onCancel }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with react-hook-form using the explicit FormValues type
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverLetter: '',
      useResume: true,
    },
  });
  
  // Create a type-safe submit handler
  const handleSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be replaced with a real API call to submit the application
      toast.success('Your application has been successfully submitted.');
      onSubmit();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Glass Card Container */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 opacity-20 blur"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          
          {/* Header */}
          <div className="relative p-8 border-b border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-3 rounded-xl backdrop-blur-sm border border-emerald-400/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  Apply for {job.title}
                </h2>
                <p className="text-gray-300">
                  Submit your application to {job.company}
                </p>
              </div>
            </div>

            {/* Job Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{job.title}</h3>
                  <p className="text-gray-300 text-sm">{job.company} • {job.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Position Type</div>
                  <div className="text-white font-medium">Full-time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="relative p-8">
            <div className="space-y-8">
              {/* Resume Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Resume & Documents</h3>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        {...form.register("useResume")}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-200 block mb-1">
                        Use my uploaded resume
                      </label>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Your most recently uploaded resume will be included with your application. 
                        Make sure your resume is up to date and highlights relevant experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">Cover Letter</h3>
                </div>
                
                <div className="space-y-2">
                  <textarea
                    {...form.register("coverLetter")}
                    placeholder="Write a compelling cover letter explaining why you're the perfect fit for this position..."
                    rows={8}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 resize-none"
                  />
                  <p className="text-xs text-gray-400">
                    Explain why you're interested in this position and how your skills and experience match the requirements (minimum 50 characters)
                  </p>
                  {form.formState.errors.coverLetter && (
                    <p className="text-sm text-red-400">{form.formState.errors.coverLetter.message}</p>
                  )}
                </div>
              </div>

              {/* Application Tips */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-lg border border-cyan-400/20 p-6">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Application Tips
                </h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">•</span>
                    Tailor your cover letter to highlight relevant experience
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">•</span>
                    Mention specific skills from the job requirements
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-2">•</span>
                    Show enthusiasm for the company and role
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative p-8 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-200 hover:text-white rounded-lg transition-all duration-300 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-emerald-500/50 hover:border-emerald-400/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
            
            {/* Privacy Notice */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By submitting this application, you agree to our privacy policy and terms of service. 
                Your information will be shared with {job.company} for recruitment purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Cursor Styling */}
      <style jsx global>{`
        button, a, [role="button"], .cursor-pointer, 
        input[type="checkbox"], textarea {
          cursor: pointer !important;
        }
        
        textarea {
          cursor: text !important;
        }
        
        button:disabled, .disabled {
          cursor: not-allowed !important;
        }

        .hover\\:scale-105:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}