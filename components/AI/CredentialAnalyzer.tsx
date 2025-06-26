'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { analyzeCredentialEquivalency } from '@/lib/Google/Vertex-AI';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  credential: z.string().min(2, { message: 'Please enter your credential' }),
  country: z.string().min(2, { message: 'Please select your country' }),
  industry: z.string().min(2, { message: 'Please select an industry' }),
});

// Sample countries for the dropdown
const countries = [
  'India', 'China', 'Philippines', 'Nigeria', 'Pakistan',
  'Brazil', 'Mexico', 'Colombia', 'Iran', 'Bangladesh',
  'South Korea', 'Vietnam', 'Egypt', 'Ukraine', 'United Kingdom',
  'France', 'Germany', 'Japan', 'Australia', 'United States',
];

// Sample industries for the dropdown
const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Engineering', 'Legal', 'Accounting', 'Marketing', 'Media',
  'Construction', 'Transportation', 'Hospitality', 'Retail', 'Agriculture',
];

export function CredentialAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credential: '',
      country: '',
      industry: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeCredentialEquivalency(
        values.credential,
        values.country,
        values.industry
      );
      
      setAnalysisResult(result);
    } catch (error: any) {
      toast(error.message || 'An error occurred during credential analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credential Equivalency Analysis</CardTitle>
          <CardDescription>
            Enter your international credential to get Canadian equivalency information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="credential"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Credential Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Bachelor of Engineering in Computer Science" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the full title of your credential as it appears on your documents
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Origin</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The country where you earned your credential
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The industry relevant to your credential
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
                ) : 'Analyze Credential'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing your credential...</p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a moment as we compare your credential to Canadian standards.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Here's what we found about your credential's Canadian equivalency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Canadian Equivalent</h3>
              <p className="mt-1">{analysisResult.canadianEquivalent}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Required Licenses or Certifications</h3>
              <ul className="mt-1 list-disc list-inside space-y-1">
                {analysisResult.requiredLicenses.map((license: string, index: number) => (
                  <li key={index}>{license}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Recommended Actions</h3>
              <ul className="mt-1 list-disc list-inside space-y-1">
                {analysisResult.recommendedActions.map((action: string, index: number) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Explanation</h3>
              <p className="mt-1">{analysisResult.explanation}</p>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            This analysis is provided as a guide and should not be considered an official credential evaluation.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
