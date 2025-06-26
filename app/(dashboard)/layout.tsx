"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Navbar } from "@/components/Dashboard/Navbar"
import { Sidebar } from "@/components/Dashboard/Sidebar"
import { useAuthStore, initializeAuth, useAuthReady } from "@/lib/Store/Auth-Store"
import { useProfileStore } from "@/lib/Store/ProfileStore"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, isLoading, isAuthenticated, isInitialized } = useAuthStore()
  const { loadProfile } = useProfileStore()
  const router = useRouter()
  const pathname = usePathname()
  const authReady = useAuthReady()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Initialize auth listener once
  useEffect(() => {
    const cleanup = initializeAuth()
    return cleanup
  }, [])

  // Load user profile when user is available
  useEffect(() => {
    if (user?.uid && !hasRedirected) {
      loadProfile(user.uid).catch(console.error)
    }
  }, [user?.uid, loadProfile, hasRedirected])

  // Handle redirects only when auth is ready
  useEffect(() => {
    // Don't do anything until auth is fully initialized
    if (!authReady || hasRedirected) {
      return
    }

    if (!isAuthenticated) {
      setHasRedirected(true)
      router.push("/login")
      return
    }

    // If user is authenticated but we don't have a role yet, wait
    if (!userRole) {
      return
    }

    // Check if user is on the correct path for their role
    if (!pathname.includes(`/${userRole}`)) {
      setHasRedirected(true)

      const roleRoutes = {
        immigrant: "/immigrant/profile",
        mentor: "/mentor/profile",
        recruiter: "/recruiter/profile",
        admin: "/admin/users",
      }

      const targetRoute = roleRoutes[userRole as keyof typeof roleRoutes]
      if (targetRoute) {
        router.push(targetRoute)
      } else {
        router.push("/")
      }
    }
  }, [authReady, isAuthenticated, userRole, pathname, router, hasRedirected])

  // Show loading while auth is initializing
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    )
  }

  // Show loading while we have a user but no role
  if (isAuthenticated && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or no role, don't render anything (redirect will happen)
  if (!isAuthenticated || !userRole) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userRole={userRole} />

      <div className="flex-1 flex">
        <Sidebar userRole={userRole} />

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
