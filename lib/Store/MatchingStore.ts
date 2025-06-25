import { create } from 'zustand';
import { 
  Match, 
  createMatchRequest, 
  updateMatchStatus, 
  getMatchesByImmigrant, 
  getMatchesByMentor 
} from '../Firebase/Firestore';
import { UserRole } from '../Firebase/Auth';

interface MatchingState {
  matches: Match[];
  selectedMatch: Match | null;
  isLoading: boolean;
  loadMatches: (uid: string, role: UserRole) => Promise<void>;
  createMatch: (immigrantUid: string, mentorUid: string, compatibilityScore: number) => Promise<string>;
  updateMatch: (matchId: string, status: 'accepted' | 'rejected') => Promise<void>;
  selectMatch: (match: Match | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
  matches: [],
  selectedMatch: null,
  isLoading: false,
  
  loadMatches: async (uid: string, role: UserRole) => {
    set({ isLoading: true });
    
    try {
      let matches: Match[] = [];
      
      if (role === 'immigrant') {
        matches = await getMatchesByImmigrant(uid);
      } else if (role === 'mentor') {
        matches = await getMatchesByMentor(uid);
      }
      
      set({ matches, isLoading: false });
    } catch (error) {
      console.error('Error loading matches:', error);
      set({ isLoading: false });
    }
  },
  
  createMatch: async (immigrantUid: string, mentorUid: string, compatibilityScore: number) => {
    set({ isLoading: true });
    
    try {
      const matchId = await createMatchRequest(
        immigrantUid,
        mentorUid,
        compatibilityScore
      );
      
      // Reload matches after creating a new one
      const { loadMatches } = get();
      await loadMatches(immigrantUid, 'immigrant');
      
      set({ isLoading: false });
      return matchId;
    } catch (error) {
      console.error('Error creating match:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateMatch: async (matchId: string, status: 'accepted' | 'rejected') => {
    set({ isLoading: true });
    
    try {
      await updateMatchStatus(matchId, status);
      
      // Update the match in the local state
      const updatedMatches = get().matches.map(match => {
        if (match.id === matchId) {
          return { ...match, status };
        }
        return match;
      });
      
      set({ matches: updatedMatches, isLoading: false });
    } catch (error) {
      console.error('Error updating match:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  selectMatch: (match: Match | null) => set({ selectedMatch: match }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));