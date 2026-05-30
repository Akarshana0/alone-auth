'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-indigo-500 border-r-violet-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-cyan-500 border-l-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
