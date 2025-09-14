
'use client';

import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  if (user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <Logo className="h-8 w-8" />
            <span className="text-2xl font-bold">MoneyDesk</span>
        </div>
        {children}
    </div>
  );
}
