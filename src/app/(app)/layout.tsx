
'use client';

import AppLayout from '@/components/app-layout';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/services/users';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    // For the welcome page, we don't need to check for onboarding status.
    if (pathname === '/welcome') {
      setProfileLoading(false);
      return;
    }

    getUserProfile(user.uid).then(profile => {
      if (!profile?.onboardingCompleted) {
        router.push('/welcome');
      } else {
        setProfileLoading(false);
      }
    }).catch(() => {
      // If there's an error, still allow access to avoid blocking user.
      setProfileLoading(false);
    });

  }, [user, loading, router, pathname]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render welcome page without the main app layout
  if (pathname === '/welcome') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        {children}
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
