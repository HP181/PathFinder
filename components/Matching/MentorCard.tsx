'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MentorProfile } from '@/lib/Firebase/Firestore';
import { BarChart2 } from 'lucide-react';

interface MentorCardProps {
  mentor: MentorProfile;
  compatibilityScore: number;
  onRequestConnection: () => void;
  onShowDetails: () => void;
  isPending?: boolean;
  isConnected?: boolean;
  canViewDetails: boolean;
}

export function MentorCard({
  mentor,
  compatibilityScore,
  onRequestConnection,
  onShowDetails,
  isPending = false,
  isConnected = false,
  canViewDetails,
}: MentorCardProps) {
  const getInitials = () => {
    if (!mentor.displayName) return 'M';
    return mentor.displayName.charAt(0).toUpperCase();
  };

  const scorePercentage = Math.round(compatibilityScore * 100);

  const getButtonState = () => {
    if (isConnected) {
      return { text: 'Connected', disabled: true };
    }
    if (isPending) {
      return { text: 'Request Pending', disabled: true };
    }
    return { text: 'Request Connection', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="h-full flex flex-col">
      {/* Simplified Glass Card Container */}
      <div className="h-full flex flex-col bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/15 hover:border-white/30">
        
        <div className="p-4 pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {/* Simplified Avatar */}
              <Avatar className="h-10 w-10 bg-white/10 border border-white/20">
                <AvatarImage src="" alt={mentor.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-white font-semibold text-sm border-0">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-white text-base font-semibold mb-1">
                  {mentor.displayName}
                </h3>
                <p className="text-gray-200 text-sm">
                  {mentor.industries.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-grow px-4 pb-4">
          <div className="space-y-3">
            {/* Simplified Expertise Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-200 mb-2 uppercase tracking-wide">
                Expertise
              </h4>
              <div className="flex flex-wrap gap-1">
                {mentor.expertise.slice(0, 3).map((expertise, index) => (
                  <span 
                    key={index} 
                    className="bg-white/15 text-gray-100 border border-white/20 hover:bg-white/20 transition-colors text-xs px-2 py-1 rounded-md"
                  >
                    {expertise}
                  </span>
                ))}
                {mentor.expertise.length > 3 && (
                  <span className="bg-white/10 text-gray-300 border border-white/15 text-xs px-2 py-1 rounded-md">
                    +{mentor.expertise.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            {/* Simplified Background Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-200 mb-2 uppercase tracking-wide">
                Background
              </h4>
              <p className="text-sm text-gray-100 leading-relaxed">
                {mentor.professionalBackground.length > 100
                  ? `${mentor.professionalBackground.substring(0, 100)}...`
                  : mentor.professionalBackground}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 p-4 pt-3 border-t border-white/20">
          {/* Simplified Main Action Button */}
          <button
            className={`w-full text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 ${
              isConnected 
                ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-100 border border-emerald-500/40' 
                : isPending
                ? 'bg-orange-600/30 hover:bg-orange-600/40 text-orange-100 border border-orange-500/40'
                : 'bg-blue-600/30 hover:bg-blue-600/40 text-blue-100 border border-blue-500/40 hover:border-blue-400/50'
            } ${buttonState.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={onRequestConnection}
            disabled={buttonState.disabled}
          >
            {isConnected && (
              <svg className="h-3 w-3 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {buttonState.text}
          </button>

          {/* Simplified Details Button */}
          {canViewDetails && (
            <button
              className="w-full text-cyan-200 hover:text-cyan-100 text-sm py-1 cursor-pointer transition-colors underline underline-offset-2"
              onClick={onShowDetails}
            >
              View Details & Book Session
            </button>
          )}
        </div>
      </div>

      {/* Global Cursor Styling */}
      <style jsx global>{`
        button, a, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }
        
        button:disabled, .opacity-50 {
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  );
}