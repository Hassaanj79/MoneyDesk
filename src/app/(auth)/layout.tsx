
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user) {
      if (pathname === '/forgot-password') {
        // don't redirect if user is on forgot password page
        return;
      }
      router.push("/");
    }
  }, [user, loading, router, pathname]);

  if (loading || (user && pathname !== '/forgot-password')) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">{children}</div>;
}
