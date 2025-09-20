import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface KYCUploadProps {
  onKYCComplete: () => void;
}

const KYCUpload: React.FC<KYCUploadProps> = ({ onKYCComplete }) => {
  const { user, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [ocrData, setOcrData] = useState<any>(null);

  const processOCR = async (file: File) => {
    // Mock OCR processing for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate OCR extraction
    const mockOCRData = {
      name: ' Dineshlingam',
      dob: '2005-10-06',
      id_number: 'ABCD1234E',
      country: 'India',
      document_type: 'Aadhaar Card'
    };
    
    return mockOCRData;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('processing');
    setError('');

    try {
      // Check if we're in mock mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isMockMode) {
        console.log('🎯 Mock mode: Simulating KYC document upload');
        
        // Mock file upload - simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Process OCR
        const ocrResult = await processOCR(file);
        setOcrData(ocrResult);

        // Validate age (must be 18+)
        const birthDate = new Date(ocrResult.dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const isValidAge = age >= 18;

        if (!isValidAge) {
          throw new Error('You must be 18 or older to use this service');
        }

        // Mock KYC document
        const kycDocument = {
          type: 'national_id',
          file_url: `mock://kyc-documents/${user.id}/${Date.now()}.${file.name.split('.').pop()}`,
          ocr_data: ocrResult,
          status: 'verified',
          submitted_at: new Date().toISOString()
        };

        // Update user in localStorage (mock mode)
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const updatedUsers = mockUsers.map((u: any) => 
          u.id === user.id 
            ? { 
                ...u, 
                kyc_status: 'verified', 
                kyc_documents: [kycDocument],
                updated_at: new Date().toISOString()
              }
            : u
        );
        localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
        
        // Update current user in localStorage
        const updatedUser = { ...user, kyc_status: 'verified', kyc_documents: [kycDocument] };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setUploadStatus('success');
        await refreshUser();
        
        // Auto-complete after 2 seconds
        setTimeout(() => {
          onKYCComplete();
        }, 2000);
        
        return;
      }

      // Real Supabase mode
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      // Process OCR
      const ocrResult = await processOCR(file);
      setOcrData(ocrResult);

      // Validate age (must be 18+)
      const birthDate = new Date(ocrResult.dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const isValidAge = age >= 18;

      if (!isValidAge) {
        throw new Error('You must be 18 or older to use this service');
      }

      // Update user KYC status
      const kycDocument = {
        type: 'national_id',
        file_url: publicUrl,
        ocr_data: ocrResult,
        status: 'verified',
        submitted_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('users')
        .update({
          kyc_status: 'verified',
          kyc_documents: [kycDocument],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUploadStatus('success');
      await refreshUser();
      
      // Auto-complete after 2 seconds
      setTimeout(() => {
        onKYCComplete();
      }, 2000);

    } catch (error: any) {
      console.error('KYC upload error:', error);
      setError(error.message || 'Failed to process document');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
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

  if (uploadStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">KYC Verified!</h2>
          <p className="text-gray-600 mb-6">Your identity has been successfully verified.</p>
          
          {ocrData && (
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              <h3 className="font-semibold text-gray-900 mb-2">Extracted Information:</h3>
              <p className="text-sm"><strong>Name:</strong> {ocrData.name}</p>
              <p className="text-sm"><strong>DOB:</strong> {ocrData.dob}</p>
              <p className="text-sm"><strong>Country:</strong> {ocrData.country}</p>
              <p className="text-sm"><strong>Document:</strong> {ocrData.document_type}</p>
            </div>
          )}
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
              <p className="text-yellow-800 font-semibold">Processing Document...</p>
              <p className="text-yellow-600 text-sm">Extracting information using OCR</p>
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