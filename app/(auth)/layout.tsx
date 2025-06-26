import React from 'react';

// Type definitions
interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

// Mock Link component to simulate Next.js Link
const Link: React.FC<LinkProps> = ({ href, children, className, ...props }) => (
  <a href={href} className={className} {...props}>
    {children}
  </a>
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-10 animate-pulse delay-500"></div>
      
      <header className="relative border-b border-white/20 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105">
              <div className="bg-white/10 p-2 rounded-xl mr-3 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-white group-hover:text-cyan-300 transition-colors duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                  />
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                PathFinder
              </span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="relative flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Content Wrapper with Glass Effect */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30 blur animate-pulse"></div>
            
            {/* Main Content Container */}
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative border-t border-white/20 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-center items-center">
            <p className="text-center text-sm text-gray-300">
              &copy; 2025 PathFinder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}