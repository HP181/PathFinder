'use client';

import React from 'react';
import { MentorList } from '@/components/Matching/MentorList';

export default function FindMentorsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-cyan/5"></div>
        
        {/* Floating decorative orbs */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-20 blur"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl backdrop-blur-sm border border-cyan-400/30 mr-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-sm font-medium mb-3 backdrop-blur-sm border border-cyan-400/30">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                    Mentorship Program
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
                    Find Mentors
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                    Connect with experienced professionals who can guide you through your career journey in Canada. 
                    Get personalized advice, industry insights, and valuable networking opportunities.
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-cyan-300 mb-1">500+</div>
                  <div className="text-sm text-gray-400">Expert Mentors</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-emerald-300 mb-1">50+</div>
                  <div className="text-sm text-gray-400">Industries</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-purple-300 mb-1">95%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-pink-300 mb-1">10k+</div>
                  <div className="text-sm text-gray-400">Connections Made</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mentor List Section */}
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-20 blur"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-8">
              <MentorList />
            </div>
          </div>
        </div>
      </div>

      {/* Global Cursor Styling */}
      <style jsx global>{`
        /* Ensure all buttons and links have pointer cursor */
        button, a, [role="button"], .cursor-pointer, 
        input[type="submit"], input[type="button"], 
        button[type="submit"], button[type="button"] {
          cursor: pointer !important;
        }
        
        /* Interactive elements */
        .hover\\:scale-105:hover, 
        .hover\\:bg-white\\/20:hover, 
        .hover\\:border-cyan-400\\/50:hover,
        .hover\\:bg-white\\/10:hover,
        .hover\\:bg-cyan-500\\/20:hover {
          cursor: pointer !important;
        }

        /* Form elements */
        input[type="text"], input[type="search"] {
          cursor: text !important;
        }

        /* Tag buttons */
        .hover\\:text-cyan-200:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}