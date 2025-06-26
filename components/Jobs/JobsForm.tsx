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
import { Job } from "@/lib/Firebase/Firestore";
import { MultiSelect } from "../ui/multi-select";

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

// Sample skills for the dropdown
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
}

export function JobForm({ job, onSubmitSuccess }: JobFormProps) {
  const { user } = useAuthStore();
  const { createJob } = useJobStore();
  const isEditing = !!job;

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: job?.title || "",
      company: job?.company || "",
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
        // TODO: Implement job update functionality
        // await updateJob(job.id, jobData);
        toast.success("The job posting has been successfully updated.");
      } else {
        await createJob(jobData);
        toast.success("Your job posting has been successfully created.");
      }

      // Reset form if not editing
      if (!isEditing) {
        form.reset();
      }

      // Call success callback if provided
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
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the details of your job posting"
            : "Fill out the form below to create a new job posting"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
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
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Toronto, ON (or Remote)"
                        {...field}
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
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={skillOptions}
                        selected={field.value.map((skill) => ({
                          label: skill,
                          value: skill,
                        }))}
                        onChange={(selected) =>
                          field.onChange(selected.map((item) => item.value))
                        }
                        placeholder="Select required skills"
                      />
                    </FormControl>
                    <FormDescription>
                      Select the skills required for this position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job role, responsibilities, and what the candidate will be doing..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the job requirements, one per line..."
                      className="min-h-[100px]"
                      value={field.value.join("\n")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Enter each requirement on a new line
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {isEditing ? "Update Job Posting" : "Create Job Posting"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
