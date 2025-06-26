'use client';

import React, { useState } from 'react';
import { JobList } from '@/components/Jobs/JobsList';
import { JobDetail } from '@/components/Jobs/JobDetail';
import { ApplicationForm } from '@/components/Jobs/ApplicationForm';
import { Job } from '@/lib/Firebase/Firestore';

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  // Handle job selection
  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setIsApplying(false);
  };
  
  // Handle apply button click
  const handleApply = () => {
    setIsApplying(true);
  };
  
  // Handle application submission
  const handleSubmitApplication = () => {
    setSelectedJob(null);
    setIsApplying(false);
  };
  
  // Handle back button
  const handleBack = () => {
    if (isApplying) {
      setIsApplying(false);
    } else {
      setSelectedJob(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {selectedJob 
            ? isApplying 
              ? `Apply for ${selectedJob.title}`
              : `${selectedJob.title} at ${selectedJob.company}`
            : 'Browse Jobs'
          }
        </h1>
        <p className="text-muted-foreground mt-2">
          {selectedJob 
            ? isApplying 
              ? 'Submit your application'
              : 'View job details and apply'
            : 'Find job opportunities that match your skills and experience'
          }
        </p>
      </div>
      
      {selectedJob ? (
        isApplying ? (
          <ApplicationForm 
            job={selectedJob} 
            onSubmit={handleSubmitApplication} 
            onCancel={handleBack} 
          />
        ) : (
          <JobDetail 
            job={selectedJob} 
            compatibilityScore={0.89} // This would come from the API
            onApply={handleApply}
            onBack={handleBack}
          />
        )
      ) : (
        <JobList />
      )}
    </div>
  );
}