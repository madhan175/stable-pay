import React from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useState } from 'react';

const WalletConnect = () => {
  const { connect, disconnect, isConnected, account } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
              <p className="text-sm text-gray-600">MetaMask</p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-gray-700 break-all">
              {account?.substring(0, 6)}...{account?.substring(-4)}
            </span>
            <button
              onClick={copyAddress}
              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors duration-200"
              title="Copy Address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        {copied && (
          <div className="mt-2 text-xs text-green-600 text-center">
            Address copied to clipboard!
          </div>
        )}
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