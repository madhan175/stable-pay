import React, { useState, useEffect } from 'react';
import { X, Phone, Shield, CheckCircle, Loader } from 'lucide-react';
import { useKYC } from '../context/KYCContext';

interface PhoneOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const PhoneOTPModal: React.FC<PhoneOTPModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { sendOTP, verifyOTP, isLoading, error, clearError } = useKYC();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phone.trim()) return;

    clearError();
    const result = await sendOTP(phone);
    
    if (result.success) {
      setOtpSent(true);
      setStep('otp');
      setCountdown(60); // 60 seconds countdown
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return;

    clearError();
    const result = await verifyOTP(phone, otp);
    
    if (result.success && result.user) {
      setUser(result.user);
      setStep('success');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result.user);
          onClose();
        }, 2000);
      }
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    clearError();
    const result = await sendOTP(phone);
    
    if (result.success) {
      setCountdown(60);
    }
  };

  const resetModal = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
    setUser(null);
    clearError();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Phone Verification</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' && (
            <div className="space-y-6">
              <div className="text-center">
                <Phone className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verify Your Phone Number
                </h3>
                <p className="text-gray-600">
                  We'll send you a verification code via SMS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={!phone.trim() || isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter Verification Code
                </h3>
                <p className="text-gray-600">
                  We sent a 6-digit code to <span className="font-semibold">{phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify Code</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in {countdown}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'success' && user && (
            <div className="text-center space-y-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phone Verified!
                </h3>
                <p className="text-gray-600">
                  Your phone number has been successfully verified.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Phone:</span> {user.phone}
                </p>
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Status:</span> Verified
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneOTPModal;
