'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/Firebase/Firestore';
import { Building, MapPin, CalendarDays, BarChart2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobDetailProps {
  job: Job;
  compatibilityScore?: number;
  onApply?: () => void;
  onBack: () => void;
  hasApplied?: boolean;
}

export function JobDetail({ 
  job, 
  compatibilityScore,
  onApply,
  onBack,
  hasApplied = false
}: JobDetailProps) {
  // Format the date
  const postedDate = new Date(job.createdAt);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });
  
  // Format compatibility score as a percentage if provided
  const scorePercentage = compatibilityScore ? Math.round(compatibilityScore * 100) : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Glass Card Container */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-20 blur"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          
          {/* Header */}
          <div className="relative p-8 border-b border-white/20">
            {/* Back Button */}
            <button 
              onClick={onBack}
              className="mb-6 flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 text-gray-200 hover:text-white transition-all duration-300 cursor-pointer"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Jobs
            </button>

            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-4 rounded-xl backdrop-blur-sm border border-blue-400/30">
                  <Building className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center text-gray-300">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-lg">{job.company}</span>
                  </div>
                </div>
              </div>
              
              {/* Compatibility Badge */}
              {scorePercentage && (
                <div className={`flex items-center px-4 py-2 rounded-lg backdrop-blur-sm border ${
                  scorePercentage > 80 
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' 
                    : scorePercentage > 60 
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/50'
                    : 'bg-orange-500/20 text-orange-200 border-orange-400/50'
                }`}>
                  <BarChart2 className="h-5 w-5 mr-2" />
                  <span className="text-lg font-semibold">{scorePercentage}% Match</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="relative p-8 space-y-8">
            {/* Job Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <MapPin className="h-4 w-4 mr-2 text-blue-300" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <CalendarDays className="h-4 w-4 mr-2 text-purple-300" />
                <span>Posted {timeAgo}</span>
              </div>
              <div className="flex items-center bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <svg className="h-4 w-4 mr-2 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Competitive Salary</span>
              </div>
            </div>
            
            {/* Job Description */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Job Description
              </h3>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <p className="text-gray-100 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            {/* Requirements */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Requirements
              </h3>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start text-gray-100">
                      <svg className="h-5 w-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Required Skills */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-sm px-4 py-2 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-blue-300 mb-1">Full-time</div>
                <div className="text-sm text-gray-400">Employment Type</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-purple-300 mb-1">On-site</div>
                <div className="text-sm text-gray-400">Work Arrangement</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1">Senior</div>
                <div className="text-sm text-gray-400">Experience Level</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative p-8 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              {hasApplied ? (
                <button 
                  disabled
                  className="flex-1 px-6 py-4 bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 rounded-lg font-semibold opacity-70 cursor-not-allowed"
                >
                  <svg className="h-5 w-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Application Submitted
                </button>
              ) : (
                <button 
                  onClick={onApply}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-500/50 hover:border-blue-400/50 cursor-pointer"
                >
                  <svg className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Apply Now
                </button>
              )}
              
              <button className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-200 hover:text-white rounded-lg font-semibold transition-all duration-300 cursor-pointer">
                <svg className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Save Job
              </button>
            </div>
            
            {/* Company Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                    <Building className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{job.company}</h4>
                    <p className="text-sm text-gray-400">View company profile</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-200 hover:text-white rounded-lg transition-all duration-300 cursor-pointer">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Cursor Styling */}
      <style jsx global>{`
        button, a, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }
        
        button:disabled, .cursor-not-allowed {
          cursor: not-allowed !important;
        }

        .hover\\:scale-105:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}