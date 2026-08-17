import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ShieldCheck, Database, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Delete Account | Instantatoz',
  description: 'Request account deletion for your Instantatoz profile.',
};

export default function PublicDeleteAccountPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center mb-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 font-plus-jakarta mb-4">
            Account Deletion Request
          </h1>
          <p className="text-lg text-gray-600">
            Learn how we handle your data when you request to delete your account.
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-6">
          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              How to Request Deletion & Identity Verification
            </h2>
            <p>
              To ensure that no one else deletes your account, you must verify your identity. 
              Please click the button below to log in using your registered mobile number (via OTP). 
              Once logged in, you will be taken directly to the Account Settings page where you can 
              permanently delete your account.
            </p>
            <div className="mt-6">
              <Link 
                href="/login?redirect=/settings/account/delete" 
                className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Log In to Delete Account
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Customer vs. Worker Capability</h2>
            <p>Instantatoz uses a single-account architecture. If you are both a Customer and a Worker, you have two options:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Remove Worker Capability:</strong> Deletes your Worker profile so you no longer receive jobs, but keeps your Customer account active.</li>
              <li><strong>Full Account Deletion:</strong> Deletes both your Customer and Worker capabilities. You will no longer be able to log in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-500" />
              What happens to your data?
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border border-red-100 bg-red-50 p-4 rounded-xl">
                <h3 className="font-bold text-red-900 mb-2">Deleted / Anonymized</h3>
                <ul className="list-disc pl-4 text-red-800 text-sm space-y-1">
                  <li>Your Name</li>
                  <li>Your Mobile Number</li>
                  <li>Your Profile Photo</li>
                  <li>Your Email Address</li>
                  <li>Live tracking coordinates</li>
                </ul>
              </div>
              
              <div className="border border-amber-100 bg-amber-50 p-4 rounded-xl">
                <h3 className="font-bold text-amber-900 mb-2">Retained Data</h3>
                <ul className="list-disc pl-4 text-amber-800 text-sm space-y-1">
                  <li>Completed Job History</li>
                  <li>Financial & Payment Records</li>
                  <li>Ratings & Reviews</li>
                  <li>Audit & Fraud Logs</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" />
              Why do we retain some data?
            </h2>
            <p className="text-sm text-blue-800">
              For legal, tax, and security compliance in India, we cannot permanently erase financial transaction histories or completed job logs immediately. This data is retained securely (with personal identifiers stripped where possible) for fraud prevention and legal audits. Retained data is not used for marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Processing Time & Support</h2>
            <p>
              When you delete your account via the app settings, your login access is immediately revoked and your profile is anonymized. Please note that data stored in backup archives may take up to 30 days to be fully overwritten.
            </p>
            <p className="mt-4">
              If you have issues logging in to delete your account, please contact our support team at <strong>support@instantatoz.online</strong>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
