import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CheckCircle, X, Camera } from 'lucide-react';

interface QRScannerProps {
  onScan?: (decodedText: string) => void;
  onComplete?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onComplete }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        // Prefer back camera, fallback to first available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        );
        const selectedCamera = backCamera?.id || devices[0].id;
        setCameraId(selectedCamera);
        startScanner(selectedCamera);
      } else {
        throw new Error('No cameras found');
      }
    } catch (err: any) {
      console.error('Error initializing scanner:', err);
      setError('Failed to access camera. Please grant camera permissions.');
    }
  };

  const startScanner = async (cameraId: string) => {
    try {
      if (!scannerRef.current) return;

      const html5QrCode = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Successfully scanned
          setScannedData(decodedText);
          setIsScanning(false);
          html5QrCode.stop();
          
          if (onScan) {
            onScan(decodedText);
          }
          
          if (onComplete) {
            setTimeout(() => onComplete(), 1000);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (continuous scanning)
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError('Failed to start scanner. Please check camera permissions.');
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {
        // Ignore errors when stopping
      });
      html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleRetry = async () => {
    stopScanner();
    setScannedData(null);
    if (cameraId) {
      await startScanner(cameraId);
    } else {
      await initializeScanner();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl border-2 border-gray-300 bg-gray-900 h-56 overflow-hidden">
        {!isScanning && !error && !scannedData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
              <div className="text-gray-400">Initializing scanner...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center px-4">
              <X className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 text-sm mb-4">{error}</div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {scannedData && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-900/50 z-10">
            <div className="text-center px-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-semibold mb-2">QR Code Scanned!</div>
              <div className="text-green-300 text-xs break-all max-w-xs">{scannedData}</div>
            </div>
          </div>
        )}

        <div
          id="qr-scanner"
          ref={scannerRef}
          className="w-full h-full"
        />
      </div>

      {!scannedData && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <QrCode className="w-4 h-4" />
          <span>Point camera at QR code or barcode</span>
        </div>
      )}

      {scannedData && (
        <div className="flex items-center justify-center">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Scan Another
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Grant camera permissions when prompted. Hold your device steady for better scanning.
      </div>
    </div>
  );
};

export default QRScanner;

