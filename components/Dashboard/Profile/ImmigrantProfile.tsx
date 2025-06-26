'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { ImmigrantProfile } from '@/lib/Firebase/Firestore';
import { MultiSelect } from '@/components/ui/multi-select';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  skills: z.array(z.string()).min(1, { message: 'Please select at least one skill' }),
  careerGoals: z.string().min(10, { message: 'Please describe your career goals in at least 10 characters' }),
});

// Sample skills for the dropdown
const skillOptions = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#', '.NET',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
  'Product Management', 'UX/UI Design', 'Data Analysis', 'Machine Learning',
  'Project Management', 'Agile', 'Scrum', 'DevOps',
  'Sales', 'Marketing', 'Customer Success', 'Business Development',
  'Finance', 'Accounting', 'HR', 'Operations'
].map(skill => ({ label: skill, value: skill }));

export function ImmigrantProfileForm() {
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useProfileStore();
  const immigrantProfile = profile as ImmigrantProfile | null;
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: immigrantProfile?.displayName || user?.displayName || '',
      email: immigrantProfile?.email || user?.email || '',
      phone: immigrantProfile?.phone || '',
      skills: immigrantProfile?.skills || [],
      careerGoals: immigrantProfile?.careerGoals || '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      await updateProfile({
        uid: user.uid,
        role: 'immigrant',
        displayName: values.displayName,
        email: values.email,
        phone: values.phone,
        skills: values.skills,
        careerGoals: values.careerGoals,
        createdAt: immigrantProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ImmigrantProfile);
      
     toast.success('Your profile has been successfully updated');
    } catch (error: any) {
       toast.error(error.message || 'An error occurred while updating your profile.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Provide your details to help us match you with the right mentors and job opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        type="tel" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={skillOptions}
                        selected={field.value.map(skill => ({ label: skill, value: skill }))}
                        onChange={selected => field.onChange(selected.map(item => item.value))}
                        placeholder="Select skills"
                      />
                    </FormControl>
                    <FormDescription>
                      Select the skills you possess
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="careerGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Goals</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your career goals and what you hope to achieve in Canada..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly describe your career aspirations and what you hope to achieve
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
