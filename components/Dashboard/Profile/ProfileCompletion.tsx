import React from 'react';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileCompletionProps {
  percentage: number;
  stepsCompleted?: string[];
  stepsRemaining?: string[];
}

export function ProfileCompletion({
  percentage,
  stepsCompleted = [],
  stepsRemaining = []
}: ProfileCompletionProps) {

  console.log("im", stepsRemaining);
  console.log("done", stepsCompleted);
  console.log("percentage", percentage);
  return (
    <Card aria-label="Profile completion status">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Completion
          <span className="text-lg font-bold" aria-live="polite">{percentage}%</span>
        </CardTitle>
        <CardDescription>
          Complete your profile to maximize your opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress
          value={percentage}
          className="h-2 mb-4"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />

        {stepsCompleted.length > 0 && (
          <section aria-label="Completed steps" className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-400">
              Completed
            </h4>
            <ul className="space-y-1">
              {stepsCompleted.map((step, index) => (
                <li
                  key={`${step}-${index}`}
                  className="flex items-center text-sm text-green-700 dark:text-green-300"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                  {step}
                </li>
              ))}
            </ul>
          </section>
        )}

        {stepsRemaining.length > 0 && (
          <section aria-label="Remaining steps">
            <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
              Remaining
            </h4>
            <ul className="space-y-1">
              {stepsRemaining.map((step, index) => (
                <li
                  key={`${step}-${index}`}
                  className="flex items-center text-sm text-amber-700 dark:text-amber-300"
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                  {step}
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
