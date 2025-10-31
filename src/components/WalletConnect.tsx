import { useState, useEffect } from 'react';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useKYC } from '../context/KYCContext';
import { useAuth } from '../context/AuthContext';

const WalletConnect = () => {
  const { connect, disconnect, isConnected, account, provider } = useWallet();
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
      <div className="flex items-center space-x-4">
        {/* Network Warning */}
        {!isSepolia && (
          <div className="bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <div className="text-xs text-yellow-800">
              <div className="font-medium">Wrong Network</div>
              <div>Switch to Sepolia Testnet</div>
            </div>
          </div>
        )}
        
        {/* Wallet Address */}
        <div className={`px-4 py-2 rounded-lg ${isSepolia ? 'bg-green-100' : 'bg-gray-100'}`}>
          <div className={`text-xs mb-1 ${isSepolia ? 'text-green-600' : 'text-gray-600'}`}>
            {isSepolia ? 'Sepolia Wallet' : 'Wallet'}
          </div>
          <span className={`text-sm font-medium ${isSepolia ? 'text-green-800' : 'text-gray-800'}`}>
            {account?.substring(0, 6)}...{account?.substring(-4)}
          </span>
        </div>
        
        {/* Network Info */}
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">Network</div>
          <span className="text-sm font-medium text-blue-800">
            {networkName || 'Unknown'}
          </span>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="bg-purple-100 px-4 py-2 rounded-lg">
            <div className="text-xs text-purple-600 mb-1">User</div>
            <span className="text-sm font-medium text-purple-800">
              {user.phone}
            </span>
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={connect}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        <Wallet className="w-5 h-5" />
        <span>Connect MetaMask</span>
      </button>
      <div className="text-xs text-gray-600 text-center">
        <div>Will connect to Sepolia Testnet</div>
        <div>Real MetaMask popup will appear</div>
      </div>
    </div>
  );
};

export default WalletConnect;