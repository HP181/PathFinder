"use client";

import React, { useEffect, useState } from "react";
import { MatchRequest } from "./MatchRequest";
import { useAuthStore } from "@/lib/Store/Auth-Store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { getDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/Firebase/Config";
import { ImmigrantProfile, Match } from "@/lib/Firebase/Firestore";

export const fetchMenteeProfile = async (uid: string): Promise<ImmigrantProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    const profileDoc = await getDoc(doc(db, "profiles", uid));

    if (!userDoc.exists()) return null;

    const mergedData = {
      ...userDoc.data(),
      ...(profileDoc.exists() ? profileDoc.data() : {}),
    };

    if (mergedData.role === "immigrant") {
      return mergedData as ImmigrantProfile;
    }

    return null;
  } catch (error) {
    console.error("Error fetching full mentee profile:", error);
    return null;
  }
};

export function MenteeList() {
  const [menteeProfiles, setMenteeProfiles] = useState<Record<string, ImmigrantProfile>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadConnectedMentees = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Query matches where mentorUid = current user and status = 'accepted'
        const matchesQuery = query(
          collection(db, "matches"),
          where("mentorUid", "==", user.uid),
          where("status", "==", "accepted")
        );

        const matchesSnapshot = await getDocs(matchesQuery);
        const fetchedMatches: Match[] = matchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Match[];

        setMatches(fetchedMatches);

        // Fetch mentee profiles for these matches
        const profiles: Record<string, ImmigrantProfile> = {};
        for (const match of fetchedMatches) {
          const profile = await fetchMenteeProfile(match.immigrantUid);
          if (profile) {
            profiles[match.immigrantUid] = profile;
          }
        }

        setMenteeProfiles(profiles);
      } catch (error) {
        console.error("Error loading connected mentees:", error);
        toast.error("Failed to load connected mentees. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadConnectedMentees();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg">Loading connected mentees...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">No connected mentees</p>
        <p className="text-muted-foreground mt-1">You have no accepted connection requests.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => {
        const mentee = menteeProfiles[match.immigrantUid];
        if (!mentee) return null;

        return (
          <MatchRequest
            key={match.id}
            immigrant={mentee}
            match={match}
            // Removed accept/reject handlers because match is already accepted
            // onAccept={undefined}
            // onReject={undefined}
          />
        );
      })}
    </div>
  );
}
