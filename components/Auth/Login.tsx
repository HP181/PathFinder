'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { signIn, signInWithGoogle, getUserRole } from '@/lib/Firebase/Auth';
import { auth } from '@/lib/Firebase/Config';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      const currentUser = auth.currentUser;

      if (currentUser) {
        const role = await getUserRole(currentUser);

        toast.success('Login successful');

        switch (role) {
          case 'immigrant':
            router.push('/immigrant/profile');
            break;
          case 'mentor':
            router.push('/mentor');
            break;
          case 'recruiter':
            router.push('/recruiter/jobs');
            break;
          case 'admin':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
      } else {
        toast.error('User not found after login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      const role = await getUserRole(user);
      toast.success('Welcome back to PathFinder!');

      console.log("re", role);
      switch (role) {
        case 'immigrant':
          router.push('/immigrant/profile');
          break;
        case 'mentor':
          router.push('/mentor');
          break;
        case 'recruiter':
          router.push('/recruiter/jobs');
          break;
        case 'admin':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during Google sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none bg-transparent">
      <CardHeader className="text-center mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-sm font-medium mb-4 backdrop-blur-sm border border-cyan-400/30 mx-auto">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
          Welcome Back
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
          Log in to PathFinder
        </CardTitle>
        <CardDescription className="text-gray-300 text-sm">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-200">Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-400" />
                </FormItem>
              )}
            />
            
            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="cursor-pointer text-sm text-cyan-300 hover:text-cyan-200 underline decoration-2 underline-offset-2 decoration-cyan-300/50 hover:decoration-cyan-200/50 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl border border-blue-500/50 hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white/10 text-gray-300 rounded-full backdrop-blur-sm">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="cursor-pointer w-full inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 px-4 py-3 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </CardContent>
      
      <CardFooter className="text-center mt-8 pt-6 border-t border-white/10 flex justify-center">
        <p className="text-sm text-gray-300">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cyan-300 hover:text-cyan-200 font-medium underline decoration-2 underline-offset-2 decoration-cyan-300/50 hover:decoration-cyan-200/50 transition-colors">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}