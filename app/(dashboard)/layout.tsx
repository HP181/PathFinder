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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full opacity-10 animate-pulse delay-1000"></div>

        {/* Loading Content */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30 blur animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-cyan-400"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 animate-ping"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
                  PathFinder
                </h3>
                <p className="text-sm text-gray-300">Initializing your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while we have a user but no role
  if (isAuthenticated && !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full opacity-10 animate-pulse delay-1000"></div>

        {/* Loading Content */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 opacity-30 blur animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-emerald-400"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 opacity-20 animate-ping"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent mb-2">
                  Welcome back!
                </h3>
                <p className="text-sm text-gray-300">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated or no role, don't render anything (redirect will happen)
  if (!isAuthenticated || !userRole) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Subtle Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-5 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full opacity-5 animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-5 animate-pulse delay-500 pointer-events-none"></div>

      {/* Glass Navbar */}
      <div className="relative z-10">
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
          <Navbar userRole={userRole} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative z-10">
        {/* Glass Sidebar */}
        <div className="relative">
          <div className="bg-white/5 backdrop-blur-md border-r border-white/10 h-full">
            <Sidebar userRole={userRole} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative">
          {/* Content Background */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
          
          {/* Content Wrapper */}
          <div className="relative p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Cursor Styling */}
      <style jsx global>{`
        /* Ensure all buttons and links have pointer cursor */
        button, a, [role="button"], .cursor-pointer, 
        input[type="submit"], input[type="button"], 
        button[type="submit"], button[type="button"] {
          cursor: pointer !important;
        }
        
        /* Interactive elements */
        .hover\\:scale-105:hover, 
        .hover\\:bg-white\\/20:hover, 
        .hover\\:border-cyan-400\\/50:hover,
        .hover\\:bg-white\\/10:hover,
        [data-state="open"],
        .data-\\[state\\=open\\]:hover {
          cursor: pointer !important;
        }

        /* Navigation and sidebar elements */
        nav a, nav button, 
        .sidebar a, .sidebar button,
        .navbar a, .navbar button {
          cursor: pointer !important;
        }

        /* Form elements */
        select, textarea, input[type="text"], 
        input[type="email"], input[type="password"],
        input[type="search"], input[type="url"] {
          cursor: text !important;
        }

        /* Disabled elements */
        button:disabled, 
        input:disabled, 
        select:disabled, 
        textarea:disabled,
        .disabled {
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  )
}