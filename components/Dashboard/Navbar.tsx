import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserDropdown } from './UserDropdown';
import { ThemeToggle } from './ThemeToggle';
import { Bell } from 'lucide-react';
import { UserRole } from '@/lib/Firebase/Auth';

interface NavbarProps {
  userRole: UserRole;
}

export function Navbar({ userRole }: NavbarProps) {
  const pathname = usePathname();
  
  // Define navigation links based on user role
  const getNavigationLinks = () => {
    switch (userRole) {
      case 'immigrant':
        return [
          { name: 'Profile', href: '/immigrant/profile' },
          { name: 'Mentors', href: '/immigrant/mentors' },
          { name: 'Jobs', href: '/immigrant/jobs' },
          { name: 'AI Coach', href: '/immigrant/coach' },
        ];
      case 'mentor':
        return [
          { name: 'Profile', href: '/mentor/profile' },
          { name: 'Mentees', href: '/mentor/mentees' },
          { name: 'Availability', href: '/mentor/availability' },
        ];
      case 'recruiter':
        return [
          { name: 'Profile', href: '/recruiter/profile' },
          { name: 'Jobs', href: '/recruiter/jobs' },
          { name: 'Applicants', href: '/recruiter/applicants' },
        ];
      case 'admin':
        return [
          { name: 'Users', href: '/admin/users' },
          { name: 'Resources', href: '/admin/resources' },
          { name: 'Analytics', href: '/admin/analytics' },
        ];
      default:
        return [];
    }
  };
  
  const navigationLinks = getNavigationLinks();

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 mr-2 text-primary" 
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
                <span className="font-bold text-xl">PathFinder</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                    ${
                      pathname === link.href
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="icon" className="mr-2 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <ThemeToggle />
            <div className="ml-3 relative">
              <UserDropdown userRole={userRole} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="pt-2 pb-3 space-y-1">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                ${
                  pathname === link.href
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}