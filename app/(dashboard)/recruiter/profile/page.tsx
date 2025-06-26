'use client';

import React, { useEffect, useState } from 'react';
import { RecruiterProfileForm } from '@/components/Dashboard/Profile/RecruiterProfileForm';
import { ProfileCompletion } from '@/components/Dashboard/Profile/ProfileCompletion';
import { useRecruiterStore } from '@/lib/Store/RecruiterStore';
import { RecruiterProfile } from '@/lib/Firebase/Firestore';
import { useAuthStore } from '@/lib/Store/Auth-Store';

export default function RecruitmentProfilePage() {
  const { profile } = useRecruiterStore(); // Similar to useProfileStore
  const { user } = useAuthStore();
  const recruiterProfile = profile as RecruiterProfile | null;

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [remainingSteps, setRemainingSteps] = useState<string[]>([]);
  const stepsConfig = [
    // Recruiter Info
    { label: 'Full Name', key: 'fullName' },
    { label: 'Email', key: 'email' },
    { label: 'Phone Number', key: 'phone' },
    { label: 'LinkedIn Profile', key: 'linkedIn' },
    { label: 'Position at Company', key: 'position' },
    // Company Info
    { label: 'Company Name', key: 'companyName' },
    { label: 'Company Website', key: 'companyWebsite' },
    { label: 'Company Industry', key: 'companyIndustry' },
    { label: 'Location', key: 'location' },
    { label: 'About Company', key: 'companyDescription' },
    // {
    //   label: 'Job Description',
    //   key: 'jobDescription',
    // },
    // {
    //   label: 'Required Skills',
    //   key: 'skillsRequired',
    //   validator: (val: any) => Array.isArray(val) && val.length > 0,
    // },
    // {
    //   label: 'Salary Range',
    //   key: 'salaryRange',
    // },
  ];
  useEffect(() => {
  if (!recruiterProfile) return;

  const completed: string[] = [];
  const remaining: string[] = [];

  // stepsConfig.forEach(({ label, key, validator }) => {
  stepsConfig.forEach(({ label, key}) => {
    const value = (recruiterProfile as any)[key];
    // const isValid = validator ? validator(value) : Boolean(value);
    const isValid = Boolean(value)
    if (isValid) {
      completed.push(label);
    } else {
      remaining.push(label);
    }
  });

  setCompletedSteps(completed);
  setRemainingSteps(remaining);
}, [recruiterProfile]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Recruitment Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <RecruiterProfileForm />
          {/* <JobDescriptionEditor /> */}
        </div>

        <div>
          <ProfileCompletion
            percentage={recruiterProfile?.profileCompletionPercentage || 0}
            stepsCompleted={completedSteps}
            stepsRemaining={remainingSteps}
          />
        </div>
      </div>
    </div>
  );
}
