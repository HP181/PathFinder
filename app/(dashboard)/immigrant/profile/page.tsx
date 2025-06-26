'use client';

import React, { useEffect, useState } from 'react';
import { ImmigrantProfileForm } from '@/components/Dashboard/Profile/ImmigrantProfile';
import { ResumeUploader } from '@/components/Dashboard/Profile/ResumeUploader';
import { ProfileCompletion } from '@/components/Dashboard/Profile/ProfileCompletion';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { ImmigrantProfile } from '@/lib/Firebase/Firestore';

export default function ImmigrantProfilePage() {
  const { profile } = useProfileStore();
  const immigrantProfile = profile as ImmigrantProfile | null;
  

  console.log('immigrantProfile', immigrantProfile);

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [remainingSteps, setRemainingSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!immigrantProfile) return;

    const stepsConfig = [
      {
        label: 'Personal information',
        key: 'displayName',
      },
      {
        label: 'Skills',
        key: 'skills',
        validator: (value: any) => Array.isArray(value) && value.length > 0,
      },
      {
        label: 'Career goals',
        key: 'careerGoals',
      },
      {
        label: 'Resume upload',
        key: 'resumeUrl',
      },
    ];

    const completed: string[] = [];
    const remaining: string[] = [];

    stepsConfig.forEach(({ label, key, validator }) => {
      const value = (immigrantProfile as any)[key];
      const isValid = validator ? validator(value) : Boolean(value);
      if (isValid) {
        completed.push(label);
      } else {
        remaining.push(label);
      }
    });

    setCompletedSteps(completed);
    setRemainingSteps(remaining);
  }, [immigrantProfile]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ImmigrantProfileForm />
          <ResumeUploader />
        </div>

        <div>
          <ProfileCompletion
            percentage={immigrantProfile?.profileCompletionPercentage || 0}
            stepsCompleted={completedSteps}
            stepsRemaining={remainingSteps}
          />
        </div>
      </div>
    </div>
  );
}
