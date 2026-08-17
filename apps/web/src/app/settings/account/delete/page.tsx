'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { stopBeingWorker, deleteFullAccount } from '@/app/actions/account';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600"/></div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleStopWorker = async () => {
    if (!confirm('Are you sure you want to delete your Worker profile? You will remain a customer.')) return;
    setSubmitting(true);
    setError('');
    
    try {
      const token = await user.getIdToken();
      const res = await stopBeingWorker(token);
      if (res.success) {
        alert('Your worker profile has been removed.');
        router.push('/profile');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to stop being a worker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFullDelete = async () => {
    if (!confirm('Are you ABSOLUTELY sure? This will delete your entire account.')) return;
    setSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      const res = await deleteFullAccount(token);
      if (res.success) {
        // Firebase Auth should automatically sign out locally as the user token is revoked
        alert('Your account has been deleted.');
        router.push('/login');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            
            <div className="border border-gray-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Stop Being a Worker</h2>
              <p className="text-sm text-gray-600 mb-4">
                This will delete your Worker profile. You will no longer receive jobs. 
                Your Customer profile will remain untouched, so you can still book services.
              </p>
              <button
                onClick={handleStopWorker}
                disabled={submitting}
                className="px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
              >
                Remove Worker Profile
              </button>
            </div>

            <div className="border border-red-200 rounded-xl p-5 bg-red-50">
              <h2 className="text-lg font-bold text-red-900 mb-2">Delete Entire Account</h2>
              <p className="text-sm text-red-700 mb-4">
                This will permanently close your Instantatoz account (both Customer and Worker). 
                Your personal details will be anonymized. Past financial and job records will be 
                retained securely for legal and tax compliance.
              </p>
              <button
                onClick={handleFullDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Delete My Account'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
