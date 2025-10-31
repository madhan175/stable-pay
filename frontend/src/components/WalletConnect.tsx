import { useState, useEffect } from 'react';
import { Wallet, LogOut, AlertCircle, Smartphone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useKYC } from '../context/KYCContext';
import { useAuth } from '../context/AuthContext';
import { isMobileDevice, isIOS, getMobileConnectionInstructions, getMetaMaskInstallLinks } from '../utils/mobileWallet';

const WalletConnect = () => {
  const { connect, disconnect, isConnected, account, provider, isMobile } = useWallet();
  const { logout: logoutKYC, user } = useKYC();
  const { logout: logoutAuth } = useAuth();
  const navigate = useNavigate();
  const [networkName, setNetworkName] = useState<string>('');
  const [isSepolia, setIsSepolia] = useState<boolean>(false);

  // Check network when provider changes
  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          setNetworkName(network.name);
          setIsSepolia(network.chainId === 11155111n);
          console.log('🌐 [WALLET] Network:', network.name, 'Chain ID:', network.chainId);
        } catch (error) {
          console.error('❌ [WALLET] Error checking network:', error);
        }
      }
    };

    checkNetwork();
  }, [provider]);

  const handleLogout = () => {
    // Disconnect wallet
    disconnect();
    // Clear user data from both contexts
    logoutKYC();
    logoutAuth();
    // Redirect to onboarding page
    navigate('/onboarding', { replace: true });
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2 max-w-full">
        {/* Network Warning */}
        {!isSepolia && (
          <div className="bg-yellow-100 border border-yellow-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
            <div className="text-[10px] sm:text-xs text-yellow-800">
              <div className="font-medium whitespace-nowrap">Wrong Network</div>
              <div className="whitespace-nowrap">Switch to Sepolia</div>
            </div>
          </div>
        )}
        
        {/* Wallet Address */}
        <div className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex-shrink-0 ${isSepolia ? 'bg-green-100' : 'bg-gray-100'}`}>
          <div className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${isSepolia ? 'text-green-600' : 'text-gray-600'}`}>
            {isSepolia ? 'Sepolia' : 'Wallet'}
          </div>
          <span className={`text-xs sm:text-sm font-medium ${isSepolia ? 'text-green-800' : 'text-gray-800'} whitespace-nowrap`}>
            {account?.substring(0, 4)}...{account?.substring(-3)}
          </span>
        </div>
        
        {/* Network Info */}
        <div className="bg-blue-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex-shrink-0 hidden sm:block">
          <div className="text-[10px] sm:text-xs text-blue-600 mb-0.5 sm:mb-1">Network</div>
          <span className="text-xs sm:text-sm font-medium text-blue-800 whitespace-nowrap">
            {networkName || 'Unknown'}
          </span>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="bg-purple-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex-shrink-0 hidden sm:block">
            <div className="text-[10px] sm:text-xs text-purple-600 mb-0.5 sm:mb-1">User</div>
            <span className="text-xs sm:text-sm font-medium text-purple-800 whitespace-nowrap">
              {user.phone}
            </span>
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 flex-shrink-0"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  const mobile = isMobileDevice();
  const ios = isIOS();
  const instructions = getMobileConnectionInstructions();
  const installLinks = getMetaMaskInstallLinks();

  if (mobile && !isConnected) {
    return (
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full max-w-full px-4 sm:px-0">
        {/* Mobile Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-md">
          <div className="flex items-center space-x-2 mb-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">{instructions.title}</h3>
          </div>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1 mb-3">
            {instructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          {instructions.alternative && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="text-xs sm:text-sm text-blue-700 italic">{instructions.alternative}</p>
            </div>
          )}
        </div>

        {/* Connect Button */}
        <button
          onClick={connect}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto justify-center"
        >
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>{instructions.actionText}</span>
        </button>

        {/* Install MetaMask Link */}
        <a
          href={ios ? installLinks.ios : installLinks.android}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 underline"
        >
          <span>Don't have MetaMask? Install it here</span>
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
        </a>

        <div className="text-[10px] sm:text-xs text-gray-600 text-center px-2">
          <div className="whitespace-nowrap">Will connect to Sepolia Testnet</div>
          <div className="whitespace-nowrap">MetaMask app will open automatically</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-1 sm:space-y-2 w-full max-w-full px-2 sm:px-0">
      <button
        onClick={connect}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto justify-center"
      >
        <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="whitespace-nowrap">Connect MetaMask</span>
      </button>
      <div className="text-[10px] sm:text-xs text-gray-600 text-center px-2">
        <div className="whitespace-nowrap">Will connect to Sepolia Testnet</div>
        <div className="whitespace-nowrap">Real MetaMask popup will appear</div>
      </div>
    </div>
  );
};

export default WalletConnect;