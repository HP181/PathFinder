"use client";

import React, { useEffect, useState } from "react";
import { JobCard } from "@/components/Matching/JobCard";
import { Job } from "@/lib/Firebase/Firestore";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// This is a mock function to fetch jobs from the API
// In a real app, this would be replaced with an actual API call
const fetchJobs = async (): Promise<
  { job: Job; compatibilityScore: number }[]
> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Sample job data
  return [
    {
      job: {
        id: "1",
        title: "Frontend Developer",
        company: "TechNova Inc.",
        location: "Toronto, ON",
        description:
          "We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React and TypeScript, working closely with our design and backend teams to create responsive and accessible web applications.",
        requirements: [
          "Minimum 2 years of experience with React",
          "Strong understanding of JavaScript/TypeScript",
          "Experience with responsive design and CSS frameworks",
          "Knowledge of modern frontend build tools",
        ],
        skills: ["React", "TypeScript", "CSS", "HTML", "Git"],
        recruiterUid: "recruiter1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
      compatibilityScore: 0.89,
    },
    {
      job: {
        id: "2",
        title: "Data Analyst",
        company: "FinSecure Solutions",
        location: "Vancouver, BC",
        description:
          "FinSecure is seeking a Data Analyst to help transform our financial data into insights. You will work with large datasets, develop visualization tools, and communicate findings to stakeholders to drive business decisions.",
        requirements: [
          "Bachelor's degree in Statistics, Mathematics, Computer Science, or related field",
          "Experience with SQL and database querying",
          "Proficiency with data visualization tools",
          "Strong analytical and problem-solving skills",
        ],
        skills: ["SQL", "Python", "Data Analysis", "Tableau", "Excel"],
        recruiterUid: "recruiter2",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      },
      compatibilityScore: 0.76,
    },
    {
      job: {
        id: "3",
        title: "DevOps Engineer",
        company: "CloudScale Technologies",
        location: "Remote (Canada)",
        description:
          "CloudScale is hiring a DevOps Engineer to help build and maintain our cloud infrastructure. You will automate deployment processes, implement CI/CD pipelines, and ensure the reliability and scalability of our systems.",
        requirements: [
          "Experience with cloud platforms (AWS, Azure, or GCP)",
          "Knowledge of containerization and orchestration tools",
          "Understanding of Infrastructure as Code",
          "Experience with monitoring and logging tools",
        ],
        skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
        recruiterUid: "recruiter3",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      },
      compatibilityScore: 0.65,
    },
  ];
};

interface JobListProps {
  isRecruiterView?: boolean;
  recruiterUid?: string;
}

export function JobList({
  isRecruiterView = false,
  recruiterUid,
}: JobListProps) {
  const [jobs, setJobs] = useState<{ job: Job; compatibilityScore: number }[]>(
    []
  );
  const [filteredJobs, setFilteredJobs] = useState<
    { job: Job; compatibilityScore: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("match");

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);

      try {
        let jobData;

        if (isRecruiterView && recruiterUid) {
          // For recruiter view, fetch only their jobs
          // This would be replaced with a real API call
          jobData = (await fetchJobs()).filter(
            (item) => item.job.recruiterUid === recruiterUid
          );
        } else {
          // For immigrant view, fetch all jobs with compatibility scores
          jobData = await fetchJobs();
        }

        setJobs(jobData);
        setFilteredJobs(jobData);
      } catch (error) {
        console.error("Error loading jobs:", error);
        toast.error("Failed to load job listings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [isRecruiterView, recruiterUid, toast]);

  // Handle search and filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = jobs.filter(({ job }) => {
      return (
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    });

    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  // Handle sorting
  useEffect(() => {
    const sorted = [...filteredJobs];

    switch (sortBy) {
      case "match":
        sorted.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        break;
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.job.createdAt).getTime() -
            new Date(a.job.createdAt).getTime()
        );
        break;
      case "title":
        sorted.sort((a, b) => a.job.title.localeCompare(b.job.title));
        break;
      case "company":
        sorted.sort((a, b) => a.job.company.localeCompare(b.job.company));
        break;
      default:
        break;
    }

    setFilteredJobs(sorted);
  }, [sortBy, filteredJobs]);

  // Handle job application
  const handleApply = (jobId: string) => {
    // This would be replaced with a real API call
    toast.success("Your application has been successfully submitted.");
  };

  // Handle view job details
  const handleViewDetails = (jobId: string) => {
    // This would be replaced with navigation to job details page
    toast.info("Navigating to job details page...");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company, or skills..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0 w-full md:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {!isRecruiterView && (
                <SelectItem value="match">Best Match</SelectItem>
              )}
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="title">Job Title</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-muted-foreground mt-1">
            {searchTerm
              ? "Try adjusting your search terms to find more results"
              : "Check back later for new job postings"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(({ job, compatibilityScore }) => (
            <JobCard
              key={job.id}
              job={job}
              compatibilityScore={
                isRecruiterView ? undefined : compatibilityScore
              }
              onApply={() => handleApply(job.id!)}
              onViewDetails={() => handleViewDetails(job.id!)}
              isRecruiterView={isRecruiterView}
              applicantCount={5} // Mock applicant count
            />
          ))}
        </div>
      )}
    </div>
  );
}
