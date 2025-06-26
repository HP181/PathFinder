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
import { toast } from "sonner";
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { MentorProfile } from '@/lib/Firebase/Firestore';
import { MultiSelect } from '@/components/ui/multi-select';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  professionalBackground: z.string().min(20, { message: 'Please provide a more detailed professional background' }),
  expertise: z.array(z.string()).min(1, { message: 'Please select at least one area of expertise' }),
  industries: z.array(z.string()).min(1, { message: 'Please select at least one industry' }),
});

// Sample expertise areas for the dropdown
const expertiseOptions = [
  'Resume Building', 'Interview Preparation', 'Job Search Strategies', 
  'Career Transition', 'Networking', 'Professional Development',
  'Leadership', 'Communication Skills', 'Technical Skills',
  'Canadian Workplace Culture', 'Immigration Process', 'Work Permits',
  'Credential Recognition', 'Industry Certifications', 'Entrepreneurship'
].map(expertise => ({ label: expertise, value: expertise }));

// Sample industries for the dropdown
const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Government', 'Non-profit', 'Media', 'Entertainment',
  'Construction', 'Transportation', 'Hospitality', 'Energy', 'Agriculture',
  'Legal', 'Consulting', 'Marketing', 'Real Estate', 'Telecommunications'
].map(industry => ({ label: industry, value: industry }));

export function MentorProfileForm() {
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useProfileStore();
  const mentorProfile = profile as MentorProfile | null;
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: mentorProfile?.displayName || user?.displayName || '',
      email: mentorProfile?.email || user?.email || '',
      phone: mentorProfile?.phone || '',
      professionalBackground: mentorProfile?.professionalBackground || '',
      expertise: mentorProfile?.expertise || [],
      industries: mentorProfile?.industries || [],
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      await updateProfile({
        uid: user.uid,
        role: 'mentor',
        displayName: values.displayName,
        email: values.email,
        phone: values.phone,
        professionalBackground: values.professionalBackground,
        expertise: values.expertise,
        industries: values.industries,
        availability: mentorProfile?.availability || {},
        createdAt: mentorProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MentorProfile);
      
      toast.success('Your mentor profile has been successfully updated');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating your profile.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Profile</CardTitle>
        <CardDescription>
          Provide your professional information to help immigrants find the right mentor
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
                name="industries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industries</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={industryOptions}
                        selected={field.value.map(industry => ({ label: industry, value: industry }))}
                        onChange={selected => field.onChange(selected.map(item => item.value))}
                        placeholder="Select industries"
                      />
                    </FormControl>
                    <FormDescription>
                      Select the industries you have experience in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Areas of Expertise</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={expertiseOptions}
                         selected={field.value.map(expertise => ({ label: expertise, value: expertise }))}
                        onChange={selected => field.onChange(selected.map(item => item.value))}
                        placeholder="Select areas of expertise"
                      />
                    </FormControl>
                    <FormDescription>
                      Select the areas where you can provide mentorship
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="professionalBackground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Background</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your professional experience, qualifications, and relevant background..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a summary of your professional experience and qualifications
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