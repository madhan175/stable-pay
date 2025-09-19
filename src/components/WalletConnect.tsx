import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const WalletConnect = () => {
  const { connect, disconnect, isConnected, account } = useWallet();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-green-100 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-green-800">
            {account?.substring(0, 6)}...{account?.substring(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
    </button>
  );
};

export default WalletConnect;