'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { analyzeResume } from '@/lib/Google/Vertex-AI';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  targetRole: z.string().min(2, { message: 'Please enter your target role' }),
  targetIndustry: z.string().min(2, { message: 'Please enter your target industry' }),
});

export function ResumeAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  
  // Check if user has uploaded a resume
  const hasResume = !!profile?.resumeUrl && !!profile?.resumeData;
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetRole: '',
      targetIndustry: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!hasResume) {
      toast.error('Please upload your resume before analyzing it.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeResume(
        profile?.resumeData,
        values.targetRole,
        values.targetIndustry
      );
      
      setAnalysisResult(result);
    } catch (error: any) {
      toast(error.message || 'An error occurred during resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Analysis</CardTitle>
          <CardDescription>
            Get AI-powered feedback on your resume for the Canadian job market
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasResume ? (
            <div className="flex flex-col items-center justify-center py-6">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
              <p className="text-lg font-medium">No Resume Found</p>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Please upload your resume in your profile before using this feature.
              </p>
              <Button className="mt-4" asChild>
                <a href="/immigrant/profile">Go to Profile</a>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Role</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Software Engineer" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The job title you're targeting
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetIndustry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Industry</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Technology" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The industry you want to work in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isAnalyzing}>
                   {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : 'Analyze Resume'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground mt-1">
                We're evaluating your resume against Canadian job market standards.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                Strengths
              </CardTitle>
              <CardDescription>
                What's working well in your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>
                What could be enhanced in your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.improvementAreas.map((area: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Canadian Market Fit</CardTitle>
              <CardDescription>
                How well your resume matches Canadian job market expectations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{analysisResult.canadianMarketFit}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                Skill Gaps
              </CardTitle>
              <CardDescription>
                Skills you might want to develop for your target role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.skillGaps.map((gap: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommended Changes</CardTitle>
              <CardDescription>
                Specific changes to make your resume more appealing to Canadian employers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.recommendedChanges.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <span className="text-primary font-medium">{index + 1}</span>
                    </div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
                