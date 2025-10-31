import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, Check } from 'lucide-react';

interface WalletQRCodeProps {
  walletAddress: string;
  size?: number;
  showDownload?: boolean;
}

const WalletQRCode: React.FC<WalletQRCodeProps> = ({ 
  walletAddress, 
  size = 256,
  showDownload = true 
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const downloadQR = async () => {
    setDownloading(true);
    try {
      // Get the SVG element
      const svgElement = document.getElementById('wallet-qr-code');
      if (!svgElement) {
        throw new Error('QR code not found');
      }

      // Convert SVG to blob
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create canvas to convert to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size + 40; // Add padding
        canvas.height = size + 40;
        
        // Draw white background
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw QR code in center
          ctx.drawImage(img, 20, 20, size, size);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `wallet-qr-${walletAddress.substring(0, 10)}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
            URL.revokeObjectURL(svgUrl);
            setDownloading(false);
          }, 'image/png');
        }
      };

      img.src = svgUrl;
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setDownloading(false);
    }
  };

  // Format address for display (shortened)
  const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Your Wallet Address
        </h3>
        <p className="text-sm text-gray-600">
          Scan to receive payments
        </p>
      </div>

      {/* QR Code Display */}
      <div className="flex justify-center mb-4">
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
          <div id="wallet-qr-code">
            <QRCode
              value={walletAddress}
              size={size}
              level="M"
              fgColor="#1f2937"
              bgColor="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Wallet Address Text */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-mono text-gray-800 break-all">
            {walletAddress}
          </p>
          <button
            onClick={copyAddress}
            className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      {showDownload && (
        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">
              {downloading ? 'Downloading...' : 'Download QR Code'}
            </span>
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Share this QR code to receive USDT payments
        </p>
      </div>
    </div>
  );
};

export default WalletQRCode;

