import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Coins, Download, ExternalLink, RefreshCw, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { frontendContractService, SwapRecord } from '../utils/contractIntegration';
import { paymentsAPI } from '../services/api';

type Tab = 'all' | 'sent' | 'received' | 'purchased';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'purchased';
  amount: string;
  currency: string;
  timestamp: string;
  txHash: string;
  status: 'confirmed' | 'pending' | 'failed';
  from?: string;
  to?: string;
}

const History = () => {
  const { account, isConnected } = useWallet();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [merchantPayments, setMerchantPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'sent', label: 'Sent' },
    { key: 'received', label: 'Received' },
    { key: 'purchased', label: 'Purchased' },
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !account) {
        setTransactions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch swap history from contract
        const swapHistory: SwapRecord[] = await frontendContractService.getUserSwapHistory(account);
        
        // Fetch merchant payments
        const merchantTx = await paymentsAPI.listForMerchant(account)
          .then(r => r.data)
          .catch(() => []);

        setMerchantPayments(merchantTx);

        // Combine and format transactions
        const formatted: Transaction[] = [];

        // Add swap transactions
        swapHistory.forEach((swap) => {
          const isSent = swap.user.toLowerCase() === account.toLowerCase();
          formatted.push({
            id: swap.txHash,
            type: isSent ? 'sent' : 'received',
            amount: swap.toAmount.toString(),
            currency: swap.toCurrency,
            timestamp: new Date(Number(swap.timestamp) * 1000).toISOString(),
            txHash: swap.txHash,
            status: 'confirmed',
            from: swap.user,
            to: 'Contract'
          });
        });

        // Add merchant payment transactions
        merchantTx.forEach((payment: any) => {
          const isReceived = payment.receiver?.toLowerCase() === account.toLowerCase();
          formatted.push({
            id: payment.txHash || `merchant_${payment.id}`,
            type: isReceived ? 'received' : 'sent',
            amount: payment.amount || '0',
            currency: 'USDT',
            timestamp: payment.timestamp || new Date().toISOString(),
            txHash: payment.txHash || '',
            status: payment.status === 'success' ? 'confirmed' : 'pending',
            from: payment.sender,
            to: payment.receiver
          });
        });

        // Sort by timestamp (newest first)
        formatted.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setTransactions(formatted);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [isConnected, account]);

  const filteredTransactions = transactions.filter(tx => {
    if (tab === 'all') return true;
    return tx.type === tab;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'received':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'purchased':
        return <Coins className="w-5 h-5 text-purple-600" />;
      default:
        return <Coins className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDownload = () => {
    // Create CSV content
    const csvContent = [
      ['Type', 'Amount', 'Currency', 'Status', 'Timestamp', 'Tx Hash'].join(','),
      ...filteredTransactions.map(tx => [
        tx.type,
        tx.amount,
        tx.currency,
        tx.status,
        tx.timestamp,
        tx.txHash
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        {isConnected && (
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to view transaction history</p>
          <Link
            to="/receive"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Connect Wallet
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                  tab === t.key 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                {t.label} {tab === t.key && `(${filteredTransactions.length})`}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No {tab !== 'all' ? tab : ''} transactions found</p>
              <Link
                to="/send"
                className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Make Your First Transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getTransactionIcon(tx.type)}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 capitalize">
                        {tx.type === 'sent' ? 'Sent' : tx.type === 'received' ? 'Received' : 'Purchased'} {tx.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(tx.timestamp)} • {tx.status === 'confirmed' ? 'Confirmed' : tx.status === 'pending' ? 'Pending' : 'Failed'}
                      </div>
                      {tx.txHash && (
                        <div className="text-xs text-gray-400 font-mono mt-1">
                          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`font-semibold ${
                      tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'sent' ? '-' : '+'}{parseFloat(tx.amount).toFixed(6)} {tx.currency}
                    </div>
                    {tx.txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1 mt-1 justify-end"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="mt-6">
              <button 
                onClick={handleDownload}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report (CSV)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;


