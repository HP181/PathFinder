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
import { generateMockInterviewQuestions } from '@/lib/Google/Vertex-AI';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  industry: z.string().min(1, { message: 'Please select an industry' }),
  role: z.string().min(2, { message: 'Please enter your target role' }),
  experienceLevel: z.string().min(1, { message: 'Please select your experience level' }),
});

// Sample industries for the dropdown
const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Engineering', 'Legal', 'Accounting', 'Marketing', 'Media',
  'Construction', 'Transportation', 'Hospitality', 'Retail', 'Agriculture',
];

// Experience levels for the dropdown
const experienceLevels = [
  'Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Management', 'Executive'
];

interface MockInterviewQuestion {
  question: string;
  context: string;
  tips: string[];
}

export function MockInterview() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('0');
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: '',
      role: '',
      experienceLevel: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setQuestions([]);
    
    try {
      const result = await generateMockInterviewQuestions(
        values.industry,
        values.role,
        values.experienceLevel
      );
      
      setQuestions(result);
      setActiveTab('0');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while generating interview questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mock Interview Practice</CardTitle>
          <CardDescription>
            Generate interview questions based on your target role and practice your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        The industry you're targeting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
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
                        The specific job title you're interviewing for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your experience level for this role
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating questions...
                  </>
                ) : 'Generate Interview Questions'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Generating interview questions...</p>
              <p className="text-sm text-muted-foreground mt-1">
                We're creating tailored interview questions for your target role.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
            <CardDescription>
              Practice answering these questions to prepare for your interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 overflow-x-auto max-w-full flex">
                {questions.map((_, index) => (
                  <TabsTrigger key={index} value={index.toString()} className="flex-shrink-0">
                    Question {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {questions.map((question, index) => (
                <TabsContent key={index} value={index.toString()} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Question:</h3>
                    <p className="mt-1 text-lg">{question.question}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold text-muted-foreground">Context:</h3>
                    <p className="mt-1">{question.context}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold text-muted-foreground">Tips for answering:</h3>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {question.tips.map((tip, tipIndex) => (
                        <li key={tipIndex}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <p>
              Tip: Practice answering these questions out loud and record yourself to review your responses.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
