import React, { useState } from 'react';
import { Phone, Shield, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PhoneVerificationProps {
  onVerified: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerified }) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.match(/^\+91[6-9]\d{9}$/)) {
      setError('Please enter a valid Indian phone number (+91XXXXXXXXXX)');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await sendOTP(phone);
    
    if (result.success && result.otp) {
      setGeneratedOTP(result.otp);
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await verifyOTP(phone, otp);
    
    if (result.success) {
      onVerified();
    } else {
      setError(result.error || 'Failed to verify OTP');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'phone' ? 'Verify Phone Number' : 'Enter OTP'}
        </h2>
        <p className="text-gray-600">
          {step === 'phone' 
            ? 'We need to verify your phone number for security'
            : `We've sent a 6-digit code to ${phone}`
          }
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors duration-200"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Send OTP</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors duration-200 text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              required
            />
          </div>

          {/* Demo OTP Display */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-sm text-yellow-800">
              <strong>Demo OTP:</strong> {generatedOTP}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;