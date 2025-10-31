import React, { useRef, useEffect, useState } from 'react';
import { Camera, CheckCircle, X } from 'lucide-react';

interface FaceVerificationProps {
  onComplete?: () => void;
}

const FaceVerification: React.FC<FaceVerificationProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const handleVerify = () => {
    // Simulate face verification
    setIsVerified(true);
    // Stop camera immediately when verification starts
    stopCamera();
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl border-2 border-gray-300 bg-gray-900 h-56 overflow-hidden">
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
              <div className="text-gray-400">Starting camera...</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center px-4">
              <X className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 text-sm">{error}</div>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/50 z-10">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-semibold">Face Verified!</div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
        />
      </div>

      <div className="flex items-center justify-center space-x-4">
        {!isVerified ? (
          <>
            {isStreaming && (
              <button
                onClick={handleVerify}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Verify Face
              </button>
            )}
          </>
        ) : (
          <div className="text-green-600 text-sm font-medium">Verification complete!</div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Position your face within the frame. Make sure there's good lighting.
      </div>
    </div>
  );
};

export default FaceVerification;

