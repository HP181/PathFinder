'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeAnalyzer } from './ResumeAnalizer';
// import { CredentialAnalyzer } from './CredentialAnalyzer';
// import { MockInterview } from './MockInterview';

export function CareerCoach() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Career Coach</h1>
        <p className="text-muted-foreground mt-2">
          Get personalized guidance to help you succeed in the Canadian job market
        </p>
      </div>
      
      <Tabs defaultValue="resume">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="resume" className="flex-1 md:flex-none">Resume Analysis</TabsTrigger>
          <TabsTrigger value="credentials" className="flex-1 md:flex-none">Credential Equivalency</TabsTrigger>
          <TabsTrigger value="interview" className="flex-1 md:flex-none">Mock Interview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resume">
          <ResumeAnalyzer />
          <p>ResumeAnalyzer</p>
        </TabsContent>
        
        <TabsContent value="credentials">
          {/* <CredentialAnalyzer /> */}
          <p>CredentialAnalyzer</p>
        </TabsContent>
        
        <TabsContent value="interview">
          {/* <MockInterview /> */}
          <p>MockInterview</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
