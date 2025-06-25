import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  UserCredential,
  User
} from 'firebase/auth';
import { auth } from './Config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './Config';

export type UserRole = 'immigrant' | 'mentor' | 'recruiter' | 'admin';

// Create a user with email and password
export const createUser = async (
  email: string, 
  password: string, 
  displayName: string,
  role: UserRole
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update the user profile with displayName
  await updateProfile(userCredential.user, { displayName });
  
  // Create a user document in Firestore with the role
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email,
    displayName,
    role,
    createdAt: new Date().toISOString(),
    profileCompleted: false,
  });
  
  return userCredential;
};

// Sign in with email and password
export const signIn = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Sign out
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

// Get user role from Firestore
export const getUserRole = async (user: User): Promise<UserRole | null> => {
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};