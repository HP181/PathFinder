import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { ImmigrantProfile, Match } from '@/lib/Firebase/Firestore';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Check, X, Mail, CalendarCheck } from 'lucide-react';

interface MatchRequestProps {
  immigrant: ImmigrantProfile;
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
}

export function MatchRequest({
  immigrant,
  match,
  onAccept,
  onReject,
}: MatchRequestProps) {
  const getInitials = () => {
    if (!immigrant.displayName) return 'I';
    return immigrant.displayName.charAt(0).toUpperCase();
  };

  const scorePercentage = Math.round(match.compatibilityScore * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={immigrant.displayName} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{immigrant.displayName || 'No Name'}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {immigrant.email}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
            <BarChart2 className="h-4 w-4 text-primary mr-1" />
            <span className="text-sm font-medium text-primary">
              {scorePercentage}% Match
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {immigrant.skills && immigrant.skills.length > 0 ? (
              immigrant.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills listed</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Career Goals</h4>
          <p className="text-sm text-muted-foreground">
            {immigrant.careerGoals
              ? immigrant.careerGoals.length > 150
                ? `${immigrant.careerGoals.substring(0, 150)}...`
                : immigrant.careerGoals
              : 'Not provided'}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Profile Completion</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" />
            {immigrant.profileCompletionPercentage ?? 0}% Completed
          </div>
        </div>
      </CardContent>

      {onAccept && onReject && (
        <CardFooter className="flex justify-between gap-2">
          <Button className="flex-1" variant="outline" onClick={onReject}>
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button className="flex-1" onClick={onAccept}>
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
