'use client';

import React from 'react';
import { MentorList } from '@/components/Matching/MentorList';

export default function FindMentorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Mentors</h1>
        <p className="text-muted-foreground mt-2">
          Connect with experienced professionals who can guide you through your career journey
        </p>
      </div>
      
      <MentorList />
    </div>
  );
}