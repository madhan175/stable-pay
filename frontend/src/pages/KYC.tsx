import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PhoneVerification from '../components/PhoneVerification';
import KYCUpload from '../components/KYCUpload';
import { CheckCircle, Shield, FileText, Phone } from 'lucide-react';

const KYC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'phone' | 'kyc' | 'complete'>('phone');

  const handlePhoneVerified = () => {
    setCurrentStep('kyc');
  };

  const handleKYCComplete = () => {
    setCurrentStep('complete');
    setTimeout(() => {
      navigate('/send');
    }, 3000);
  };

  // Redirect logic removed - users can access KYC page regardless of verification status

  const steps = [
    { id: 'phone', label: 'Phone Verification', icon: Phone },
    { id: 'kyc', label: 'Document Upload', icon: FileText },
    { id: 'complete', label: 'Verification Complete', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Identity Verification
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Complete your KYC verification to unlock higher transaction limits and enhanced security features.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-0 px-3 sm:px-0">
          <div className="flex items-center space-x-4 sm:space-x-8">
            {steps.map((step, index) => {
              const isActive = 
                (step.id === 'phone' && currentStep === 'phone') ||
                (step.id === 'kyc' && currentStep === 'kyc') ||
                (step.id === 'complete' && currentStep === 'complete');
              
              const isCompleted = 
                (step.id === 'phone' && (currentStep === 'kyc' || currentStep === 'complete')) ||
                (step.id === 'kyc' && currentStep === 'complete');

              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium mt-2 ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {currentStep === 'phone' && !user?.phone_verified && (
            <PhoneVerification onVerified={handlePhoneVerified} />
          )}
          
          {currentStep === 'kyc' && user?.phone_verified && user?.kyc_status !== 'verified' && (
            <KYCUpload onKYCComplete={handleKYCComplete} />
          )}
          
          {currentStep === 'complete' && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 text-center">
              <div className="bg-green-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Verification Complete!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Your identity has been successfully verified. You can now make transactions up to $10,000 per day.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-green-800">
                  Redirecting to payment page in 3 seconds...
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Guided workflow: Next step */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6">
          <Link
            to="/send"
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation text-xs sm:text-sm"
          >
            Next: Send
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KYC;