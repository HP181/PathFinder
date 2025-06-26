'use client';

import React, { useEffect, useState } from 'react';
import { MentorCard } from './MentorCard';
import { MentorDetailsModal } from './MentorDetailsModal';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useMatchingStore } from '@/lib/Store/MatchingStore';
import { MentorProfile, getAllMentors } from '@/lib/Firebase/Firestore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function MentorList() {
  const [mentors, setMentors] = useState<{ mentor: MentorProfile; compatibilityScore: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useAuthStore();
  const { matches, loadMatches, createMatch } = useMatchingStore();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        const mentorList = await getAllMentors();
        const withScores = mentorList.map((mentor) => ({
          mentor,
          compatibilityScore: Math.random(), // Replace with real logic
        }));

        setMentors(withScores);

        if (user) {
          await loadMatches(user.uid, 'immigrant');
        }
      } catch (error) {
        console.error('Error loading mentor data:', error);
        toast.error('Failed to load mentor recommendations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, loadMatches]);

  const handleRequestConnection = async (mentorUid: string, compatibilityScore: number) => {
    if (!user) {
      toast.error('Please log in to request a connection with a mentor.');
      return;
    }

    try {
      await createMatch(user.uid, mentorUid, compatibilityScore);
      toast.success('Your request has been sent to the mentor.');
    } catch (error) {
      console.error('Error requesting connection:', error);
      toast.error('Failed to send connection request. Please try again later.');
    }
  };

  const getMatchStatus = (mentorUid: string) => {
    const match = matches.find((m) => m.mentorUid === mentorUid);
    return {
      isPending: match?.status === 'pending',
      isConnected: match?.status === 'accepted',
    };
  };

  const hasMatchWithMentor = (mentor: MentorProfile | null) => {
    if (!mentor || !user) return false;
    return matches.some(
      (m) => m.mentorUid === mentor.uid && m.immigrantUid === user.uid && m.status === 'accepted'
    );
  };

  const openModal = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMentor(null);
    setModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        {/* Loading State with Glass Theme */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30 blur animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 animate-ping"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                  Finding Perfect Matches
                </h3>
                <p className="text-gray-300">Analyzing mentors based on your profile and goals...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        {/* Empty State with Glass Theme */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 opacity-30 blur"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-xl backdrop-blur-sm border border-orange-400/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent mb-2">
                  No Mentors Available
                </h3>
                <p className="text-gray-300 max-w-md">
                  We're constantly growing our mentor network. Check back soon for new mentorship opportunities!
                </p>
              </div>
              <button className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-orange-500/50 hover:border-orange-400/50 cursor-pointer">
                Notify Me When Available
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Mentor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map(({ mentor, compatibilityScore }) => {
          const { isPending, isConnected } = getMatchStatus(mentor.uid);
          const canViewDetails = hasMatchWithMentor(mentor);

          return (
            <div key={mentor.uid} className="relative group">
              {/* Animated glow effect for high compatibility */}
              {compatibilityScore > 0.8 && (
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 opacity-40 blur group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
              )}
              {compatibilityScore > 0.6 && compatibilityScore <= 0.8 && (
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 opacity-30 blur group-hover:opacity-50 transition-opacity duration-300"></div>
              )}
              {compatibilityScore <= 0.6 && (
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600 opacity-20 blur group-hover:opacity-40 transition-opacity duration-300"></div>
              )}
              
              {/* Card Container */}
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                <div className="relative">
                  <MentorCard
                    mentor={mentor}
                    compatibilityScore={compatibilityScore}
                    onRequestConnection={() => handleRequestConnection(mentor.uid, compatibilityScore)}
                    onShowDetails={() => openModal(mentor)}
                    isPending={isPending}
                    isConnected={isConnected}
                    canViewDetails={canViewDetails}
                  />
                </div>
              </div>

              {/* Compatibility Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                  compatibilityScore > 0.8 
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' 
                    : compatibilityScore > 0.6 
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/50'
                    : 'bg-gray-500/20 text-gray-200 border-gray-400/50'
                }`}>
                  {Math.round(compatibilityScore * 100)}% Match
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {mentors.length >= 9 && (
        <div className="flex justify-center mt-8">
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-cyan-500/50 hover:border-cyan-400/50 cursor-pointer">
            Load More Mentors
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && hasMatchWithMentor(selectedMentor) && selectedMentor && (
        <MentorDetailsModal
          mentor={selectedMentor}
          isOpen={modalOpen}
          onClose={closeModal}
        />
      )}

      {/* Global Cursor Styling */}
      <style jsx global>{`
        /* Ensure all buttons and interactive elements have pointer cursor */
        button, a, [role="button"], .cursor-pointer, 
        select, option,
        input[type="submit"], input[type="button"], 
        button[type="submit"], button[type="button"] {
          cursor: pointer !important;
        }
        
        /* Interactive elements */
        .hover\\:scale-105:hover, 
        .hover\\:bg-white\\/20:hover, 
        .hover\\:border-cyan-400\\/50:hover,
        .hover\\:from-cyan-700:hover,
        .hover\\:to-blue-700:hover,
        .group:hover .group-hover\\:scale-105 {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}