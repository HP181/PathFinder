'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeAnalyzer } from './ResumeAnalizer';
// import { CredentialAnalyzer } from './CredentialAnalyzer';
// import { MockInterview } from './MockInterview';

export function CareerCoach() {
  return (
    <div className="space-y-6 p-6 glass rounded-2xl shadow-lg">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Career Coach</h1>
        <p className="text-white/70 mt-2">
          Get personalized guidance to help you succeed in the Canadian job market
        </p>
      </div>
      
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="w-full justify-start mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1">
          <TabsTrigger 
            value="resume" 
            className="flex-1 md:flex-none text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg"
          >
            Resume Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="credentials" 
            className="flex-1 md:flex-none text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg"
          >
            Credential Equivalency
          </TabsTrigger>
          <TabsTrigger 
            value="interview" 
            className="flex-1 md:flex-none text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg"
          >
            Mock Interview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resume" className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <ResumeAnalyzer />
          <p className="text-white/80">ResumeAnalyzer</p>
        </TabsContent>
        
        <TabsContent value="credentials" className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          {/* <CredentialAnalyzer /> */}
          <p className="text-white/80">CredentialAnalyzer</p>
        </TabsContent>
        
        <TabsContent value="interview" className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          {/* <MockInterview /> */}
          <p className="text-white/80">MockInterview</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
