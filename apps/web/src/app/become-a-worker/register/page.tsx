'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Briefcase, User, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LocationUtils } from '@/lib/locations';

export default function WorkerRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Location States
  const scope = LocationUtils.getScope();
  const tehsils = LocationUtils.getTehsils();
  const [selectedTehsil, setSelectedTehsil] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [villages, setVillages] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (selectedTehsil) {
      setVillages(LocationUtils.getVillagesForTehsil(selectedTehsil));
      setSelectedVillage('');
    } else {
      setVillages([]);
    }
  }, [selectedTehsil]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login?redirect=/become-a-worker/register');
        return;
      }
      setUser(currentUser);
      
      // Check if already registered
      try {
        const workerDoc = await getDoc(doc(db, 'workers', currentUser.uid));
        if (workerDoc.exists()) {
          router.push('/become-a-worker/status');
        }
      } catch (err) {
        console.error("Error checking worker status:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const email = formData.get('email') as string;
      const skillsStr = formData.get('skills') as string;
      const experience = formData.get('experience') as string;
      const photoFile = formData.get('profilePhoto') as File;
      
      if (!selectedTehsil || !selectedVillage) {
        throw new Error('Please select both Tehsil and Village');
      }

      if (!photoFile || photoFile.size === 0) {
        throw new Error('Profile photo is required');
      }

      // 1. Upload photo to Vercel Blob
      const token = await user.getIdToken();
      const uploadFormData = new FormData();
      uploadFormData.append('file', photoFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error || 'Failed to upload photo');
      }

      const { url: photoUrl } = await uploadRes.json();
      
      // 2. Prepare location data
      const { tehsilName, villageName } = LocationUtils.getNames(selectedTehsil, selectedVillage);
      const locationData = {
        country: 'India',
        state: scope.stateName,
        stateId: scope.stateId,
        district: scope.districtName,
        districtId: scope.districtId,
        tehsil: tehsilName || '',
        tehsilId: selectedTehsil,
        village: villageName || '',
        villageId: selectedVillage
      };

      // 3. Create Worker Profile via Server Action Transaction
      const { registerWorkerAction } = await import('@/app/become-a-worker/actions');
      const result = await registerWorkerAction(token, {
        fullName,
        phone,
        email,
        profilePhotoUrl: photoUrl,
        skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        location: locationData,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Redirect to status page
      router.push('/become-a-worker/status');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during registration.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Worker Registration</h1>
          <p className="mt-1 text-sm text-gray-600">Join Instantatoz and start getting jobs in your area.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Personal Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Personal Details
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input required type="text" name="fullName" defaultValue={user?.displayName || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input required type="tel" name="phone" defaultValue={user?.phoneNumber || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-gray-50" readOnly />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email / Gmail (Optional)</label>
              <input type="email" name="email" defaultValue={user?.email || ''} placeholder="e.g. yourname@gmail.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Location Details (Restricted to Uttarkashi) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              Work Location (Currently launching only in {scope.districtName}, {scope.stateName})
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input disabled type="text" value={scope.stateName} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District</label>
                <input disabled type="text" value={scope.districtName} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm p-2 border" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tehsil</label>
                <select required value={selectedTehsil} onChange={e => setSelectedTehsil(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border">
                  <option value="">Select Tehsil</option>
                  {tehsils.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Village / Locality</label>
                <select required disabled={!selectedTehsil} value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border disabled:bg-gray-50">
                  <option value="">Select Village</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Work Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" />
              Skills & Experience
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills (Comma separated)</label>
              <input required type="text" name="skills" placeholder="e.g. Plumber, Electrician, Carpenter" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <select required name="experience" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border">
                <option value="">Select Experience</option>
                <option value="0-1">0-1 Years</option>
                <option value="1-3">1-3 Years</option>
                <option value="3-5">3-5 Years</option>
                <option value="5+">5+ Years</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Photo Upload */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-gray-400" />
              Profile Photo
            </h2>
            <div className="text-sm text-gray-500 mb-2">This photo will be visible to customers. Please upload a clear face photo.</div>
            
            <div>
              <input required type="file" name="profilePhoto" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border p-2 rounded-md" />
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start gap-3 mt-8">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Offline Verification Required</p>
              <p>Your profile will be in PENDING status after submission. An Instantatoz Admin will contact you to manually verify your original documents (Aadhaar, PAN, etc.) before you can start receiving jobs.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                required
                className="mt-1 shrink-0 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="text-sm text-gray-600">
                I agree to the <a href="/worker-terms" target="_blank" className="text-blue-600 hover:underline">Instantatoz Worker Terms &amp; Conditions</a>. I understand that my location will be used to match me with nearby jobs when I am Online.
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
