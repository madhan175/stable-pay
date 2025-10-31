import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { kycAPI } from '../services/api';
import socketService from '../services/socketService';

interface KYCUploadProps {
  onKYCComplete: () => void;
}

const KYCUpload: React.FC<KYCUploadProps> = ({ onKYCComplete }) => {
  const { user, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'verification' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [ocrData, setOcrData] = useState<any>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentStage, setCurrentStage] = useState<string>('');
  
  // Manual verification fields
  const [enteredIdNumber, setEnteredIdNumber] = useState('');
  const [enteredDob, setEnteredDob] = useState('');
  const [verificationErrors, setVerificationErrors] = useState<{idNumber?: string; dob?: string}>({});
  const [isVerifying, setIsVerifying] = useState(false);

  // Set up Socket.IO listener for real-time updates
  useEffect(() => {
    if (!user) return;

    // Join KYC room for real-time updates
    socketService.connect();
    socketService.joinKYCRoom(user.id);

    const handleKYCUpdate = (data: any) => {
      console.log('🔔 [REAL-TIME] KYC Update received:', data);
      
      if (data.stage) {
        setCurrentStage(data.stage);
      }
      
      if (data.message) {
        setProgressMessage(data.message);
      }

      if (data.status === 'verified' || data.status === 'success') {
        setIsUploading(false);
        const extractedData = data.ocrData || data.document?.ocr_data;
        if (extractedData) {
          setOcrData(extractedData);
          // Auto-fill form fields with extracted data
          if (extractedData.id_number) {
            setEnteredIdNumber(extractedData.id_number);
          }
          if (extractedData.dob) {
            setEnteredDob(extractedData.dob);
          }
        }
        // Move to verification step instead of auto-completing
        setUploadStatus('verification');
      } else if (data.status === 'rejected' || data.status === 'error') {
        setUploadStatus('error');
        setIsUploading(false);
        setError(data.message || 'KYC verification failed');
      } else if (data.status === 'processing') {
        setUploadStatus('processing');
        setIsUploading(true);
      }
    };

    socketService.onKYCUpdate(handleKYCUpdate);

    return () => {
      socketService.offKYCUpdate(handleKYCUpdate);
    };
  }, [user, onKYCComplete]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('processing');
    setError('');
    setProgressMessage('Uploading document...');
    setCurrentStage('upload');

    try {
      // Use real backend API with real-time OCR
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', user.id);
      formData.append('documentType', 'national_id');
      if (user.phone) {
        formData.append('phone', user.phone);
      }

      console.log('📤 [REAL-TIME OCR] Uploading document to backend:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Join KYC room for real-time updates
      socketService.joinKYCRoom(user.id);

      // Upload document to backend
      const response = await kycAPI.uploadDocument(formData);

      if (response.data.success) {
        // Success - data already updated via Socket.IO
        const ocrResult = response.data.ocrData || response.data.document?.ocr_data;
        if (ocrResult) {
          setOcrData(ocrResult);
          // Auto-fill form fields with extracted data
          if (ocrResult.id_number) {
            setEnteredIdNumber(ocrResult.id_number);
          }
          if (ocrResult.dob) {
            setEnteredDob(ocrResult.dob);
          }
        }

        // Validate age (must be 18+)
        if (ocrResult?.dob) {
          const birthDate = new Date(ocrResult.dob);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            throw new Error('You must be 18 or older to use this service');
          }
        }

        // Move to verification step (don't auto-complete)
        setUploadStatus('verification');
        setIsUploading(false);
        
        console.log('✅ [REAL-TIME OCR] Document processed, auto-filled fields, waiting for user verification');
      } else {
        throw new Error(response.data.message || 'KYC verification failed');
      }

    } catch (error: any) {
      console.error('KYC upload error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to process document';
      setError(errorMessage);
      setUploadStatus('error');
      setProgressMessage('');
      
      // Emit error via socket if available
      if (user) {
        socketService.emit('kyc_error', {
          userId: user.id,
          error: errorMessage
        });
      }
    } finally {
      // Don't set isUploading to false here - let Socket.IO handle status updates
    }
  }, [user, refreshUser, onKYCComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.pdf']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  // Normalize ID number for comparison (remove spaces, convert to uppercase)
  const normalizeIdNumber = (id: string) => {
    return id.replace(/\s+/g, '').toUpperCase().trim();
  };

  // Normalize date for comparison
  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateStr;
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationErrors({});

    const errors: {idNumber?: string; dob?: string} = {};

    // Normalize values for comparison
    const normalizedEnteredId = normalizeIdNumber(enteredIdNumber);
    const normalizedOcrId = ocrData?.id_number ? normalizeIdNumber(ocrData.id_number) : '';

    // Normalize DOB
    const normalizedEnteredDob = normalizeDate(enteredDob);
    const normalizedOcrDob = ocrData?.dob ? normalizeDate(ocrData.dob) : '';

    // Verify ID Number
    if (!normalizedEnteredId) {
      errors.idNumber = 'Please enter your National ID number';
    } else if (normalizedOcrId && normalizedEnteredId !== normalizedOcrId) {
      // Only check match if OCR found a value
      errors.idNumber = 'ID number does not match the document';
    }
    // If OCR didn't find it, just validate format
    else if (!normalizedOcrId && normalizedEnteredId.length < 6) {
      errors.idNumber = 'ID number must be at least 6 characters';
    }

    // Verify DOB
    if (!normalizedEnteredDob) {
      errors.dob = 'Please enter your Date of Birth';
    } else if (normalizedOcrDob && normalizedEnteredDob !== normalizedOcrDob) {
      // Only check match if OCR found a value
      errors.dob = 'Date of Birth does not match the document';
    }
    // If OCR didn't find it, validate it's a reasonable date
    else if (!normalizedOcrDob) {
      const dobDate = new Date(normalizedEnteredDob);
      const age = new Date().getFullYear() - dobDate.getFullYear();
      if (age < 18 || age > 120) {
        errors.dob = 'Please enter a valid date of birth (must be 18+ years old)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setVerificationErrors(errors);
      setIsVerifying(false);
      return;
    }

    // Verification successful - send verified data to backend
    setVerificationErrors({});
    setIsVerifying(true);

    try {
      // Send verified ID number and DOB to backend
      const verifyData: { idNumber: string; dob: string; documentId?: string | null; phone?: string | null } = {
        idNumber: normalizedEnteredId,
        dob: normalizedEnteredDob,
        documentId: ocrData?.document_id || null, // Include document ID if available
        phone: user?.phone || null // Include phone to help resolve userId if needed
      };
      const verifyResponse = await kycAPI.verifyKYCDocument(user?.id || '', verifyData);

      if (verifyResponse.data.success) {
        setUploadStatus('success');
        setIsVerifying(false);

        // Update user status
        refreshUser().then(() => {
          // Auto-complete after showing success
          setTimeout(() => {
            onKYCComplete();
          }, 2000);
        });
      } else {
        throw new Error(verifyResponse.data.error || 'Failed to verify KYC');
      }
    } catch (error: any) {
      console.error('KYC verify error:', error);
      setVerificationErrors({
        idNumber: error.response?.data?.error || error.message || 'Failed to verify. Please try again.'
      });
      setIsVerifying(false);
    }
  };

  if (uploadStatus === 'verification') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Information</h2>
          <p className="text-gray-600 text-sm">
            Please enter the following information as it appears on your document to complete verification.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              National ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={enteredIdNumber}
              onChange={(e) => {
                setEnteredIdNumber(e.target.value);
                if (verificationErrors.idNumber) {
                  setVerificationErrors({ ...verificationErrors, idNumber: undefined });
                }
              }}
              placeholder="Enter your ID number"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                verificationErrors.idNumber 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {verificationErrors.idNumber && (
              <p className="mt-1 text-sm text-red-600">{verificationErrors.idNumber}</p>
            )}
            {ocrData?.id_number ? (
              <p className="mt-1 text-xs text-gray-500">
                Document shows: {ocrData.id_number.substring(0, 4)}****{ocrData.id_number.substring(ocrData.id_number.length - 2)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ Verify Your Aadhar number
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={enteredDob}
              onChange={(e) => {
                setEnteredDob(e.target.value);
                if (verificationErrors.dob) {
                  setVerificationErrors({ ...verificationErrors, dob: undefined });
                }
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                verificationErrors.dob 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {verificationErrors.dob && (
              <p className="mt-1 text-sm text-red-600">{verificationErrors.dob}</p>
            )}
            {ocrData?.dob ? (
              <p className="mt-1 text-xs text-gray-500">
                Document shows: {new Date(ocrData.dob).toLocaleDateString()}
              </p>
            ) : (
              <p className="mt-1 text-xs text-amber-600">
                ⚠️ Date of birth not found in document. Please enter it manually.
              </p>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying || !enteredIdNumber || !enteredDob}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>

        {ocrData && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Document Information:</h3>
            <p className="text-xs text-gray-600"><strong>Name:</strong> {ocrData.name || 'Not found'}</p>
            <p className="text-xs text-gray-600"><strong>Document Type:</strong> {ocrData.document_type || 'Not detected'}</p>
            <p className="text-xs text-gray-600"><strong>Country:</strong> {ocrData.country || 'Not detected'}</p>
          </div>
        )}
      </div>
    );
  }

  if (uploadStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">KYC Verified!</h2>
          <p className="text-gray-600 mb-6">Your identity has been successfully verified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload ID Document</h2>
        <p className="text-gray-600">
          Upload your Aadhaar Card, PAN Card, or Passport for verification
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : uploadStatus === 'processing'
            ? 'border-yellow-400 bg-yellow-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploadStatus === 'processing' ? (
          <div className="space-y-4">
            <Loader className="w-12 h-12 text-yellow-600 mx-auto animate-spin" />
            <div>
              <p className="text-yellow-800 font-semibold">
                {progressMessage || 'Processing Document...'}
              </p>
              <div className="mt-2 space-y-1">
                {currentStage && (
                  <div className="flex items-center justify-center space-x-2 text-xs text-yellow-600">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="capitalize">{currentStage.replace('_', ' ')}</span>
                  </div>
                )}
                <div className="w-64 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-red-800 font-semibold">Upload Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setError('');
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-700 font-semibold">
                {isDragActive ? 'Drop your document here' : 'Drag & drop your ID document'}
              </p>
              <p className="text-gray-500 text-sm">or click to browse files</p>
              <p className="text-gray-400 text-xs mt-2">Supports: JPG, PNG, PDF (max 10MB)</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Accepted Documents:</p>
            <ul className="space-y-1 text-xs">
              <li>• Aadhaar Card (front & back)</li>
              <li>• PAN Card</li>
              <li>• Passport (photo page)</li>
              <li>• Voter ID Card</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCUpload;