
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function RootPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push('/'); // The (app) layout will render dashboard
            } else {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    // You can show a loading spinner here while checking auth state
    return null;
}
