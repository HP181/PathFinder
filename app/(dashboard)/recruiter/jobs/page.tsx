'use client';

import React, { useEffect, useState } from 'react';
import { JobList } from '@/components/Jobs/JobsList';
import { JobForm } from '@/components/Jobs/JobsForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { getUserProfile, RecruiterProfile } from '@/lib/Firebase/Firestore';
import { useRecruiterStore } from '@/lib/Store/RecruiterStore';

export default function RecruiterJobsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { profile, setProfile } = useRecruiterStore();
  const { user } = useAuthStore();

  const recruiterProfile = profile as RecruiterProfile | null;

  useEffect(() => {
    getUserInfo();
  }, []);

  async function getUserInfo() {
    if (!user?.uid) return;
    const userProfile = await getUserProfile(user.uid);
    console.log("Jobs User Profile", userProfile);
    if (userProfile) {
      setProfile(userProfile as RecruiterProfile); 
    }
  }

  const handleCreateJob = () => {
    setIsCreating(true);
  };

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
              : 'View and manage your job postings'}
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
        <JobForm onSubmitSuccess={handleCreateSuccess} userInfo={recruiterProfile}/>
      ) : (
        <JobList isRecruiterView={true} recruiterUid={user?.uid} />
      )}
    </div>
  );
}
