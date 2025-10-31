import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle, X, AlertCircle } from 'lucide-react';

interface BiometricAuthProps {
  onAuthenticated?: () => void;
  onError?: (error: string) => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ 
  onAuthenticated, 
  onError 
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedSupport, setHasCheckedSupport] = useState(false);

  useEffect(() => {
    // Stop any active camera streams when BiometricAuth component mounts
    // This ensures camera is off when user navigates from Face Verification
    const stopAllCameraStreams = () => {
      // Check for any existing video elements with active streams
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            if (track.kind === 'video') {
              track.stop();
              track.enabled = false;
            }
          });
          video.srcObject = null;
        }
      });
      
      // Also check MediaStreamTrack.getSources if available (for any orphaned tracks)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Enumerate all media devices to find active video tracks
        navigator.mediaDevices.enumerateDevices().catch(() => {
          // Ignore errors
        });
      }
    };
    
    stopAllCameraStreams();
    
    // Only check basic support, don't probe for authenticators yet
    checkBasicSupport();
    
    // Cleanup on unmount
    return () => {
      stopAllCameraStreams();
    };
  }, []);

  const checkBasicSupport = () => {
    // Check if Web Authentication API is supported
    if (window.PublicKeyCredential) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('Biometric authentication is not supported in this browser');
    }
  };

  const checkBiometricSupport = async () => {
    if (hasCheckedSupport) return;
    
    try {
      setHasCheckedSupport(true);
      
      // Check if credentials are available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available);
      
      // Check if it's already set up in localStorage
      const existingCredentials = localStorage.getItem('biometric_credentials');
      if (existingCredentials) {
        console.log('✅ Biometric credentials found in storage');
      }
    } catch (err: any) {
      console.error('Error checking biometric support:', err);
      setIsAvailable(false);
      setError('Failed to check biometric support');
    }
  };

  const registerBiometric = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Check support if not already checked
      if (!hasCheckedSupport) {
        await checkBiometricSupport();
      }

      // Check if already registered
      const existing = localStorage.getItem('biometric_credentials');
      if (existing) {
        throw new Error('Biometric authentication already registered');
      }

      // Create credential options
      const credentialOptions: PublicKeyCredentialCreationOptions = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: 'StablePay',
            id: window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(32)),
            name: 'user@stablepay.local',
            displayName: 'StablePay User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Built-in authenticators only
            userVerification: 'required',
          },
          timeout: 60000,
          attestation: 'none',
        },
      };

      // Create credential
      const credential = await navigator.credentials.create(credentialOptions);
      
      if (credential) {
        // Store credential info
        const credentialData = {
          id: (credential as PublicKeyCredential).id,
          type: credential.type,
          registeredAt: new Date().toISOString(),
        };
        
        localStorage.setItem('biometric_credentials', JSON.stringify(credentialData));
        console.log('✅ Biometric authentication registered successfully');
        
        // Call success callback
        if (onAuthenticated) {
          onAuthenticated();
        }
      }
    } catch (err: any) {
      console.error('Error registering biometric:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to register biometric authentication';
      
      if (err.message?.includes('already registered')) {
        errorMessage = 'Biometric authentication is already set up';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Biometric registration cancelled or denied';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'Biometric authentication already exists';
      } else if (!isAvailable) {
        errorMessage = 'No biometric authenticator available on this device';
      }
      
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticate = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Check if credentials exist
      const existing = localStorage.getItem('biometric_credentials');
      if (!existing) {
        throw new Error('Biometric authentication not set up');
      }

      // Get stored credential
      const credentialData = JSON.parse(existing);

      // Create get options
      const getOptions: PublicKeyCredentialRequestOptions = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            id: Uint8Array.from(atob(credentialData.id), c => c.charCodeAt(0)),
            type: 'public-key',
            transports: ['internal'],
          }],
          timeout: 60000,
          userVerification: 'required',
        },
      };

      // Authenticate
      const assertion = await navigator.credentials.get(getOptions);
      
      if (assertion) {
        console.log('✅ Biometric authentication successful');
        
        // Call success callback
        if (onAuthenticated) {
          onAuthenticated();
        }
      }
    } catch (err: any) {
      console.error('Error authenticating with biometric:', err);
      
      let errorMessage = 'Biometric authentication failed';
      
      if (err.message?.includes('not set up')) {
        errorMessage = 'Please set up biometric authentication first';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Authentication cancelled or denied';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'Authentication unavailable';
      }
      
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const hasCredentials = () => {
    return !!localStorage.getItem('biometric_credentials');
  };

  return (
    <div className="space-y-4">
      {/* Support Status */}
      {!isSupported && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Not Supported
              </h4>
              <p className="text-xs text-yellow-700 mt-1">
                Biometric authentication is not supported in this browser. 
                Please use a modern browser with WebAuthn support.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSupported && isAvailable === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                No Authenticator Available
              </h4>
              <p className="text-xs text-yellow-700 mt-1">
                No biometric authenticator found on this device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <X className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {hasCredentials() && !error && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800">
                Biometric Enabled
              </h4>
              <p className="text-xs text-green-700 mt-1">
                Your biometric authentication is set up and ready to use.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isSupported && isAvailable !== false && (
        <div className="space-y-3">
          {!hasCredentials() ? (
            <button
              onClick={registerBiometric}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Fingerprint className="w-5 h-5" />
              <span>
                {isAuthenticating ? 'Setting up...' : 'Enable Biometric Auth'}
              </span>
            </button>
          ) : (
            <button
              onClick={authenticate}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Fingerprint className="w-5 h-5" />
              <span>
                {isAuthenticating ? 'Authenticating...' : 'Login with Biometric'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Uses your device's built-in biometric authenticator</p>
        <p>• Supports fingerprint, face ID, or other platform authenticators</p>
        <p>• Your biometric data never leaves your device</p>
      </div>
    </div>
  );
};

export default BiometricAuth;

