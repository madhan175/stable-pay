import React, { useState } from 'react';
import { CheckCircle, Shield, User, Users, Wallet, CreditCard, Fingerprint, ArrowRight } from 'lucide-react';
import PhoneVerification from '../components/PhoneVerification';
import KYCUpload from '../components/KYCUpload';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type StepKey = 2 | 3 | 4 | 5 | 6;

const steps: { key: StepKey; label: string; icon: React.ElementType }[] = [
  { key: 2, label: 'Phone verification', icon: Shield },
  { key: 3, label: 'Teen + Guardian KYC', icon: Users },
  { key: 4, label: 'Account setup', icon: Wallet },
  { key: 5, label: 'Link & fund', icon: CreditCard },
  { key: 6, label: 'Secure settings', icon: Fingerprint },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [current, setCurrent] = useState<StepKey>(2);

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
              <div className="text-gray-800">Create a spending account. You can add an optional numberless virtual card now and order a physical one later.</div>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="rounded-xl border-2 border-gray-200 p-4 text-left hover:border-blue-300">
                  <div className="font-semibold">Wallet only</div>
                  <div className="text-sm text-gray-600">Create crypto wallet</div>
                </button>
                <button className="rounded-xl border-2 border-gray-200 p-4 text-left hover:border-blue-300">
                  <div className="font-semibold">Wallet + virtual card</div>
                  <div className="text-sm text-gray-600">Instant numberless card</div>
                </button>
              </div>
              <div className="text-xs text-gray-500">Cards are issued via partner bank; additional KYC may apply.</div>
            </div>
          )}

          {current === 5 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800">Link funding source and set controls.</div>
              <input className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" placeholder="Add amount to load (INR)" />
              <div className="grid md:grid-cols-2 gap-4">
                <button className="rounded-xl border-2 border-gray-200 p-4 text-left hover:border-blue-300">Add via UPI</button>
                <button className="rounded-xl border-2 border-gray-200 p-4 text-left hover:border-blue-300">Add via Card</button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                <div className="font-medium text-blue-800 mb-1">Parental controls</div>
                <div className="text-blue-700">Set spending limits and merchant categories after onboarding.</div>
              </div>
            </div>
          )}

          {current === 6 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800">Enable secure settings.</div>
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                <div className="text-sm">Two-factor authentication</div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                <div className="text-sm">Biometric / PIN login</div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200">
                <div className="text-sm">Parental approvals enabled</div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button onClick={prev} disabled={current === 2} className="px-4 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50">Back</button>
            {current < 6 ? (
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


