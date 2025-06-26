import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  addDoc,
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
  availability?: Array<{
    date: string;      // e.g., '2025-06-28'
    startTime: string; // e.g., '09:00'
    endTime: string;   // e.g., '10:00'
    status: 'available' | 'booked'; // NEW status field to track booking
  }>;
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
  resumeUrl?: string;
  resumeData?: any;
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
      p.availability && Array.isArray(p.availability) && p.availability.length > 0,
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

// Get user profile (merged from users + profiles)
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

    return {
      ...userData,
      ...profileData,
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
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

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
};

// Get all mentors (merged data from users + profiles)
export const getAllMentors = async (): Promise<MentorProfile[]> => {
  try {
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'mentor'));
    const usersSnapshot = await getDocs(usersQuery);

    const mentors: MentorProfile[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const profileRef = doc(db, 'profiles', userDoc.id);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : {};

      mentors.push({
        uid: userDoc.id,
        displayName: userData.displayName ?? '',
        email: userData.email ?? '',
        role: 'mentor',
        professionalBackground: profileData.professionalBackground ?? '',
        expertise: profileData.expertise ?? [],
        industries: profileData.industries ?? [],
        availability: Array.isArray(profileData.availability) ? profileData.availability : [],
        createdAt: userData.createdAt ?? '',
        updatedAt: userData.updatedAt ?? '',
        profileCompleted: userData.profileCompleted ?? false,
        profileCompletionPercentage: userData.profileCompletionPercentage ?? 0,
        resumeUrl: profileData.resumeUrl ?? '',
        resumeData: profileData.resumeData ?? {},
      });
    }

    return mentors;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return [];
  }
};

// AvailabilitySlot type
export type AvailabilitySlot = {
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
};

// Set mentor availability (overwrite all slots)
export const setMentorAvailability = async (
  mentorUid: string,
  availability: AvailabilitySlot[]
): Promise<void> => {
  const mentorRef = doc(db, 'profiles', mentorUid);
  await updateDoc(mentorRef, {
    availability,
    updatedAt: new Date().toISOString(),
  });
};

// Get mentor availability
export const getMentorAvailabilityFromFirestore = async (
  mentorUid: string
): Promise<AvailabilitySlot[] | null> => {
  const mentorRef = doc(db, 'profiles', mentorUid);
  const docSnap = await getDoc(mentorRef);
  
  if (!docSnap.exists()) {
    console.warn(`Mentor profile not found for uid: ${mentorUid}`);
    return null;
  }
  
  const data = docSnap.data();
  return Array.isArray(data?.availability) ? data.availability : null;
};

// Add a single availability slot
export const addAvailabilitySlot = async (
  mentorUid: string,
  slot: AvailabilitySlot
): Promise<void> => {
  const current = await getMentorAvailabilityFromFirestore(mentorUid);
  const updated = [...(current ?? []), slot];
  await setMentorAvailability(mentorUid, updated);
};

// Remove a single availability slot
export const removeAvailabilitySlot = async (
  mentorUid: string,
  slotToRemove: AvailabilitySlot
): Promise<void> => {
  const current = await getMentorAvailabilityFromFirestore(mentorUid);
  const updated = (current ?? []).filter(
    (slot) =>
      !(
        slot.date === slotToRemove.date &&
        slot.startTime === slotToRemove.startTime &&
        slot.endTime === slotToRemove.endTime
      )
  );
  await setMentorAvailability(mentorUid, updated);
};




// Updated Firestore interfaces - add to lib/Firebase/Firestore.ts

// Extended ImmigrantProfile interface with coding assessment
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
  // New fields for credential assessment
  credentialDocumentUrl?: string;
  credentialAssessment?: {
    canadianEquivalent: string;
    requiredLicenses: string[];
    recommendedActions: string[];
    explanation: string;
  };
  // New fields for coding assessment
  codingAssessments?: CodingAssessment[];
}

// Coding assessment interfaces
export interface CodingQuestion {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string; // e.g., "algorithms", "data structures", "web development"
  expectedOutput?: string;
}

export interface CodingAnswer {
  questionId: string;
  answer: string; // The code solution provided by the user
  language: string; // e.g., "javascript", "python", "java"
  submittedAt: string;
}

export interface CodingReview {
  questionId: string;
  correctness: number; // 0-100 score
  efficiency: number; // 0-100 score
  readability: number; // 0-100 score
  overallScore: number; // 0-100 score
  feedback: string;
  improvements: string[];
  reviewedAt: string;
}

