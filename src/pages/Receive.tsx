import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletConnect from '../components/WalletConnect';
import { getUSDTBalance, getRecentTransactions } from '../utils/blockchain';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

const Receive = () => {
  const { account, isConnected } = useWallet();
  const [balance, setBalance] = useState('0.000000');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const [balanceResult, txResult] = await Promise.all([
        getUSDTBalance(account),
        getRecentTransactions(account)
      ]);
      
      setBalance(balanceResult.toFixed(6));
      setTransactions(txResult);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchData();
      const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, account]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Merchant Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          View your USDT balance and recent transactions
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to view balance and transaction history
            </p>
            <WalletConnect />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Wallet Info */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Wallet Information</h2>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Wallet Address</span>
                  <button
                    onClick={copyAddress}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-lg font-mono text-gray-900 break-all">
                  {account}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                <span className="text-sm font-medium text-gray-600">USDT Balance</span>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${balance}
                  </span>
                  <span className="text-sm text-gray-500">USDT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Transactions</h2>
              <p className="text-gray-600 mt-2">Your latest USDT transactions</p>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.hash} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-500">
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            +${parseFloat(tx.value).toFixed(6)} USDT
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                          >
                            <span>View</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Receive;