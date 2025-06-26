'use client';

import { MentorAvailabilityForm } from '@/components/Dashboard/Profile/MentorAvaibilityForm';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MentorAvailabilityPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Manage Your Availability
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Set your mentoring schedule to connect with immigrants seeking guidance. Your time makes a real difference in helping newcomers navigate their career journey in Canada.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-3">
              <Calendar className="h-6 w-6 text-blue-700 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-center">24</h3>
            <p className="text-sm text-muted-foreground text-center">
              Upcoming Sessions
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mb-3">
              <Clock className="h-6 w-6 text-purple-700 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-center">12.5</h3>
            <p className="text-sm text-muted-foreground text-center">
              Hours Committed
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mb-3">
              <Users className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-center">16</h3>
            <p className="text-sm text-muted-foreground text-center">
              Immigrants Helped
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="availability" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
          <TabsTrigger value="availability">Set Availability</TabsTrigger>
          <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="w-full">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Schedule Your Availability
              </CardTitle>
              <CardDescription>
                Set your weekly schedule and time slots when you're available to mentor immigrants. You'll be matched with immigrants based on your expertise and availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MentorAvailabilityForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                Upcoming Mentoring Sessions
              </CardTitle>
              <CardDescription>
                View and manage your upcoming mentoring sessions with immigrants. You can reschedule or cancel sessions if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <div className="text-center p-10 border border-dashed rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  You don't have any upcoming mentoring sessions scheduled. Set your availability to get matched with immigrants seeking mentorship.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="mt-8 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/60">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-400">Tips for Effective Mentoring</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="bg-amber-200 dark:bg-amber-800 rounded-full h-5 w-5 flex items-center justify-center text-amber-800 dark:text-amber-200 mr-2 mt-0.5 flex-shrink-0">1</span>
              <span>Schedule 30-60 minute sessions for focused mentoring without causing meeting fatigue</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-200 dark:bg-amber-800 rounded-full h-5 w-5 flex items-center justify-center text-amber-800 dark:text-amber-200 mr-2 mt-0.5 flex-shrink-0">2</span>
              <span>Space out your availability to ensure you have adequate time to prepare for each session</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-200 dark:bg-amber-800 rounded-full h-5 w-5 flex items-center justify-center text-amber-800 dark:text-amber-200 mr-2 mt-0.5 flex-shrink-0">3</span>
              <span>Consider time zone differences when setting your availability for international mentees</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}