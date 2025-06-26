'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { uploadResume } from '@/lib/Firebase/Storage';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

export function ResumeUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { profile, updateProfile, loadProfile } = useProfileStore();

  const hasResume = !!profile?.resumeUrl;

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileType = file.type;
    if (fileType !== 'application/pdf' && !fileType.includes('document')) {
      toast.error('Invalid file type. Please upload a PDF or DOC/DOCX file.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large.\nPlease upload a file smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Ensure the profile is loaded
      if (!profile && user?.uid) {
        await loadProfile(user.uid);
      }

      // Upload to Firebase
      const resumeUrl = await uploadResume(user.uid, file);
      await updateProfile({ resumeUrl });
      toast.success('Your resume has been successfully uploaded.');

      // Send to Document AI
      setIsParsing(true);
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume.');
      }

      const { parsedData } = await response.json();
      await updateProfile({ resumeData: parsedData });

      toast.success('Your resume has been successfully analyzed.');
    } catch (error: any) {
      toast.error(
        `Upload failed\n${error.message || 'An error occurred during resume upload.'}`
      );
    } finally {
      setIsUploading(false);
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>
          Upload your resume to help us match you with the right opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
            ${
              hasResume
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-primary/50 dark:hover:bg-gray-800/50'
            }`}
          onClick={handleFileSelect}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading || isParsing}
          />

          {isUploading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploading resume...
              </p>
            </div>
          ) : isParsing ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analyzing resume...
              </p>
            </div>
          ) : hasResume ? (
            <div className="flex flex-col items-center py-4">
              <FileText className="h-10 w-10 text-green-500 mb-2" />
              <p className="font-medium">Resume uploaded</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Click to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
              <p className="font-medium">Click to upload your resume</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PDF, DOC, or DOCX (max 5MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
        We&apos;ll use AI to analyze your resume and help you highlight relevant skills and
        experience.
      </CardFooter>
    </Card>
  );
}
