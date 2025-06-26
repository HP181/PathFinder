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
      <div className="flex flex-col items-center justify-center py-16">
        {/* Loading State with Glass Theme */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-30 blur animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 animate-ping"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
                  Finding Perfect Opportunities
                </h3>
                <p className="text-gray-300">Loading job listings tailored for you...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Section */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 opacity-20 blur"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 rounded-xl backdrop-blur-sm border border-emerald-400/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                </h2>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search jobs by title, company, or skills..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex-shrink-0 w-full md:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 cursor-pointer"
                >
                  {!isRecruiterView && (
                    <option value="match" className="bg-slate-800">Best Match</option>
                  )}
                  <option value="recent" className="bg-slate-800">Most Recent</option>
                  <option value="title" className="bg-slate-800">Job Title</option>
                  <option value="company" className="bg-slate-800">Company</option>
                </select>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Remote', 'Full-time', 'Part-time', 'Contract', 'Entry Level', 'Senior Level'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-white/5 hover:bg-cyan-500/20 rounded-full border border-white/20 hover:border-cyan-400/50 text-sm text-gray-300 hover:text-cyan-200 transition-all duration-300 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          {/* Empty State with Glass Theme */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 opacity-30 blur"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-xl backdrop-blur-sm border border-orange-400/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent mb-2">
                    No Jobs Found
                  </h3>
                  <p className="text-gray-300 max-w-md">
                    {searchTerm
                      ? 'Try adjusting your search terms to find more results'
                      : 'Check back later for new job postings tailored to your skills'}
                  </p>
                </div>
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-orange-500/50 hover:border-orange-400/50 cursor-pointer">
                  Set Job Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(({ job, compatibilityScore }) => (
              <div key={job.id} className="relative group">
                {/* Dynamic glow effect based on compatibility */}
                {!isRecruiterView && compatibilityScore > 0.8 && (
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 opacity-40 blur group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
                )}
                {!isRecruiterView && compatibilityScore > 0.6 && compatibilityScore <= 0.8 && (
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
                )}
                {(isRecruiterView || compatibilityScore <= 0.6) && (
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600 opacity-20 blur group-hover:opacity-40 transition-opacity duration-300"></div>
                )}
                
                {/* Card Container */}
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  <div className="relative">
                    <JobCard
                      job={job}
                      compatibilityScore={isRecruiterView ? undefined : compatibilityScore}
                      onApply={() => handleApply(job.id!)}
                      onViewDetails={() => handleViewDetails(job.id!)}
                      isRecruiterView={isRecruiterView}
                      applicantCount={5}
                    />
                  </div>
                </div>

                {/* Compatibility Badge for non-recruiter view */}
                {!isRecruiterView && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                      compatibilityScore > 0.8 
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' 
                        : compatibilityScore > 0.6 
                        ? 'bg-blue-500/20 text-blue-200 border-blue-400/50'
                        : 'bg-gray-500/20 text-gray-200 border-gray-400/50'
                    }`}>
                      {Math.round(compatibilityScore * 100)}% Match
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredJobs.length >= 9 && (
            <div className="flex justify-center mt-8">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/50 hover:border-blue-400/50 cursor-pointer">
                Load More Jobs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Cursor Styling */}
      <style jsx global>{`
        /* Ensure all buttons and interactive elements have pointer cursor */
        button, a, [role="button"], .cursor-pointer, 
        select, option, input[type="submit"], input[type="button"], 
        button[type="submit"], button[type="button"] {
          cursor: pointer !important;
        }
        
        /* Interactive elements */
        .hover\\:scale-105:hover, 
        .hover\\:bg-cyan-500\\/20:hover, 
        .hover\\:border-cyan-400\\/50:hover,
        .hover\\:text-cyan-200:hover,
        .group:hover .group-hover\\:scale-105 {
          cursor: pointer !important;
        }

        /* Form elements */
        input[type="text"], input[type="search"], select {
          cursor: text !important;
        }
        
        select {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}