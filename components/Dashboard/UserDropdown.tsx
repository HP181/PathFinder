'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/lib/Firebase/Auth';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { UserRole } from '@/lib/Firebase/Auth';
import { toast } from 'sonner';

interface UserDropdownProps {
  userRole: UserRole;
}

export function UserDropdown({ userRole }: UserDropdownProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign out.');
    }
  };
  
  const getProfileLink = () => {
    switch (userRole) {
      case 'immigrant':
        return '/immigrant/profile';
      case 'mentor':
        return '/mentor/profile';
      case 'recruiter':
        return '/recruiter/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/';
    }
  };
  
  // Get the first letter of the user's display name for the avatar fallback
  const getInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center focus:outline-none">
          <Avatar>
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.displayName || 'User'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {userRole}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getProfileLink()}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/messaging">Messages</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
