import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

  // If user is already verified, redirect
  if (user?.phone_verified && user?.kyc_status === 'verified') {
    navigate('/send');
    return null;
  }

  const steps = [
    { id: 'phone', label: 'Phone Verification', icon: Phone },
    { id: 'kyc', label: 'Document Upload', icon: FileText },
    { id: 'complete', label: 'Verification Complete', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Identity Verification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your KYC verification to unlock higher transaction limits and enhanced security features.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
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
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-sm font-medium mt-2 ${
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
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your identity has been successfully verified. You can now make transactions up to $10,000 per day.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  Redirecting to payment page in 3 seconds...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYC;