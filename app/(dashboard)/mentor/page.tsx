'use client';

import React, { useEffect, useState } from 'react';
import { MentorList } from '@/components/Matching/MentorList';
import { MatchRequest } from '@/components/Matching/MatchRequest';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import {
  getMatchesByMentor,
  getUserProfile,
  ImmigrantProfile,
  Match,
  updateMatchStatus,
} from '@/lib/Firebase/Firestore';
import { toast } from 'sonner';

export default function FindConnectionRequests() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<
    { match: Match; immigrant: ImmigrantProfile }[]
  >([]);

  useEffect(() => {
    console.log('Requests state updated:', requests);
  }, [requests]);

  useEffect(() => {
    if (!user) {
      console.log('No user logged in yet, skipping loadConnectionRequests');
      return;
    }
    console.log('Loading connection requests for mentor UID:', user.uid);
    const loadConnectionRequests = async () => {
      try {
        const matchDocs = await getMatchesByMentor(user.uid);
        console.log('Fetched matches:', matchDocs);

        const pendingMatches = matchDocs.filter(m => m.status === 'pending');
        console.log('Filtered pending matches:', pendingMatches);

        const enrichedMatches = await Promise.all(
          pendingMatches.map(async (match) => {
            const immigrantProfile = await getUserProfile(match.immigrantUid);
            console.log('immigrantProfile', immigrantProfile);
            if (!immigrantProfile || immigrantProfile.role !== 'immigrant') {
              console.log('Skipped non-immigrant or null profile for match:', match);
              return null;
            }
            console.log('Enriched match with immigrant profile:', { match, immigrantProfile });
            return { match, immigrant: immigrantProfile };
          })
        );

        const filtered = enrichedMatches.filter(Boolean) as { match: Match; immigrant: ImmigrantProfile }[];
        console.log('Final enriched and filtered requests:', filtered);
        setRequests(filtered);
      } catch (error) {
        console.error('Error fetching connection requests:', error);
        toast.error('Failed to load connection requests.');
      }
    };
    loadConnectionRequests();
  }, [user]);

  const handleAccept = async (matchId: string) => {
    console.log('Accepting match with ID:', matchId);
    try {
      await updateMatchStatus(matchId, 'accepted');
      toast.success('Connection accepted.');
      setRequests(prev => {
        const filtered = prev.filter(r => r.match.id !== matchId);
        console.log('Requests after accept filter:', filtered);
        return filtered;
      });
    } catch (err) {
      console.error('Failed to accept request:', err);
      toast.error('Failed to accept request.');
    }
  };

  const handleReject = async (matchId: string) => {
    console.log('Rejecting match with ID:', matchId);
    try {
      await updateMatchStatus(matchId, 'rejected');
      toast.success('Connection declined.');
      setRequests(prev => {
        const filtered = prev.filter(r => r.match.id !== matchId);
        console.log('Requests after reject filter:', filtered);
        return filtered;
      });
    } catch (err) {
      console.error('Failed to reject request:', err);
      toast.error('Failed to reject request.');
    }
  };

  return (
    <div className="space-y-6">
      

      {requests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Connection Requests</h2>
          {requests.map(({ match, immigrant }) => (
            <MatchRequest
              key={match.id}
              match={match}
              immigrant={immigrant}
              onAccept={() => handleAccept(match.id!)}
              onReject={() => handleReject(match.id!)}
            />
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mt-6">Recommended Mentors</h2>
        {/* <MentorList /> */}
      </div>
    </div>
  );
}
