'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function WorkerStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workerData, setWorkerData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      try {
        const workerDoc = await getDoc(doc(db, 'workers', currentUser.uid));
        if (workerDoc.exists()) {
          setWorkerData(workerDoc.data());
        } else {
          // If no worker profile exists, redirect to register
          router.push('/become-a-worker/register');
        }
      } catch (err) {
        console.error("Error fetching worker status:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const status = workerData?.verificationStatus || 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-center p-8">
        
        {status === 'PENDING' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h1>
            <p className="text-gray-600 mb-6">
              Your application has been received successfully. An admin will contact you shortly to verify your original documents.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg w-full text-left text-sm text-gray-700 mb-6">
              <p className="font-semibold mb-2">What happens next?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep your Aadhaar and PAN card ready.</li>
                <li>Wait for our executive to call or visit.</li>
                <li>Once verified, your account will be activated.</li>
              </ul>
            </div>
          </div>
        )}

        {status === 'ACTIVE' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Active</h1>
            <p className="text-gray-600 mb-6">
              Your profile is verified and active! You can now start receiving job requests in your area.
            </p>
            {/* Can link to worker app/dashboard here */}
            <button className="w-full py-2 px-4 bg-primary text-white rounded-md font-medium">
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'REJECTED' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h1>
            <p className="text-gray-600 mb-6">
              Unfortunately, your application could not be approved at this time. Please contact support for more information.
            </p>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </button>

      </div>
    </div>
  );
}
