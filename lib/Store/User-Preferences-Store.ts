import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserPreferencesState {
  theme: "light" | "dark" | "system"
  sidebarCollapsed: boolean
  language: string
  setTheme: (theme: "light" | "dark" | "system") => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setLanguage: (language: string) => void
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarCollapsed: false,
      language: "en",
      setTheme: (theme) => set({ theme }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "user-preferences",
    },
  ),
)
