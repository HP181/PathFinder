import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MentorProfile } from '@/lib/Firebase/Firestore';
import { BarChart2 } from 'lucide-react';

interface MentorCardProps {
  mentor: MentorProfile;
  compatibilityScore: number;
  onRequestConnection: () => void;
  isPending?: boolean;
  isConnected?: boolean;
}

export function MentorCard({ 
  mentor, 
  compatibilityScore, 
  onRequestConnection,
  isPending = false,
  isConnected = false
}: MentorCardProps) {
  // Get the first letter of the mentor's display name for the avatar fallback
  const getInitials = () => {
    if (!mentor.displayName) return 'M';
    return mentor.displayName.charAt(0).toUpperCase();
  };
  
  // Format compatibility score as a percentage
  const scorePercentage = Math.round(compatibilityScore * 100);
  
  // Determine button state based on connection status
  const getButtonState = () => {
    if (isConnected) {
      return { text: 'Connected', disabled: true };
    }
    if (isPending) {
      return { text: 'Request Pending', disabled: true };
    }
    return { text: 'Request Connection', disabled: false };
  };
  
  const buttonState = getButtonState();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={mentor.displayName} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{mentor.displayName}</CardTitle>
              <CardDescription className="mt-1">
                {mentor.industries.join(', ')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
            <BarChart2 className="h-4 w-4 text-primary mr-1" />
            <span className="text-sm font-medium text-primary">{scorePercentage}% Match</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Expertise</h4>
            <div className="flex flex-wrap gap-1">
              {mentor.expertise.map((expertise, index) => (
                <Badge key={index} variant="secondary">
                  {expertise}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Background</h4>
            <p className="text-sm text-muted-foreground">
              {mentor.professionalBackground.length > 150
                ? `${mentor.professionalBackground.substring(0, 150)}...`
                : mentor.professionalBackground}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onRequestConnection} 
          disabled={buttonState.disabled}
          variant={isConnected ? "outline" : "default"}
        >
          {buttonState.text}
        </Button>
      </CardFooter>
    </Card>
  );
}