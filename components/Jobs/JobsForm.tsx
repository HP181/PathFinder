"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/Store/Auth-Store";
import { useJobStore } from "@/lib/Store/JobStore";
import { getUserProfile, Job, RecruiterProfile, updateJob } from "@/lib/Firebase/Firestore";
import { MultiSelect } from "../ui/multi-select";
import { UserProfile } from "firebase/auth";

const formSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Job title must be at least 2 characters" }),
  company: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters" }),
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  requirements: z
    .array(z.string())
    .min(1, { message: "Please add at least one requirement" }),
  skills: z
    .array(z.string())
    .min(1, { message: "Please add at least one required skill" }),
});

const skillOptions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C#",
  ".NET",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Product Management",
  "UX/UI Design",
  "Data Analysis",
  "Machine Learning",
  "Project Management",
  "Agile",
  "Scrum",
  "DevOps",
  "Sales",
  "Marketing",
  "Customer Success",
  "Business Development",
  "Finance",
  "Accounting",
  "HR",
  "Operations",
].map((skill) => ({ label: skill, value: skill }));

interface JobFormProps {
  job?: Job;
  onSubmitSuccess?: () => void;
  userInfo?: RecruiterProfile | null
}

export function JobForm({ job, onSubmitSuccess, userInfo }: JobFormProps) {
  const { user } = useAuthStore();
  const { createJob } = useJobStore();
  const isEditing = !!job;
  

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: job?.title || "",
      company: userInfo?.companyName || "",
      location: job?.location || "",
      description: job?.description || "",
      requirements: job?.requirements || [],
      skills: job?.skills || [],
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("Please log in to post a job.");
      return;
    }

    try {
      const jobData: Job = {
        ...values,
        recruiterUid: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };
      if (isEditing && job?.id) {
        await updateJob(job.id, jobData);
        toast.success("The job posting has been successfully updated.");
      } else {
        await createJob(jobData);
        toast.success("Your job posting has been successfully created.");
      }
      if (!isEditing) {
        form.reset();
      }
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      toast.error(
        isEditing
          ? "Update failed. Please try again later."
          : "Creation failed. Please try again later."
      );
    }
  };

  return (
    <div className="w-full">
      {/* Glass Card Container */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-20 blur"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          
          {/* Header */}
          <div className="relative p-8 border-b border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-3 rounded-xl backdrop-blur-sm border border-blue-400/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
                </h2>
                <p className="text-gray-300">
                  {isEditing
                    ? "Update the details of your job posting"
                    : "Fill out the form below to create a new job posting"}
                </p>
              </div>
            </div>
          </div>
          {/* Form Content */}
          <div className="relative p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Job Title</label>
                  <input
                    {...form.register("title")}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-400">{form.formState.errors.title.message}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Company</label>
                  <input
                    {...form.register("company")}
                    placeholder="e.g. Acme Inc."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                  {form.formState.errors.company && (
                    <p className="text-sm text-red-400">{form.formState.errors.company.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Location</label>
                  <input
                    {...form.register("location")}
                    placeholder="e.g. Toronto, ON (or Remote)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-400">{form.formState.errors.location.message}</p>
                  )}
                </div>
                {/* Skills */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Required Skills</label>
                  <div className="relative">
                    <select
                      multiple
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 cursor-pointer"
                      style={{ minHeight: '120px' }}
                    >
                      {skillOptions.slice(0, 10).map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800 text-white py-1">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400">Select the skills required for this position</p>
                  {form.formState.errors.skills && (
                    <p className="text-sm text-red-400">{form.formState.errors.skills.message}</p>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Job Description</label>
                <textarea
                  {...form.register("description")}
                  placeholder="Describe the job role, responsibilities, and what the candidate will be doing..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-400">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Requirements</label>
                <textarea
                  {...form.register("requirements")}
                  placeholder="List the job requirements, one per line..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 resize-none"
                />
                <p className="text-xs text-gray-400">Enter each requirement on a new line</p>
                {form.formState.errors.requirements && (
                  <p className="text-sm text-red-400">{form.formState.errors.requirements.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={form.handleSubmit(onSubmit)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/50 hover:border-blue-400/50 cursor-pointer"
                >
                  {isEditing ? "Update Job Posting" : "Create Job Posting"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Cursor Styling */}
      <style jsx global>{`
        /* Ensure all interactive elements have proper cursors */
        button, a, [role="button"], .cursor-pointer, 
        select, option, input, textarea,
        input[type="submit"], input[type="button"], 
        button[type="submit"], button[type="button"] {
          cursor: pointer !important;
        }
        
        /* Form elements should have text cursor */
        input[type="text"], input[type="email"], input[type="password"],
        textarea, input:not([type="submit"]):not([type="button"]) {
          cursor: text !important;
        }

        /* Select elements should have pointer cursor */
        select {
          cursor: pointer !important;
        }
        
        /* Interactive hover effects */
        .hover\\:scale-105:hover, 
        .hover\\:from-blue-700:hover,
        .hover\\:to-indigo-700:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}