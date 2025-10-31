import React, { useState } from 'react';
import { CheckCircle, Shield, User, Wallet, Fingerprint, ArrowRight, Camera } from 'lucide-react';
import PhoneVerification from '../components/PhoneVerification';
import KYCUpload from '../components/KYCUpload';
import FaceVerification from '../components/FaceVerification';
import BiometricAuth from '../components/BiometricAuth';
import WalletQRCode from '../components/WalletQRCode';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

type StepKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const steps: { key: StepKey; label: string; icon: React.ElementType }[] = [
  { key: 1, label: 'Intro', icon: User },
  { key: 2, label: 'Phone verification', icon: Shield },
  { key: 3, label: 'KYC Verification (18+)', icon: Shield },
  { key: 4, label: 'Face verification', icon: Camera },
  { key: 5, label: 'Biometric / PIN', icon: Fingerprint },
  { key: 6, label: 'Wallet QR Code', icon: QrCodeIcon },
  { key: 7, label: 'Summary', icon: Wallet },
];

function QrCodeIcon(props: any) {
  return <svg {...props} viewBox="0 0 24 24" className={props.className}><path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm6 0h2v2h-2V5zm0 4h2v2h-2V9zM3 13h2v2H3v-2zm4 0h4v4H7v-4zm-4 6h8v2H3v-2zm10-6h2v2h-2v-2zm0 4h2v4h-2v-4zm4-4h4v2h-4v-2zm0 4h2v2h-2v-2zm2 2h2v2h-2v-2z"/></svg>;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  const [current, setCurrent] = useState<StepKey>(1);

  // Redirect logic removed - users can access onboarding page regardless of verification status


  const next = () => setCurrent((p) => (p < 7 ? ((p + 1) as StepKey) : p));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 sm:mt-4">Getting started</h1>
          <p className="text-sm sm:text-base text-gray-600">Complete onboarding in a few quick steps</p>
        </div>

        <div className="flex justify-center mb-6 sm:mb-10 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-0 px-3 sm:px-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.key === current;
              const isCompleted = s.key < current;
              return (
                <div key={s.key} className="flex items-center flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </div>
                  {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-3 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
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
            <div className="max-w-md mx-auto">
              <div className="mb-4 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="text-sm font-semibold text-blue-900 mb-1">Age Requirement</div>
                  <div className="text-xs text-blue-700">This platform is only available for users 18 years and older. Your date of birth will be verified from your ID document.</div>
                </div>
              </div>
              <KYCUpload onKYCComplete={handleKYCComplete} />
            </div>
          )}

          {current === 4 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800 font-semibold text-lg">Real-time face verification</div>
              <FaceVerification onComplete={next} />
            </div>
          )}

          {current === 5 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800 font-semibold text-lg mb-2">Enable Biometric Security</div>
              <BiometricAuth 
                onAuthenticated={() => {
                  console.log('Biometric authentication completed');
                  // Auto-advance after successful setup
                  setTimeout(() => next(), 1000);
                }}
                onError={(error) => {
                  console.error('Biometric error:', error);
                }}
              />
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 mt-4">
                <div className="text-sm">Backup PIN</div>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
            </div>
          )}

          {current === 6 && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="text-gray-800 font-semibold text-lg mb-4">Your Wallet QR Code</div>
              {isConnected && account ? (
                <div>
                  <WalletQRCode 
                    walletAddress={account} 
                    size={256}
                    showDownload={true}
                  />
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800 text-center">
                      📱 Share this QR code to receive USDT payments. You can also use it to make transactions!
                    </p>
                  </div>
                  <button
                    onClick={next}
                    className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continue to Summary
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                  <Wallet className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Wallet Not Connected</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    Please connect your MetaMask wallet to generate your QR code for transactions.
                  </p>
                  <p className="text-xs text-yellow-700">
                    You can also skip this step and connect later from the Receive page.
                  </p>
                  <button
                    onClick={next}
                    className="mt-4 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Skip for Now
                  </button>
                </div>
              )}
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


