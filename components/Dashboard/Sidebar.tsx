import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/Firebase/Auth';
import { 
  User, 
  Briefcase, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  BookOpen, 
  FileText, 
  Brain 
} from 'lucide-react';

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  
  // Define sidebar navigation links based on user role
  const getSidebarLinks = () => {
    switch (userRole) {
      case 'immigrant':
        return [
          { name: 'Profile', href: '/immigrant/profile', icon: <User className="h-5 w-5" /> },
          { name: 'Find Mentors', href: '/immigrant/mentors', icon: <Users className="h-5 w-5" /> },
          { name: 'Browse Jobs', href: '/immigrant/jobs', icon: <Briefcase className="h-5 w-5" /> },
          { name: 'AI Career Coach', href: '/immigrant/coach', icon: <Brain className="h-5 w-5" /> },
          { name: 'Messages', href: '/messaging', icon: <MessageSquare className="h-5 w-5" /> },
        ];
      case 'mentor':
        return [
          { name: 'Profile', href: '/mentor/profile', icon: <User className="h-5 w-5" /> },
          { name: 'My Mentees', href: '/mentor/mentees', icon: <Users className="h-5 w-5" /> },
          { name: 'Availability', href: '/mentor/availability', icon: <Calendar className="h-5 w-5" /> },
          { name: 'Messages', href: '/messaging', icon: <MessageSquare className="h-5 w-5" /> },
        ];
      case 'recruiter':
        return [
          { name: 'Profile', href: '/recruiter/profile', icon: <User className="h-5 w-5" /> },
          { name: 'Manage Jobs', href: '/recruiter/jobs', icon: <Briefcase className="h-5 w-5" /> },
          { name: 'View Applicants', href: '/recruiter/applicants', icon: <FileText className="h-5 w-5" /> },
          { name: 'Messages', href: '/messaging', icon: <MessageSquare className="h-5 w-5" /> },
        ];
      case 'admin':
        return [
          { name: 'Manage Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
          { name: 'Resources', href: '/admin/resources', icon: <BookOpen className="h-5 w-5" /> },
          { name: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
          { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
        ];
      default:
        return [];
    }
  };
  
  const sidebarLinks = getSidebarLinks();

  return (
    <div className="hidden md:flex flex-col h-full w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2 text-primary" 
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
          <span className="font-bold text-lg">PathFinder</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? 'default' : 'ghost'}
              className={cn(
                'justify-start h-10',
                pathname === link.href && 'bg-primary text-primary-foreground'
              )}
              asChild
            >
              <Link href={link.href}>
                {link.icon}
                <span className="ml-2">{link.name}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}