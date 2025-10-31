import React, { useState } from 'react';
import { CheckCircle, Shield, User, Users, Wallet, CreditCard, Fingerprint, ArrowRight, Camera } from 'lucide-react';
import PhoneVerification from '../components/PhoneVerification';
import KYCUpload from '../components/KYCUpload';
import Intro from './Intro';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type StepKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const steps: { key: StepKey; label: string; icon: React.ElementType }[] = [
  { key: 1, label: 'Intro', icon: User },
  { key: 2, label: 'Phone verification', icon: Shield },
  { key: 3, label: 'Teen + Guardian KYC', icon: Users },
  { key: 4, label: 'Face verification', icon: Camera },
  { key: 5, label: 'Biometric / PIN', icon: Fingerprint },
  { key: 6, label: 'Scanner setup', icon: QrCodeIcon },
  { key: 7, label: 'Summary', icon: Wallet },
];

function QrCodeIcon(props: any) {
  return <svg {...props} viewBox="0 0 24 24" className={props.className}><path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm6 0h2v2h-2V5zm0 4h2v2h-2V9zM3 13h2v2H3v-2zm4 0h4v4H7v-4zm-4 6h8v2H3v-2zm10-6h2v2h-2v-2zm0 4h2v4h-2v-4zm4-4h4v2h-4v-2zm0 4h2v2h-2v-2zm2 2h2v2h-2v-2z"/></svg>;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [current, setCurrent] = useState<StepKey>(1);

  // Minimal local state for guardians/teen form
  const [teen, setTeen] = useState({ fullName: '', dob: '', school: '' });
  const [guardian, setGuardian] = useState({ fullName: '', relation: '', phone: '' });

  const next = () => setCurrent((p) => (p < 6 ? ((p + 1) as StepKey) : p));
  const prev = () => setCurrent((p) => (p > 2 ? ((p - 1) as StepKey) : p));

  const handlePhoneVerified = () => {
    next();
  };

  const handleKYCComplete = () => {
    next();
  };

  const finish = () => {
    navigate('/send');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Getting started</h1>
          <p className="text-gray-600">Complete onboarding in a few quick steps</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.key === current;
              const isCompleted = s.key < current;
              return (
                <div key={s.key} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  {i < steps.length - 1 && <div className={`w-16 h-0.5 mx-3 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {current === 1 && (
            <div className="max-w-lg mx-auto text-center space-y-4">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 rounded-2xl h-48 flex items-center justify-center text-white">
                <div className="text-xl font-semibold">Welcome to StablePay</div>
              </div>
              <div className="text-gray-600">We’ll set up your account in a few quick steps.</div>
              <button onClick={next} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Start</button>
            </div>
          )}

          {current === 2 && (
            <div className="max-w-md mx-auto">
              <PhoneVerification onVerified={handlePhoneVerified} />
            </div>
          )}

          {current === 3 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="font-semibold text-gray-900">Teen details</div>
                <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="Full name" value={teen.fullName} onChange={(e) => setTeen({ ...teen, fullName: e.target.value })} />
                <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="Date of birth (YYYY-MM-DD)" value={teen.dob} onChange={(e) => setTeen({ ...teen, dob: e.target.value })} />
                <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="School (optional)" value={teen.school} onChange={(e) => setTeen({ ...teen, school: e.target.value })} />
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">Teen ID document</div>
                  <KYCUpload onKYCComplete={() => {}} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="font-semibold text-gray-900">Parent / Guardian</div>
                <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="Full name" value={guardian.fullName} onChange={(e) => setGuardian({ ...guardian, fullName: e.target.value })} />
                <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="Relationship (e.g., Mother)" value={guardian.relation} onChange={(e) => setGuardian({ ...guardian, relation: e.target.value })} />
                <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="Guardian phone (+91...)" value={guardian.phone} onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })} />
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">Guardian ID document</div>
                  <KYCUpload onKYCComplete={handleKYCComplete} />
                </div>
              </div>
            </div>
          )}

          {current === 4 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800">Real-time face verification</div>
              <div className="rounded-2xl border-2 border-dashed border-gray-300 h-56 flex items-center justify-center text-gray-500">
                Camera preview placeholder
              </div>
              <div className="text-xs text-gray-500">We will perform liveness checks. For demo, press Next.</div>
            </div>
          )}

          {current === 5 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800">Enable device security</div>
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                <div className="text-sm">Biometric / Face ID</div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                <div className="text-sm">Backup PIN</div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
            </div>
          )}

          {current === 6 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800">Scanner setup</div>
              <div className="rounded-2xl border-2 border-dashed border-gray-300 h-56 flex items-center justify-center text-gray-500">
                Individual QR/Barcode scanner placeholder
              </div>
              <div className="text-xs text-gray-500">Grant camera permissions when prompted. For demo, press Next.</div>
            </div>
          )}

          {current === 7 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800">All set!</div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                <div className="font-medium text-green-800 mb-1">You’ve completed onboarding.</div>
                <div className="text-green-700">You can now proceed to payments and dashboard.</div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button onClick={prev} disabled={current === 1} className="px-4 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50">Back</button>
            {current < 7 ? (
              <button onClick={next} className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center space-x-2">
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} className="px-4 py-2 rounded-lg bg-green-600 text-white">Finish</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;


