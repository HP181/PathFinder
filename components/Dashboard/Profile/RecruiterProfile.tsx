'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { RecruiterProfile } from '@/lib/Firebase/Firestore';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  company: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  industry: z.string().min(1, { message: 'Please select an industry' }),
});

// Sample industries for the dropdown
const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Government', 'Non-profit', 'Media', 'Entertainment',
  'Construction', 'Transportation', 'Hospitality', 'Energy', 'Agriculture',
  'Legal', 'Consulting', 'Marketing', 'Real Estate', 'Telecommunications',
];

export function RecruiterProfileForm() {
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useProfileStore();
  const recruiterProfile = profile as RecruiterProfile | null;
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: recruiterProfile?.displayName || user?.displayName || '',
      email: recruiterProfile?.email || user?.email || '',
      phone: recruiterProfile?.phone || '',
      company: recruiterProfile?.company || '',
      industry: recruiterProfile?.industry || '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      await updateProfile({
        uid: user.uid,
        role: 'recruiter',
        displayName: values.displayName,
        email: values.email,
        phone: values.phone,
        company: values.company,
        industry: values.industry,
        createdAt: recruiterProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as RecruiterProfile);
      
      toast.success('Your recruiter profile has been successfully updated.');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating your profile.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruiter Profile</CardTitle>
        <CardDescription>
          Provide your company details to help connect with qualified candidates
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
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
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
                          <SelectValue placeholder="Select an industry" />
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
                      Select the primary industry of your company
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}