import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import { useKYC } from '../context/KYCContext';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { uploadKYCDocument, isLoading, error, clearError } = useKYC();
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('national_id');
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'national_id', label: 'National ID (Aadhaar/PAN)' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'pan_card', label: 'PAN Card' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG) or PDF');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      clearError();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      clearError();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStep('processing');
    clearError();

    try {
      const result = await uploadKYCDocument(selectedFile, documentType);
      setUploadResult(result);
      setStep('result');

      if (result.success && onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setUploadResult({ success: false, message: 'Upload failed' });
      setStep('result');
    }
  };

  const resetModal = () => {
    setStep('upload');
    setSelectedFile(null);
    setDocumentType('national_id');
    setUploadResult(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  KYC Required
                </h3>
                <p className="text-gray-600">
                  Your transaction exceeds $200 USD. Please verify your identity to continue.
                </p>
              </div>

              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload & Verify</span>
                )}
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-6">
              <Loader className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Document
                </h3>
                <p className="text-gray-600">
                  We're analyzing your document using OCR technology...
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Extracting text from image</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Validating information</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Checking document authenticity</span>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && uploadResult && (
            <div className="text-center space-y-6">
              {uploadResult.success ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verification Successful!
                    </h3>
                    <p className="text-gray-600">
                      Your identity has been verified. You can now proceed with your transaction.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verification Failed
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {uploadResult.message}
                    </p>
                    <button
                      onClick={resetModal}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCModal;
