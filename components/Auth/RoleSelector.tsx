import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from '@/lib/Firebase/Auth';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole | null) => void;
}



export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Immigrant</CardTitle>
          <CardDescription>Looking for career opportunities and mentorship in Canada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onSelectRole('immigrant')}>
            Sign Up as Immigrant
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Mentor</CardTitle>
          <CardDescription>Share your professional expertise and help immigrants succeed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
              <path d="M15 12v3"></path>
              <path d="M12 12v3"></path>
              <path d="M18 12v3"></path>
            </svg>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onSelectRole('mentor')}>
            Sign Up as Mentor
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Recruiter</CardTitle>
          <CardDescription>Find qualified candidates for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onSelectRole('recruiter')}>
            Sign Up as Recruiter
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}