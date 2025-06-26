'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { JobCard } from '@/components/Matching/JobCard';
import { getJobsByRecruiter, Job } from '@/lib/Firebase/Firestore';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Timestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fetchJobs = async (): Promise<
  { job: Job; compatibilityScore: number }[]
> => {
  const jobs = await getJobsByRecruiter();
  return jobs.map((job: Job) => ({
    job,
    compatibilityScore: 1,
  }));
};

interface JobListProps {
  isRecruiterView?: boolean;
  recruiterUid?: string;
}

export function JobList({ isRecruiterView = false, recruiterUid }: JobListProps) {
  const [jobs, setJobs] = useState<{ job: Job; compatibilityScore: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const allJobs = await fetchJobs();
        const filtered = isRecruiterView && recruiterUid
          ? allJobs.filter(({ job }) => job.recruiterUid === recruiterUid)
          : allJobs;
        setJobs(filtered);
      } catch (error) {
        console.error('Error loading jobs:', error);
        toast.error('Failed to load job listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [isRecruiterView, recruiterUid]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filtering
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(({ job }) =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'match':
        result.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        break;
      // case 'recent':
      //   result.sort((a, b) =>
      //     new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime()
      //   );
      //   break;
      case 'title':
        result.sort((a, b) => a.job.title.localeCompare(b.job.title));
        break;
      case 'company':
        result.sort((a, b) => a.job.company.localeCompare(b.job.company));
        break;
    }

    return result;
  }, [jobs, searchTerm, sortBy]);

  const handleApply = (jobId: string) => {
    toast.success('Your application has been successfully submitted.');
  };

  const handleViewDetails = (jobId: string) => {
    toast.info('Navigating to job details page...');
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
              ? 'Try adjusting your search terms to find more results'
              : 'Check back later for new job postings'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(({ job, compatibilityScore }) => (
            <JobCard
              key={job.id}
              job={job}
              compatibilityScore={isRecruiterView ? undefined : compatibilityScore}
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
