'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, adminUser, loading } = useAuth();
  const router = useRouter();

  // Removed auto-redirect to prevent infinite loops during debug
  // useEffect(() => {
  //   if (!loading && !user) router.replace('/');
  // }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-2">Authentication Lost</h1>
        <p className="text-gray-400 text-center mb-6">Your session was lost during navigation. This could be due to browser privacy settings blocking IndexedDB.</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Return to Login</button>
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar adminUser={adminUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header adminUser={adminUser} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
