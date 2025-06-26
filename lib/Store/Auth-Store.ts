// // import { create } from 'zustand';
// // import { getUserRole } from '../Firebase/Auth';
// // import {auth} from "../Firebase/Config"
// // import { User } from 'firebase/auth';
// // import { UserRole } from '../Firebase/Auth';

// // interface AuthState {
// //   user: User | null;
// //   userRole: UserRole | null;
// //   isLoading: boolean;
// //   isAuthenticated: boolean;
// //   setUser: (user: User | null) => void;
// //   setUserRole: (role: UserRole | null) => void;
// //   setIsLoading: (isLoading: boolean) => void;
// // }

// // export const useAuthStore = create<AuthState>((set) => ({
// //   user: null,
// //   userRole: null,
// //   isLoading: true,
// //   isAuthenticated: false,
// //   setUser: (user) => set({ 
// //     user, 
// //     isAuthenticated: !!user,
// //     isLoading: false,
// //   }),
// //   setUserRole: (userRole) => set({ userRole }),
// //   setIsLoading: (isLoading) => set({ isLoading }),
// // }));

// // // Initialize auth listener
// // export const initializeAuth = () => {
// //   auth.onAuthStateChanged(async (user) => {
// //     const authStore = useAuthStore.getState();
    
// //     if (user) {
// //       const role = await getUserRole(user);
// //       authStore.setUser(user);
// //       authStore.setUserRole(role);
// //     } else {
// //       authStore.setUser(null);
// //       authStore.setUserRole(null);
// //     }
    
// //     authStore.setIsLoading(false);
// //   });
// // };








// // lib/Store/Auth-Store.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { getUserRole } from '../Firebase/Auth';
// import { User } from 'firebase/auth';
// import { UserRole } from '../Firebase/Auth';
// import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
// import { useEffect } from 'react';
// import { auth } from '../Firebase/Config';
// import { signOut as firebaseSignOut } from 'firebase/auth';

// interface AuthState {
//   user: User | null;
//   userRole: UserRole | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   setUser: (user: User | null) => void;
//   setUserRole: (role: UserRole | null) => void;
//   setIsLoading: (isLoading: boolean) => void;
//   signOut: () => Promise<void>;
// }

// // Create a persisted store to maintain state across page navigations
// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       userRole: null,
//       isLoading: true,
//       isAuthenticated: false,
//       setUser: (user) => set({ 
//         user, 
//         isAuthenticated: !!user,
//         isLoading: false,
//       }),
//       setUserRole: (userRole) => set({ userRole }),
//       setIsLoading: (isLoading) => set({ isLoading }),
//       signOut: async () => {
//         // Sign out from both Firebase and NextAuth
//         await nextAuthSignOut();
//         await firebaseSignOut(auth);
//         set({ 
//           user: null, 
//           userRole: null, 
//           isAuthenticated: false 
//         });
//       }
//     }),
//     {
//       name: 'auth-storage', // name of the item in storage
//       // You can choose to exclude some fields from persistence
//       partialize: (state) => ({
//         user: state.user,
//         userRole: state.userRole,
//         isAuthenticated: state.isAuthenticated,
//       }),
//     }
//   )
// );

// // Custom hook to synchronize NextAuth session with Zustand store
// export function useSyncAuthState() {
//   const { data: session, status } = useSession();
//   const { setUser, setUserRole, setIsLoading } = useAuthStore();
  
//   useEffect(() => {
//     // Handle NextAuth session
//     if (status === 'loading') {
//       setIsLoading(true);
//     } else if (status === 'authenticated' && session?.user) {
//       // Create a Firebase-like user object from NextAuth session
//       const userObj = {
//         uid: session.user.id as string,
//         email: session.user.email,
//         displayName: session.user.name,
//         // Add other properties as needed
//       } as unknown as User;
      
//       setUser(userObj);
      
//       // Get the user role
//       getUserRole(userObj).then(role => {
//         setUserRole(role);
//       });
//     } else if (status === 'unauthenticated') {
//       setUser(null);
//       setUserRole(null);
//       setIsLoading(false);
//     }
//   }, [session, status, setUser, setUserRole, setIsLoading]);
  
//   // Also listen to Firebase auth state changes
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: User | null) => {
//       if (firebaseUser) {
//         setUser(firebaseUser);
//         const role = await getUserRole(firebaseUser);
//         setUserRole(role);
//       }
//       setIsLoading(false);
//     });
    
//     return () => unsubscribe();
//   }, [setUser, setUserRole, setIsLoading]);
// }

// // Initialize auth listener (for SSR)
// export const initializeAuth = () => {
//   auth.onAuthStateChanged(async (user: User | null) => {
//     const authStore = useAuthStore.getState();
    
//     if (user) {
//       const role = await getUserRole(user);
//       authStore.setUser(user);
//       authStore.setUserRole(role);
//     } else {
//       authStore.setUser(null);
//       authStore.setUserRole(null);
//     }
    
//     authStore.setIsLoading(false);
//   });
// };








import { create } from "zustand"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getUserRole, type UserRole } from "../Firebase/Auth"
import { auth } from "../Firebase/Config"

interface AuthState {
  user: User | null
  userRole: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setUserRole: (role: UserRole | null) => void
  setIsLoading: (isLoading: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

// Create the store without persistence for auth state to avoid hydration issues
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userRole: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  setUserRole: (userRole) => set({ userRole }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () =>
    set({
      user: null,
      userRole: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    }),
}))

let authListenerInitialized = false

export const initializeAuth = () => {
  // Prevent multiple initializations
  if (authListenerInitialized) {
    return () => {} // Return empty cleanup function
  }

  authListenerInitialized = true
  const { setUser, setUserRole, setIsLoading, setInitialized } = useAuthStore.getState()

  // Set initial loading state
  setIsLoading(true)
  setInitialized(false)

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        // User is signed in
        setUser(user)

        // Get user role
        const role = await getUserRole(user)
        setUserRole(role)
      } else {
        // User is signed out
        setUser(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error("Error in auth state change:", error)
      // On error, reset to unauthenticated state
      setUser(null)
      setUserRole(null)
    } finally {
      // Always set loading to false and initialized to true
      setIsLoading(false)
      setInitialized(true)
    }
  })

  return unsubscribe
}

// Helper function to check if auth is ready
export const useAuthReady = () => {
  const { isInitialized, isLoading } = useAuthStore()
  return isInitialized && !isLoading
}
