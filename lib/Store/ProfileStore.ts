import { create } from 'zustand';
import { 
  UserProfile,
  createOrUpdateProfile, 
  getUserProfile 
} from '../Firebase/Firestore';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  profileCompletionPercentage: number;
  loadProfile: (uid: string) => Promise<void>;
  updateProfile: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  profileCompletionPercentage: 0,
  
  loadProfile: async (uid: string) => {
    set({ isLoading: true });
    try {
      const profile = await getUserProfile(uid);
      set({ 
        profile, 
        profileCompletionPercentage: profile?.profileCompletionPercentage || 0,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ isLoading: false });
    }
  },
  
  updateProfile: async (updatedProfile: Partial<UserProfile>) => {
    set({ isLoading: true });
    
    try {
      const currentProfile = get().profile;
      
      if (!currentProfile) {
        console.error('updateProfile called but no profile loaded');
        throw new Error('No profile loaded');
      }
      
      const newProfile = {
        ...currentProfile,
        ...updatedProfile,
      } as UserProfile;
      
      await createOrUpdateProfile(newProfile);
      
      set({ 
        profile: newProfile,
        profileCompletionPercentage: newProfile.profileCompletionPercentage || 0,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));
