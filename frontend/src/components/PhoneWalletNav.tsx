import { useState } from 'react';
import { Smartphone, Wallet, Phone, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useKYC } from '../context/KYCContext';
import { isMobileDevice, isIOS, getMobileConnectionInstructions, getMetaMaskInstallLinks, openMetaMaskMobile } from '../utils/mobileWallet';

const PhoneWalletNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connect, isConnected, account } = useWallet();
  const { user } = useKYC();
  const isMobile = isMobileDevice();
  const isIOSDevice = isIOS();
  const instructions = getMobileConnectionInstructions();
  const installLinks = getMetaMaskInstallLinks();

  const handleMobileConnect = async () => {
    try {
      if (isMobile) {
        await openMetaMaskMobile();
      } else {
        await connect();
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to connect mobile wallet:', error);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
        aria-label="Phone Wallet Options"
      >
        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Phone</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50"
               style={{ animation: 'fadeIn 0.2s ease-in' }}>
            {/* Phone Verification Section */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Phone Verification</h3>
              </div>
              {user && user.phone ? (
                <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  ✓ Verified: {user.phone}
                </div>
              ) : (
                <Link
                  to="/onboarding"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Verify Phone Number →
                </Link>
              )}
            </div>

            {/* Wallet Connection Section */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Wallet</h3>
              </div>
              {isConnected ? (
                <div className="text-sm">
                  <div className="text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-2">
                    ✓ Connected: {account?.substring(0, 6)}...{account?.substring(-4)}
                  </div>
                  <Link
                    to="/send"
                    onClick={() => setIsOpen(false)}
                    className="block text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    Send Payment →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {isMobile ? (
                    <>
                      <button
                        onClick={handleMobileConnect}
                        className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Connect MetaMask Mobile</span>
                      </button>
                      <a
                        href={isIOSDevice ? installLinks.ios : installLinks.android}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>Install MetaMask</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        connect();
                        setIsOpen(false);
                      }}
                      className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect MetaMask</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Quick Actions</h3>
              <div className="space-y-1">
                <Link
                  to="/send"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Send Payment
                </Link>
                <Link
                  to="/receive"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Receive Payment
                </Link>
                <Link
                  to="/history"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Transaction History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Profile Settings
                </Link>
              </div>
            </div>

            {/* Mobile Instructions (if mobile and not connected) */}
            {isMobile && !isConnected && (
              <div className="px-4 py-2 border-t border-gray-100 bg-blue-50">
                <div className="text-xs text-blue-800 space-y-1">
                  <div className="font-medium mb-1">📱 Mobile Connection:</div>
                  {instructions.steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="pl-2">{step}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneWalletNav;

