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
 useResume: z.boolean(),  // required boolean
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
    <Card>
      <CardHeader>
        <CardTitle>Apply for {job.title}</CardTitle>
        <CardDescription>
          Apply to {job.company} as a {job.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="useResume"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use my uploaded resume</FormLabel>
                    <FormDescription>
                      Your most recently uploaded resume will be included with your application
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write a cover letter explaining why you're a good fit for this position..." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Explain why you're interested in this position and how your skills and experience match the requirements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}