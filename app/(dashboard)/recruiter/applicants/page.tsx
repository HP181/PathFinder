'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

// Sample applicant data
const applicants = [
  {
    id: '1',
    name: 'Alex Rivera',
    jobTitle: 'Frontend Developer',
    company: 'TechNova Inc.',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'new',
    skills: ['React', 'TypeScript', 'CSS', 'HTML'],
    matchScore: 89,
  },
  {
    id: '2',
    name: 'Mei Lin',
    jobTitle: 'Frontend Developer',
    company: 'TechNova Inc.',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'reviewing',
    skills: ['React', 'JavaScript', 'Redux', 'CSS'],
    matchScore: 76,
  },
  {
    id: '3',
    name: 'Jordan Smith',
    jobTitle: 'Data Analyst',
    company: 'FinSecure Solutions',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'interviewed',
    skills: ['SQL', 'Python', 'Data Analysis', 'Excel'],
    matchScore: 82,
  },
  {
    id: '4',
    name: 'Fatima Khan',
    jobTitle: 'DevOps Engineer',
    company: 'CloudScale Technologies',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'rejected',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    matchScore: 65,
  },
];

export default function ApplicantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Applicants</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage candidates who have applied to your job postings
        </p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Applicants</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
          <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {applicants.map(applicant => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {applicants
              .filter(a => a.status === 'new')
              .map(applicant => (
                <ApplicantCard key={applicant.id} applicant={applicant} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reviewing" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {applicants
              .filter(a => a.status === 'reviewing')
              .map(applicant => (
                <ApplicantCard key={applicant.id} applicant={applicant} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="interviewed" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {applicants
              .filter(a => a.status === 'interviewed')
              .map(applicant => (
                <ApplicantCard key={applicant.id} applicant={applicant} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {applicants
              .filter(a => a.status === 'rejected')
              .map(applicant => (
                <ApplicantCard key={applicant.id} applicant={applicant} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Applicant Card Component
function ApplicantCard({ applicant }: { applicant: any }) {
  // Format the date
  const timeAgo = formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true });
  
  // Get the status badge
  const getStatusBadge = () => {
    switch (applicant.status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'reviewing':
        return <Badge className="bg-yellow-500">Reviewing</Badge>;
      case 'interviewed':
        return <Badge className="bg-green-500">Interviewed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium">{applicant.name}</h3>
              <p className="text-sm text-muted-foreground">
                Applied for {applicant.jobTitle} at {applicant.company} • {timeAgo}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {applicant.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Badge variant="outline" className="bg-primary/10 text-primary border-none">
                {applicant.matchScore}% Match
              </Badge>
            </div>
            
            <Button>View Application</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}