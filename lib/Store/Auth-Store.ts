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
