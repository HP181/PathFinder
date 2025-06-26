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
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg">Finding the best mentors for you...</p>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">No mentors available</p>
        <p className="text-muted-foreground mt-1">Check back later for mentor recommendations.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map(({ mentor, compatibilityScore }) => {
          const { isPending, isConnected } = getMatchStatus(mentor.uid);
          const canViewDetails = hasMatchWithMentor(mentor);

          return (
            <MentorCard
              key={mentor.uid}
              mentor={mentor}
              compatibilityScore={compatibilityScore}
              onRequestConnection={() => handleRequestConnection(mentor.uid, compatibilityScore)}
              onShowDetails={() => openModal(mentor)}
              isPending={isPending}
              isConnected={isConnected}
              canViewDetails={canViewDetails}
            />
          );
        })}
      </div>

      {/* ✅ Show modal only if a match exists */}
      {modalOpen && hasMatchWithMentor(selectedMentor) && selectedMentor && (
        <MentorDetailsModal
          mentor={selectedMentor}
          isOpen={modalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}
