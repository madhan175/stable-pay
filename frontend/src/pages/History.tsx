import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Coins, Download, ExternalLink, RefreshCw, Wallet, FileText } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { frontendContractService, SwapRecord } from '../utils/contractIntegration';
import { paymentsAPI, transactionAPI } from '../services/api';

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
  isSupabaseTx?: boolean;
}

const History = () => {
  const { account, isConnected } = useWallet();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

        // Fetch transactions from Supabase if user is logged in
        let supabaseTransactions: Transaction[] = [];
        if (user?.id) {
          try {
            const response = await transactionAPI.getHistory(user.id);
            if (response.data && Array.isArray(response.data)) {
              supabaseTransactions = response.data
                .filter((tx: any) => tx.status === 'completed')
                .map((tx: any) => {
                  const isSent = tx.recipient_wallet?.toLowerCase() === account.toLowerCase();
                  return {
                    id: tx.id || tx.tx_hash,
                    type: isSent ? 'sent' : 'received',
                    amount: tx.amount_usdt?.toString() || '0',
                    currency: 'USDT',
                    timestamp: tx.completed_at || tx.created_at || new Date().toISOString(),
                    txHash: tx.tx_hash || '',
                    status: tx.status === 'completed' ? 'confirmed' : 'pending',
                    from: isSent ? account : undefined,
                    to: tx.recipient_wallet,
                    isSupabaseTx: true
                  };
                });
            }
          } catch (supabaseError) {
            console.warn('Failed to fetch Supabase transactions:', supabaseError);
            // Continue with other sources even if Supabase fails
          }
        }

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

        // Add Supabase transactions
        supabaseTransactions.forEach((tx) => {
          // Avoid duplicates by checking if txHash already exists
          const exists = formatted.some(f => f.txHash === tx.txHash && tx.txHash);
          if (!exists) {
            formatted.push(tx);
          }
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
  }, [isConnected, account, user]);

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

  const handleReceiptDownload = async (transactionId: string) => {
    try {
      await transactionAPI.downloadReceipt(transactionId);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleDownload = () => {
    try {
      // Helper function to escape CSV values
      const escapeCSV = (value: string | null | undefined): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Create CSV content with proper escaping
      const headers = ['Type', 'Amount', 'Currency', 'Status', 'Timestamp', 'Tx Hash'];
      const rows = filteredTransactions.map(tx => [
        escapeCSV(tx.type),
        escapeCSV(tx.amount),
        escapeCSV(tx.currency),
        escapeCSV(tx.status),
        escapeCSV(tx.timestamp),
        escapeCSV(tx.txHash)
      ]);

      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Add BOM for Excel compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-12 overflow-x-hidden w-full max-w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction History</h1>
        {isConnected && (
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 sm:p-2 text-gray-500 hover:text-blue-600 active:bg-blue-50 rounded-lg transition-colors touch-manipulation"
            title="Refresh"
            aria-label="Refresh transactions"
          >
            <RefreshCw className={`w-5 h-5 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
          <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Connect your wallet to view transaction history</p>
          <Link
            to="/receive"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation text-sm sm:text-base font-medium"
          >
            Connect Wallet
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 sm:px-4 py-2.5 sm:py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap touch-manipulation min-w-fit active:scale-95 ${
                  tab === t.key 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 active:bg-gray-50'
                }`}
              >
                <span className="block sm:inline">{t.label}</span>
                {tab === t.key && (
                  <span className="ml-1 text-xs sm:text-sm opacity-90">({filteredTransactions.length})</span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <Coins className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">No {tab !== 'all' ? tab : ''} transactions found</p>
              <Link
                to="/send"
                className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation text-sm sm:text-base font-medium"
              >
                Make Your First Transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-3 mb-4 sm:mb-6">
              {filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow active:bg-gray-50"
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900 capitalize truncate">
                          {tx.type === 'sent' ? 'Sent' : tx.type === 'received' ? 'Received' : 'Purchased'} {tx.currency}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {formatDate(tx.timestamp)} • {tx.status === 'confirmed' ? 'Confirmed' : tx.status === 'pending' ? 'Pending' : 'Failed'}
                        </div>
                        {tx.txHash && (
                          <div className="text-xs text-gray-400 font-mono mt-1 break-all sm:break-normal">
                            <span className="hidden sm:inline">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</span>
                            <span className="sm:hidden">{tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                      <div className={`font-semibold text-sm sm:text-base ${
                        tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)}
                      </div>
                      <div className={`text-xs sm:text-sm ${tx.type === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.currency}
                      </div>
                      <div className="flex flex-col items-end gap-1 mt-1.5 sm:mt-1">
                        {tx.txHash && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 active:text-blue-800 flex items-center space-x-1 touch-manipulation"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        )}
                        {tx.isSupabaseTx && tx.status === 'confirmed' && (
                          <button
                            onClick={() => handleReceiptDownload(tx.id)}
                            className="text-xs text-purple-600 hover:text-purple-700 active:text-purple-800 flex items-center space-x-1 touch-manipulation"
                          >
                            <FileText className="w-3 h-3 flex-shrink-0" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <button 
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 sm:px-4 py-3 sm:py-2 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 active:border-blue-400 transition-colors touch-manipulation font-medium text-sm sm:text-base"
              >
                <Download className="w-5 h-5 sm:w-4 sm:h-4" />
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


