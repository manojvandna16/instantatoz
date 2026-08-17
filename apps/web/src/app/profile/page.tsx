'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { signOut } from '@/lib/auth';
import { User as UserIcon, Phone, Mail, Briefcase, LogOut, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [customerData, setCustomerData] = useState<any>(null);
  const [workerData, setWorkerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login?redirect=/profile');
      return;
    }

    async function fetchProfiles() {
      try {
        // Fetch Customer Profile
        const userDoc = await getDoc(doc(db, 'users', user!.uid));
        if (userDoc.exists()) {
          setCustomerData(userDoc.data());
        }

        // Fetch Worker Profile
        const workerDoc = await getDoc(doc(db, 'workers', user!.uid));
        if (workerDoc.exists()) {
          setWorkerData(workerDoc.data());
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkerNavigation = () => {
    if (!workerData) {
      router.push('/become-a-worker/register');
      return;
    }
    
    // If worker profile exists, navigate based on status
    const status = workerData.verificationStatus;
    if (['PENDING', 'REJECTED', 'MORE_INFO_REQUIRED', 'SUSPENDED'].includes(status)) {
      router.push('/become-a-worker/status');
    } else if (status === 'ACTIVE') {
      router.push('/become-a-worker/dashboard');
    } else {
      router.push('/become-a-worker/status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-plus-jakarta">My Profile</h1>
              <p className="text-sm font-mono text-blue-600 mt-1">
                {customerData?.userNumber || 'Loading...'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mr-4 text-gray-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</p>
                <p className="font-medium text-gray-900">{user?.phoneNumber || customerData?.phone}</p>
              </div>
            </div>

            {user?.email && (
              <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mr-4 text-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Worker Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 font-plus-jakarta">Professional / Work with Instantatoz</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">अपनी सेवाएँ देकर Instantatoz पर Worker बनें</p>
            
            <button
              onClick={handleWorkerNavigation}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors group"
            >
              <div className="text-left">
                <p className="font-semibold text-blue-700">
                  {workerData ? 'View Worker Status' : 'Learn More / Become a Worker'}
                </p>
                {workerData && (
                  <p className="text-xs text-blue-600 mt-1 font-mono">
                    ID: {workerData.workerNumber} • Status: {workerData.verificationStatus}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Settings & Legal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 font-plus-jakarta mb-4">Settings & Legal</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => router.push('/terms-and-conditions')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <span className="font-medium text-gray-700">Terms &amp; Conditions</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push('/privacy-policy')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <span className="font-medium text-gray-700">Privacy Policy</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/settings/account/delete')}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group mt-6"
              >
                <span className="font-medium text-red-700">Account Settings / Delete Account</span>
                <ChevronRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors p-2 -ml-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