export interface CodingAssessment {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
  questions: CodingQuestion[];
  answers?: Record<string, CodingAnswer>;
  reviews?: Record<string, CodingReview>;
}

// New functions for coding assessments

// Generate coding questions based on resume
export const generateCodingQuestions = async (
  userId: string
): Promise<CodingAssessment | null> => {
  try {
    // Get user profile to access resume URL
    const profile = await getUserProfile(userId);
    
    if (!profile || !profile.resumeUrl) {
      console.error('Cannot generate questions: User profile or resume not found');
      return null;
    }
    
    // Call the API to generate questions based on the resume
    const response = await fetch('/api/generate-coding-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        resumeUrl: profile.resumeUrl
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate coding questions');
    }
    
    const assessment = await response.json();
    
    // Save the assessment to Firestore
    await saveCodingAssessment(userId, assessment);
    
    return assessment;
  } catch (error) {
    console.error('Error generating coding questions:', error);
    return null;
  }
};

// Save coding assessment to Firestore
export const saveCodingAssessment = async (
  userId: string,
  assessment: CodingAssessment
): Promise<void> => {
  try {
    // Get the user profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      throw new Error('Profile not found');
    }
    
    const profileData = profileSnap.data();
    const currentAssessments = profileData.codingAssessments || [];
    
    // Check if this assessment already exists
    const existingIndex = currentAssessments.findIndex((a: CodingAssessment) => a.id === assessment.id);
    
    if (existingIndex >= 0) {
      // Update existing assessment
      currentAssessments[existingIndex] = assessment;
    } else {
      // Add new assessment
      currentAssessments.push(assessment);
    }
    
    // Update the profile
    await updateDoc(profileRef, {
      codingAssessments: currentAssessments,
      updatedAt: new Date().toISOString()
    });
    
    // Also create a separate document in assessments collection for querying
    const assessmentRef = doc(db, 'assessments', assessment.id);
    await setDoc(assessmentRef, {
      ...assessment,
      userId,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error saving coding assessment:', error);
    throw error;
  }
};

// Submit answers for coding questions
export const submitCodingAnswers = async (
  userId: string,
  assessmentId: string,
  answers: Record<string, CodingAnswer>
): Promise<CodingAssessment | null> => {
  try {
    // Get the user profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      throw new Error('Profile not found');
    }
    
    const profileData = profileSnap.data();
    const assessments = profileData.codingAssessments || [];
    
    // Find the assessment
    const assessmentIndex = assessments.findIndex((a: CodingAssessment) => a.id === assessmentId);
    
    if (assessmentIndex < 0) {
      throw new Error('Assessment not found');
    }
    
    // Update the assessment with answers
    const assessment = assessments[assessmentIndex];
    assessment.answers = answers;
    assessment.status = 'completed';
    assessment.updatedAt = new Date().toISOString();
    
    // Update the profile
    await updateDoc(profileRef, {
      codingAssessments: assessments,
      updatedAt: new Date().toISOString()
    });
    
    // Update the assessment document
    const assessmentRef = doc(db, 'assessments', assessmentId);
    await updateDoc(assessmentRef, {
      answers,
      status: 'completed',
      updatedAt: new Date().toISOString()
    });
    
    // Call the API to review the answers
    const response = await fetch('/api/review-coding-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        assessmentId,
        answers
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to review coding answers');
    }
    
    const updatedAssessment = await response.json();
    
    // Save the review results
    await saveCodingAssessment(userId, updatedAssessment);
    
    return updatedAssessment;
  } catch (error) {
    console.error('Error submitting coding answers:', error);
    return null;
  }
};

// Get a specific coding assessment
export const getCodingAssessment = async (
  userId: string,
  assessmentId: string
): Promise<CodingAssessment | null> => {
  try {
    // Get the user profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return null;
    }
    
    const profileData = profileSnap.data();
    const assessments = profileData.codingAssessments || [];
    
    // Find the assessment
    const assessment = assessments.find((a: CodingAssessment) => a.id === assessmentId);
    
    return assessment || null;
  } catch (error) {
    console.error('Error getting coding assessment:', error);
    return null;
  }
};

// Get all coding assessments for a user
export const getUserCodingAssessments = async (
  userId: string
): Promise<CodingAssessment[]> => {
  try {
    // Get the user profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return [];
    }
    
    const profileData = profileSnap.data();
    const assessments = profileData.codingAssessments || [];
    
    return assessments;
  } catch (error) {
    console.error('Error getting user coding assessments:', error);
    return [];
  }
};