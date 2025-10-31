import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, ExternalLink, Copy, Check, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import WalletConnect from '../components/WalletConnect';
import CurrencyRateDisplay from '../components/CurrencyRateDisplay';
import { getUSDTBalance } from '../utils/blockchain';
import { frontendContractService, SwapRecord } from '../utils/contractIntegration';
import { paymentsAPI } from '../services/api';
import socketService from '../services/socketService';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  fromCurrency?: string;
  toCurrency?: string;
  gstAmount?: string;
}

interface SwapTransaction {
  type: 'swap' | 'receive';
  direction: 'in' | 'out';
  user: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  gstAmount: string;
  timestamp: string;
  txHash: string;
}

const Receive = () => {
  const { account, isConnected } = useWallet();
  const [balance, setBalance] = useState('0.000000');
  const [usdBalance, setUsdBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [swapTransactions, setSwapTransactions] = useState<SwapTransaction[]>([]);
  const [merchantPayments, setMerchantPayments] = useState<any[]>([]);
  const totalReceived = merchantPayments
    .filter(p => (p.status || 'success') === 'success')
    .reduce((sum, p) => sum + (parseFloat(p.amount || '0') || 0), 0)
    .toFixed(6);
  const displayBalance = (parseFloat(balance || '0') + parseFloat(totalReceived || '0')).toFixed(6);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contractConnected] = useState(false);

  const fetchData = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const [balanceResult, txResult, merchantTx] = await Promise.all([
        getUSDTBalance(account),
        frontendContractService.getUserSwapHistory(account),
        paymentsAPI.listForMerchant(account).then(r => r.data).catch(() => [])
      ]);
      
      setBalance(balanceResult.toFixed(6));
      // Set USD balance (USDT is pegged to USD)
      setUsdBalance(balanceResult.toFixed(2));
      
      // Convert SwapRecord[] to Transaction[] format
      const formattedTransactions: Transaction[] = txResult.map((swap: SwapRecord) => ({
        hash: swap.txHash,
        from: swap.user,
        to: 'Contract',
        value: swap.toAmount.toString(),
        timestamp: Number(swap.timestamp),
        fromCurrency: swap.fromCurrency,
        toCurrency: swap.toCurrency,
        gstAmount: swap.gstAmount.toString()
      }));
      
      setTransactions(formattedTransactions);
      setMerchantPayments(merchantTx);
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

  // Listen for swap events if contract is connected
  useEffect(() => {
    if (contractConnected && account) {
      const handleSwapExecuted = (swap: SwapRecord) => {
        console.log('🔄 [RECEIVE] New swap detected:', swap);
        
        // Add new swap to the list
        const newSwap: SwapTransaction = {
          user: swap.user,
          fromCurrency: swap.fromCurrency,
          toCurrency: swap.toCurrency,
          fromAmount: swap.fromAmount.toString(),
          toAmount: swap.toAmount.toString(),
          gstAmount: swap.gstAmount.toString(),
          timestamp: swap.timestamp.toString(),
          txHash: swap.txHash,
          type: 'swap',
          direction: swap.user.toLowerCase() === account.toLowerCase() ? 'out' : 'in'
        };
        
        setSwapTransactions(prev => {
          // Check if swap already exists to avoid duplicates
          const exists = prev.some(existing => existing.txHash === swap.txHash);
          if (!exists) {
            return [newSwap, ...prev];
          }
          return prev;
        });
      };

      // Set up event listener
      frontendContractService.onSwapExecuted(handleSwapExecuted);

      // Cleanup
      return () => {
        frontendContractService.removeAllListeners();
      };
    }
  }, [contractConnected, account]);

  // Live payments via socket
  useEffect(() => {
    if (!account) return;
    const socket = socketService.connect();
    const onPayment = (payment: any) => {
      if ((payment?.receiver || '').toLowerCase() === account.toLowerCase()) {
        setMerchantPayments(prev => [payment, ...prev]);
      }
    };
    socketService.onNewPayment(onPayment);
    return () => {
      socketService.offNewPayment(onPayment);
      socket?.disconnect();
    };
  }, [account]);

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
          {/* Currency Rates */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
            <CurrencyRateDisplay />
          </div>
          
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
                    ${displayBalance}
                  </span>
                  <span className="text-sm text-gray-500">USDT</span>
                </div>
                
                {/* USD Value Display */}
                <div className="mt-3 bg-green-100 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">USD Value:</span>
                  </div>
                  <div className="text-lg font-semibold text-green-900 mt-1">
                    ${(parseFloat(displayBalance) || 0).toFixed(2)} USD
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    USDT is pegged to USD (1:1 ratio)
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Received (App Calculated)</span>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">+${totalReceived}</span>
                  <span className="text-sm text-gray-500">USDT</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Sum of successful incoming payments saved by the backend
                </div>
              </div>
            </div>

            {/* Swap Summary */}
            {contractConnected && swapTransactions.length > 0 && (
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
                  <div className="text-sm font-medium text-gray-600">Total Swaps</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {swapTransactions.length}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4">
                  <div className="text-sm font-medium text-gray-600">Sent Amount</div>
                  <div className="text-2xl font-bold text-red-600">
                    -${swapTransactions
                      .filter(tx => tx.direction === 'out')
                      .reduce((sum, tx) => sum + parseFloat(tx.toAmount), 0)
                      .toFixed(2)}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                  <div className="text-sm font-medium text-gray-600">Received Amount</div>
                  <div className="text-2xl font-bold text-green-600">
                    +${swapTransactions
                      .filter(tx => tx.direction === 'in')
                      .reduce((sum, tx) => sum + parseFloat(tx.toAmount), 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contract Status */}
          {isConnected && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${contractConnected ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-lg font-semibold text-gray-900">
                    Contract Status
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  contractConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {contractConnected ? 'Connected' : 'Mock Mode'}
                </div>
              </div>
            </div>
          )}

          {/* Swap Transactions */}
          {contractConnected && swapTransactions.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900">USDT Swap Transactions</h2>
                <p className="text-gray-600 mt-2">Your USDT to Fiat swap history</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From Currency
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To Currency
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {swapTransactions.map((swap, index) => (
                      <tr key={`${swap.txHash}-${index}`} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {swap.direction === 'out' ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {swap.direction === 'out' ? 'Sent' : 'Received'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {swap.fromCurrency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {swap.toCurrency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {swap.direction === 'out' ? '-' : '+'}${parseFloat(swap.toAmount).toFixed(6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(Number(swap.timestamp) * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Regular Transaction History */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900">USDT Transactions</h2>
              <p className="text-gray-600 mt-2">Your latest USDT blockchain transactions</p>
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
                        Swap Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currencies
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST
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
                            {typeof tx.hash === 'string' ? 
                              `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}` : 
                              'N/A'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-semibold">
                              {tx.fromCurrency || 'INR'} → {tx.toCurrency || 'USDT'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            +${parseFloat(tx.value || '0').toFixed(6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-600">
                            ${parseFloat(tx.gstAmount || '0').toFixed(6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date((tx.timestamp || 0) * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.hash || ''}`}
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

          {/* Merchant Payments (Backend verified) */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900">Incoming Payments</h2>
              <p className="text-gray-600 mt-2">Saved by backend, updates live</p>
            </div>
            {merchantPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No payments yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (USDT)</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx Hash</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {merchantPayments.map((p) => (
                      <tr key={p.txHash} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono">{p.sender?.slice(0, 6)}...{p.sender?.slice(-4)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">+${parseFloat(p.amount || '0').toFixed(6)}</td>
                        <td className="px-6 py-4 text-xs font-mono break-all">{p.txHash}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.status==='success'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{p.status}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Guided workflow: Next step */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/history"
          className="px-5 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        >
          Next: History
        </Link>
      </div>
    </div>
  );
};

export default Receive;