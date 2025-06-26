import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/Firebase/Firestore';
import { BarChart2, Building, MapPin, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  compatibilityScore?: number;
  onApply?: () => void;
  onViewDetails?: () => void;
  hasApplied?: boolean;
  isRecruiterView?: boolean;
  applicantCount?: number;
}

export function JobCard({ 
  job, 
  compatibilityScore,
  onApply,
  onViewDetails,
  hasApplied = false,
  isRecruiterView = false,
  applicantCount = 0
}: JobCardProps) {
  // Format the date
  const postedDate = new Date(job.createdAt);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });
  
  // Format compatibility score as a percentage if provided
  const scorePercentage = compatibilityScore ? Math.round(compatibilityScore * 100) : null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <CardDescription className="text-sm">{job.company}</CardDescription>
            </div>
          </div>
          {scorePercentage && (
            <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
              <BarChart2 className="h-4 w-4 text-primary mr-1" />
              <span className="text-sm font-medium text-primary">{scorePercentage}% Match</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
          <span className="mx-2">•</span>
          <CalendarDays className="h-4 w-4 mr-1" />
          <span>Posted {timeAgo}</span>
        </div>
        
        <p className="text-sm">
          {job.description.length > 150
            ? `${job.description.substring(0, 150)}...`
            : job.description}
        </p>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-1">
            {job.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className={isRecruiterView ? "justify-between" : ""}>
        {isRecruiterView ? (
          <>
            <div className="text-sm">
              <span className="font-medium">{applicantCount}</span> applicant{applicantCount !== 1 ? 's' : ''}
            </div>
            <Button variant="outline" onClick={onViewDetails}>
              View Details
            </Button>
          </>
        ) : (
          <>
            {hasApplied ? (
              <Button className="w-full" variant="outline" disabled>
                Applied
              </Button>
            ) : (
              <Button className="w-full" onClick={onApply}>
                Apply Now
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}