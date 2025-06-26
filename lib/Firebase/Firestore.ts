import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentReference
} from 'firebase/firestore';
import { db } from './Config';
import { UserRole } from './Auth';

// User profile interfaces
export interface ImmigrantProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'immigrant';
  phone?: string;
  skills: string[];
  careerGoals: string;
  resumeUrl?: string;
  resumeData?: any; // Parsed resume data from DocumentAI
  selfAssessment?: Record<string, number>; // Skill self-assessment
  createdAt: string;
  updatedAt: string;
  profileCompleted: boolean;
  profileCompletionPercentage: number;
}

export interface MentorProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'mentor';
  phone?: string;
  professionalBackground: string;
  expertise: string[];
  industries: string[];
  availability: Record<string, any>; // Structured availability data
  resumeUrl?: string;
  resumeData?: any; // Parsed resume data from DocumentAI
  createdAt: string;
  updatedAt: string;
  profileCompleted: boolean;
  profileCompletionPercentage: number;
}

export interface RecruiterProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'recruiter';
  company: string;
  industry: string;
  phone?: string;
  // resumeUrl?: string; // ✅ Add this to fix type errors
  // resumeData?: any;
  createdAt: string;
  updatedAt: string;
  profileCompleted: boolean;
  profileCompletionPercentage: number;
}


export type UserProfile = ImmigrantProfile | MentorProfile | RecruiterProfile;

// Create or update user profile
export const createOrUpdateProfile = async (
  profile: UserProfile
): Promise<void> => {
  const userRef = doc(db, 'profiles', profile.uid);
  
  // Calculate profile completion percentage
  let completionPercentage = 0;
  if (profile.role === 'immigrant') {
    const p = profile as ImmigrantProfile;
    const fields = [
      p.displayName, 
      p.email, 
      p.phone, 
      p.skills?.length > 0, 
      p.careerGoals, 
      p.resumeUrl
    ];
    completionPercentage = Math.round(
      (fields.filter(Boolean).length / fields.length) * 100
    );
  } else if (profile.role === 'mentor') {
    const p = profile as MentorProfile;
    const fields = [
      p.displayName, 
      p.email, 
      p.phone, 
      p.professionalBackground, 
      p.expertise?.length > 0, 
      p.industries?.length > 0, 
      p.availability && Object.keys(p.availability).length > 0,
      p.resumeUrl
    ];
    completionPercentage = Math.round(
      (fields.filter(Boolean).length / fields.length) * 100
    );
  } else if (profile.role === 'recruiter') {
    const p = profile as RecruiterProfile;
    const fields = [
      p.displayName, 
      p.email, 
      p.phone, 
      p.company, 
      p.industry
    ];
    completionPercentage = Math.round(
      (fields.filter(Boolean).length / fields.length) * 100
    );
  }
  
  // Update the profile with completion percentage
  await setDoc(userRef, {
    ...profile,
    profileCompletionPercentage: completionPercentage,
    profileCompleted: completionPercentage === 100,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  
  // Also update the user document
  await updateDoc(doc(db, 'users', profile.uid), {
    profileCompleted: completionPercentage === 100,
    profileCompletionPercentage: completionPercentage,
  });
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const profileDocRef = doc(db, 'profiles', uid);

    const [userSnap, profileSnap] = await Promise.all([
      getDoc(userDocRef),
      getDoc(profileDocRef),
    ]);

    if (!userSnap.exists()) {
      console.warn(`User document not found for uid: ${uid}`);
      return null;
    }

    const userData = userSnap.data();
    const profileData = profileSnap.exists() ? profileSnap.data() : {};

    const mergedData = {
      ...userData,
      ...profileData,
    };

    // Return as UserProfile with inferred role
    return mergedData as UserProfile;
  } catch (error) {
    console.error('Error getting user profile (merged):', error);
    return null;
  }
};

// Job interfaces
export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  recruiterUid: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Create a job
export const createJob = async (job: Job): Promise<string> => {
  const jobsCollection = collection(db, 'jobs');
  const docRef = await addDoc(jobsCollection, {
    ...job,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  });
  
  return docRef.id;
};

// Get jobs by recruiter
export const getJobsByRecruiter = async (recruiterUid: string): Promise<Job[]> => {
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('recruiterUid', '==', recruiterUid)
  );
  
  const querySnapshot = await getDocs(jobsQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Job));
};

// Match interfaces
export interface Match {
  id?: string;
  immigrantUid: string;
  mentorUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  compatibilityScore: number;
  createdAt: string;
  updatedAt: string;
}

// Create a match request
export const createMatchRequest = async (
  immigrantUid: string,
  mentorUid: string,
  compatibilityScore: number
): Promise<string> => {
  const matchesCollection = collection(db, 'matches');
  const docRef = await addDoc(matchesCollection, {
    immigrantUid,
    mentorUid,
    status: 'pending',
    compatibilityScore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  return docRef.id;
};

// Update match status
export const updateMatchStatus = async (
  matchId: string,
  status: 'accepted' | 'rejected'
): Promise<void> => {
  const matchRef = doc(db, 'matches', matchId);
  
  await updateDoc(matchRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
};

// Get matches by immigrant
export const getMatchesByImmigrant = async (immigrantUid: string): Promise<Match[]> => {
  const matchesQuery = query(
    collection(db, 'matches'),
    where('immigrantUid', '==', immigrantUid)
  );
  
  const querySnapshot = await getDocs(matchesQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
};

// Get matches by mentor
export const getMatchesByMentor = async (mentorUid: string): Promise<Match[]> => {
  const matchesQuery = query(
    collection(db, 'matches'),
    where('mentorUid', '==', mentorUid)
  );
  
  const querySnapshot = await getDocs(matchesQuery);

  console.log("ewf", querySnapshot);
  
  const w = await querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
  console.log("w", w);

  return w;
};


// Get all mentors from the 'users' collection
export const getAllMentors = async (): Promise<MentorProfile[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'mentor'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<MentorProfile>;

      return {
        uid: data.uid ?? '',
        displayName: data.displayName ?? '',
        email: data.email ?? '',
        role: 'mentor',
        professionalBackground: data.professionalBackground ?? '',
        expertise: data.expertise ?? [],
        industries: data.industries ?? [],
        availability: data.availability ?? {},
        createdAt: data.createdAt ?? '',
        updatedAt: data.updatedAt ?? '',
        profileCompleted: data.profileCompleted ?? false,
        profileCompletionPercentage: data.profileCompletionPercentage ?? 0,
        resumeUrl: data.resumeUrl ?? '',
        resumeData: data.resumeData ?? {},
      };
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return [];
  }
};




