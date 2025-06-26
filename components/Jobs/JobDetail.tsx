'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/Firebase/Firestore';
import { Building, MapPin, CalendarDays, BarChart2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobDetailProps {
  job: Job;
  compatibilityScore?: number;
  onApply?: () => void;
  onBack: () => void;
  hasApplied?: boolean;
}

export function JobDetail({ 
  job, 
  compatibilityScore,
  onApply,
  onBack,
  hasApplied = false
}: JobDetailProps) {
  // Format the date
  const postedDate = new Date(job.createdAt);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });
  
  // Format compatibility score as a percentage if provided
  const scorePercentage = compatibilityScore ? Math.round(compatibilityScore * 100) : null;

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" className="mb-4 -ml-2" onClick={onBack}>
          ← Back to Jobs
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <CardDescription className="text-sm">{job.company}</CardDescription>
            </div>
          </div>
          {scorePercentage && (
            <div className="flex items-center bg-primary/10 px-3 py-2 rounded">
              <BarChart2 className="h-5 w-5 text-primary mr-2" />
              <span className="text-md font-medium text-primary">{scorePercentage}% Match</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
          <span className="mx-2">•</span>
          <CalendarDays className="h-4 w-4 mr-1" />
          <span>Posted {timeAgo}</span>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Job Description</h3>
          <p className="whitespace-pre-line">{job.description}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Requirements</h3>
          <ul className="list-disc list-inside space-y-1">
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-1">
            {job.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {hasApplied ? (
          <Button className="w-full" variant="outline" disabled>
            Applied
          </Button>
        ) : (
          <Button className="w-full" onClick={onApply}>
            Apply Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}