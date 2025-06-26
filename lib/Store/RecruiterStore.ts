// @/lib/Store/RecruiterStore.ts

import { create } from 'zustand';

export interface RecruiterProfile {
  // Recruiter Info
  displayName: string;
  email: string;
  phone: string;
  linkedIn?: string;
  position: string;
  role: 'recruiter';
  createdAt: string;
  updatedAt: string;
  // Company Info
  companyName: string;
  companyWebsite: string;
  companyIndustry: string | null;
  location: string | null;
  companyDescription: string | null;

  // Job Description Details
  // jobDescription: string; // Markdown
  // skillsRequired: string[];
  // salaryRange: string;

  // File (optional backup or alternate)
  // jobDocUrl?: string;

  // Completion
  profileCompletionPercentage: number;
}

interface RecruiterStore {
  profile: RecruiterProfile | null;
  setProfile: (profile: RecruiterProfile) => void;
  updateProfile: (data: Partial<RecruiterProfile>) => void;
  clearProfile: () => void;
  calculateCompletion: (profile: Partial<RecruiterProfile>) => number;
}

export const useRecruiterStore = create<RecruiterStore>((set, get) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),

  updateProfile: (data) => {
    const current = get().profile || {
      displayName: '',
      email: '',
      phone: '',
      linkedIn: '',
      position: '',
      role: 'recruiter',
      createdAt: '',
      updatedAt: '',
      companyName: '',
      companyWebsite: '',
      companyIndustry: null,
      location: null,
      companyDescription: null,
      profileCompletionPercentage: 0,
    };

    const updatedProfile = {
      ...current,
      ...data,
    };

    const completion = get().calculateCompletion(updatedProfile);

    set({
      profile: {
        ...updatedProfile,
        profileCompletionPercentage: completion,
      },
    });
  },

  clearProfile: () => set({ profile: null }),

  calculateCompletion: (profile) => {
    const steps = [
      { key: 'fullName' },
      { key: 'email' },
      { key: 'phone' },
      { key: 'linkedIn' },
      { key: 'position' },
      { key: 'companyName' },
      { key: 'companyWebsite' },
      { key: 'companyIndustry' },
      { key: 'location' },
      { key: 'companyDescription' },
      // { key: 'jobDescription' },
      // {
      //   key: 'skillsRequired',
      //   validator: (val: any) => Array.isArray(val) && val.length > 0,
      // },
      // { key: 'salaryRange' },
    ];

    const completed = steps.filter(({ key}) => {
      const value = (profile as any)[key];
      return Boolean(value);
    });

    return Math.floor((completed.length / steps.length) * 100);
  },
}));
