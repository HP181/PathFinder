'use client';

import React, { useState } from 'react';
import { JobList } from '@/components/Jobs/JobsList';
import { JobForm } from '@/components/Jobs/JobsForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/lib/Store/Auth-Store';

export default function RecruiterJobsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthStore();
  
  // Handle create job button click
  const handleCreateJob = () => {
    setIsCreating(true);
  };
  
  // Handle job creation success
  const handleCreateSuccess = () => {
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isCreating ? 'Create Job Posting' : 'Manage Jobs'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isCreating 
              ? 'Create a new job posting to find qualified candidates'
              : 'View and manage your job postings'
            }
          </p>
        </div>
        
        {!isCreating && (
          <Button onClick={handleCreateJob}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        )}
      </div>
      
      {isCreating ? (
        <JobForm onSubmitSuccess={handleCreateSuccess} />
      ) : (
        <JobList isRecruiterView={true} recruiterUid={user?.uid} />
      )}
    </div>
  );
}