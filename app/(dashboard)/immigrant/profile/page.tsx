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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-10 animate-pulse delay-500"></div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-200 text-sm font-medium mb-6 backdrop-blur-sm border border-cyan-400/30">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
              Profile Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-4">
              My Profile
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Complete your profile to unlock personalized job opportunities and connect with mentors
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  <div className="relative p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-xl backdrop-blur-sm border border-blue-400/30 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Personal Information</h2>
                    </div>
                    <ImmigrantProfileForm />
                  </div>
                </div>
              </div>

              {/* Resume Uploader Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  <div className="relative p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-xl backdrop-blur-sm border border-purple-400/30 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Resume & Documents</h2>
                    </div>
                    <ResumeUploader />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="relative group">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    <div className="relative p-8">
                      <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-3 rounded-xl backdrop-blur-sm border border-emerald-400/30 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-white">Progress</h2>
                      </div>
                      <ProfileCompletion
                        percentage={immigrantProfile?.profileCompletionPercentage || 0}
                        stepsCompleted={completedSteps}
                        stepsRemaining={remainingSteps}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Ensure all buttons and links have pointer cursor */
        button, a, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }
        
        /* Specific styling for form elements */
        input[type="submit"], input[type="button"], button[type="submit"], button[type="button"] {
          cursor: pointer !important;
        }
        
        /* Interactive elements */
        .hover\\:scale-105:hover, .hover\\:bg-white\\/20:hover, .hover\\:border-cyan-400\\/50:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}