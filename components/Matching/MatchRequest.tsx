import React from 'react';
import { BarChart2, Check, X, Mail, CalendarCheck } from 'lucide-react';

// Define proper TypeScript interfaces
interface ImmigrantProfile {
  displayName?: string;
  email: string;
  skills?: string[];
  careerGoals?: string;
  profileCompletionPercentage?: number;
}

interface Match {
  compatibilityScore: number;
}

interface MatchRequestProps {
  immigrant: ImmigrantProfile;
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
}

// Mock data for demonstration
const mockImmigrant: ImmigrantProfile = {
  displayName: "Sarah Chen",
  email: "sarah.chen@email.com",
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS"],
  careerGoals: "I am passionate about developing innovative web applications and contributing to meaningful projects that make a difference. I have experience in full-stack development and am eager to grow my career in a collaborative environment.",
  profileCompletionPercentage: 85
};

const mockMatch: Match = {
  compatibilityScore: 0.92
};

function MatchRequest({
  immigrant,
  match,
  onAccept,
  onReject,
}: MatchRequestProps) {
  const getInitials = () => {
    if (!immigrant?.displayName) return 'I';
    return immigrant.displayName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const scorePercentage = Math.round(match.compatibilityScore * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Glass Card Container */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 opacity-20 blur"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          
          {/* Header */}
          <div className="relative p-6 border-b border-white/20">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-60 blur-sm"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500/30 to-blue-500/30 backdrop-blur-sm rounded-full border border-emerald-400/40 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {getInitials()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    {immigrant?.displayName || 'No Name'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-emerald-300" />
                    <span className="text-gray-300 text-sm">{immigrant?.email || 'No email provided'}</span>
                  </div>
                </div>
              </div>
              
              {/* Match Score */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-emerald-400/30">
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 text-emerald-300 mr-2" />
                  <span className="text-sm font-bold text-white">
                    {scorePercentage}% Match
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6 space-y-6">
            {/* Skills Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <h4 className="text-lg font-semibold text-white">Skills</h4>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                {immigrant?.skills && immigrant.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {immigrant.skills.map((skill, index) => (
                      <span
                        key={`skill-${index}`}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full text-sm text-purple-200 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No skills listed</p>
                )}
              </div>
            </div>

            {/* Career Goals Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <h4 className="text-lg font-semibold text-white">Career Goals</h4>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {immigrant?.careerGoals
                    ? immigrant.careerGoals.length > 150
                      ? `${immigrant.careerGoals.substring(0, 150)}...`
                      : immigrant.careerGoals
                    : 'Not provided'}
                </p>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <h4 className="text-lg font-semibold text-white">Profile Status</h4>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-5 w-5 text-cyan-300" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Profile Completion</span>
                      <span className="text-white font-medium">
                        {immigrant?.profileCompletionPercentage ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${immigrant?.profileCompletionPercentage ?? 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Action Buttons */}
          {onAccept && onReject && (
            <div className="relative p-6 border-t border-white/20">
              <div className="flex gap-4">
                <button
                  onClick={onReject}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-400/50 text-gray-200 hover:text-red-200 rounded-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2 group"
                >
                  <X className="h-4 w-4 group-hover:text-red-300 transition-colors" />
                  <span>Decline</span>
                </button>
                
                <button
                  onClick={onAccept}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-emerald-500/50 hover:border-emerald-400/50 flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Accept Match</span>
                </button>
              </div>
              
              {/* Trust & Safety Notice */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  All matches are verified and comply with our community guidelines and privacy standards.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Controls */}
      {/* <div className="mt-8 text-center space-y-4">
        <h3 className="text-white text-lg font-semibold mb-4">Demo - Click buttons above to test</h3>
      </div> */}
    </div>
  );
}

export default function StyledMatchRequestDemo() {
  const handleAccept = () => {
    alert('Match accepted! 🎉');
  };

  const handleReject = () => {
    alert('Match declined 👋');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent mb-2">
            Match Request
          </h1>
          <p className="text-gray-300">Review and respond to potential matches</p>
        </div>
        
        <MatchRequest 
          immigrant={mockImmigrant}
          match={mockMatch}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}

export { MatchRequest };