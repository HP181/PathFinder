import React from 'react';

// Type definitions
interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: any;
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  children: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}

interface CardTitleProps {
  children: React.ReactNode;
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

// Mock UI Components styled for Auth Layout (glass/dark theme)
const Card: React.FC<CardProps> = ({ className = "", children }) => (
  <div className={`relative group ${className}`}>
    {/* Glow effect on hover */}
    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
    
    {/* Card content */}
    <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="relative">
        {children}
      </div>
    </div>
  </div>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children }) => (
  <div className="p-6 pb-6">
    {children}
  </div>
);

const CardContent: React.FC<CardContentProps> = ({ children }) => (
  <div className="px-6 pb-6">
    {children}
  </div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
  <div className="p-6 pt-4 border-t border-white/10">
    {children}
  </div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children }) => (
  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-200 transition-colors duration-300">
    {children}
  </h3>
);

const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => (
  <p className="text-gray-300 leading-relaxed text-sm mb-4">
    {children}
  </p>
);

const Button: React.FC<ButtonProps> = ({ className = "", children, onClick, ...props }) => (
  <button 
    className={`w-full inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border border-blue-500/50 hover:border-blue-400/50 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

// UserRole type definition
type UserRole = 'immigrant' | 'mentor' | 'recruiter';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole | null) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-sm font-medium mb-4 backdrop-blur-sm border border-cyan-400/30">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
          Choose Your Role
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
          Join PathFinder
        </h2>
        <p className="text-gray-300 text-sm max-w-md mx-auto">
          Select your role to get started with personalized features
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-2xl">
          <CardHeader>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg backdrop-blur-sm border border-blue-400/30 w-fit mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <CardTitle>Immigrant</CardTitle>
              <CardDescription>Looking for career opportunities and mentorship in Canada</CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Button className='cursor-pointer' onClick={() => onSelectRole('immigrant')}>
              Sign Up as Immigrant
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-2xl border-cyan-400/40">
          <CardHeader>
            <div className="text-center relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg backdrop-blur-sm border border-blue-400/30 w-fit mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <CardTitle>Mentor</CardTitle>
              <CardDescription>Share your professional expertise and help immigrants succeed</CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Button className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-cyan-500/50 hover:border-cyan-400/50" onClick={() => onSelectRole('mentor')}>
              Sign Up as Mentor
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-2xl">
          <CardHeader>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg backdrop-blur-sm border border-blue-400/30 w-fit mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <CardTitle>Recruiter</CardTitle>
              <CardDescription>Find qualified candidates for your organization</CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Button className='cursor-pointer' onClick={() => onSelectRole('recruiter')}>
              Sign Up as Recruiter
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Bottom info */}
      <div className="text-center mt-6 pt-6 border-t border-white/10">
        <p className="text-gray-400 text-sm">
          Not sure which role fits you? 
          <button 
            onClick={() => onSelectRole(null)}
            className="text-cyan-300 hover:text-cyan-200 font-medium ml-1 underline decoration-2 underline-offset-2 decoration-cyan-300/50 hover:decoration-cyan-200/50 transition-colors"
          >
            Learn more
          </button>
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Free to join
          </div>
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure
          </div>
        </div>
      </div>
    </div>
  );
}