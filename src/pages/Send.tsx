import React, { useState, useEffect } from 'react';
import { ArrowRight, Wallet, RefreshCw, CheckCircle, XCircle, Loader, AlertTriangle, Info } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import { convertINRToUSDT, swapUSDTToFiat, switchToSepolia, getGSTRate } from '../utils/blockchain';
import { supabase } from '../lib/supabase';

const Send = () => {
  const { account, isConnected } = useWallet();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inrAmount, setInrAmount] = useState('');
  const [conversionData, setConversionData] = useState<{
    usdtAmount: number;
    gstAmount: number;
    totalCost: number;
  } | null>(null);
  const [merchantAddress, setMerchantAddress] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [requiresKYC, setRequiresKYC] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  const handleConvert = async () => {
    if (!inrAmount) return;
    
    setIsConverting(true);
    setRequiresKYC(false);
    setConversionData(null);
    try {
      const result = await convertINRToUSDT(parseFloat(inrAmount));
      setConversionData(result);
      
      // Check if KYC is required (>$200 USD)
      if (result.usdtAmount > 200) {
        setRequiresKYC(true);
      }
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSend = async () => {
    if (!isConnected || !conversionData || !merchantAddress || !user) return;
    
    // Check KYC requirements
    const amountUSD = conversionData.usdtAmount;
    if (amountUSD > 200 && (!user.phone_verified || user.kyc_status !== 'verified')) {
      setShowKYCModal(true);
      return;
    }
    
    try {
      // Switch to Sepolia network
      await switchToSepolia();
    } catch (error) {
      console.error('Failed to switch to Sepolia:', error);
      setTxStatus('error');
      return;
    }
    
    setIsSending(true);
    setTxStatus('pending');
    
    try {
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          recipient_wallet: merchantAddress,
          amount_inr: parseFloat(inrAmount),
          amount_usd: conversionData.usdtAmount,
          amount_usdt: conversionData.usdtAmount,
          requires_kyc: amountUSD > 200,
          kyc_verified: user.kyc_status === 'verified',
          status: 'pending'
        })
        .select()
        .single();

      if (txError) throw txError;

      // Execute the swap from USDT to INR (reverse direction for demo)
      const hash = await swapUSDTToFiat('INR', conversionData.usdtAmount);
      
      // Update transaction with hash
      await supabase
        .from('transactions')
        .update({ 
          tx_hash: hash, 
          status: 'completed' 
        })
        .eq('id', transaction.id);
      
      setTxHash(hash);
      setTxStatus('success');
    } catch (error) {
      console.error('Transaction error:', error);
      setTxStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleKYCRedirect = () => {
    navigate('/kyc');
  };

  useEffect(() => {
    if (inrAmount && parseFloat(inrAmount) > 0) {
      const timer = setTimeout(() => {
        handleConvert();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setConversionData(null);
    }
  }, [inrAmount]);

  useEffect(() => {
    const fetchGSTRate = async () => {
      try {
        const rate = await getGSTRate();
        setGstRate(rate);
      } catch (error) {
        console.error('Error fetching GST rate:', error);
      }
    };
    
    fetchGSTRate();
  }, []);
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Send Payment
          </h1>
          <p className="text-lg text-gray-600">
            Please verify your phone number to continue
          </p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8">
            To ensure secure transactions, please verify your phone number first.
          </p>
          <button
            onClick={() => navigate('/kyc')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Verify Phone Number
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Send Payment
        </h1>
        <p className="text-lg text-gray-600">
          Convert INR to USDT and send to merchant wallet
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* INR Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Amount in INR
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-gray-500 font-medium">₹</span>
            <input
              type="number"
              value={inrAmount}
              onChange={(e) => setInrAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-4 text-xl font-semibold border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* Conversion Arrow */}
        {inrAmount && conversionData && (
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <ArrowRight className="w-6 h-6 text-white transform rotate-90" />
            </div>
          </div>
        )}

        {/* USDT Output */}
        {conversionData && (
          <div className="mb-8 space-y-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Conversion Details
            </label>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">USDT Amount:</span>
                <span className="text-xl font-bold text-gray-900">
                  ${conversionData.usdtAmount.toFixed(6)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">GST ({gstRate}%):</span>
                <span className="text-lg font-semibold text-orange-600">
                  ${conversionData.gstAmount.toFixed(6)}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Total Cost:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${conversionData.totalCost.toFixed(6)}
                  </span>
                </div>
              </div>
              
              {isConverting && (
                <div className="flex items-center justify-center pt-2">
                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                  <span className="text-sm text-blue-600">Updating rates...</span>
                </div>
              )}
            </div>
            
            {/* Network Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Sepolia Testnet</p>
                  <p className="text-sm text-blue-700 mt-1">
                    This transaction will be executed on Sepolia testnet. Make sure your MetaMask is connected to Sepolia.
                  </p>
                </div>
              </div>
            </div>
            
            {/* KYC Warning */}
            {requiresKYC && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">KYC Verification Required</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Transactions above $200 require identity verification for compliance and security.
                    </p>
                    {(!user.phone_verified || user.kyc_status !== 'verified') && (
                      <button
                        onClick={handleKYCRedirect}
                        className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                      >
                        Complete KYC Verification →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Merchant Address */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Merchant Wallet Address
          </label>
          <input
            type="text"
            value={merchantAddress}
            onChange={(e) => setMerchantAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-0 outline-none transition-colors duration-200"
          />
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="text-center">
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!conversionData || !merchantAddress || isSending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing Swap...</span>
                </>
              ) : (
                <>
                  <span>Execute Swap</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Transaction Status */}
        {txStatus !== 'idle' && (
          <div className="mt-8">
            {txStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
                  <span className="text-sm font-medium text-yellow-800">
                    Transaction pending...
                  </span>
                </div>
              </div>
            )}
            
            {txStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Swap executed successfully!
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-green-700">
                    <strong>Transaction Hash:</strong>
                  </p>
                  <p className="text-xs text-green-700 break-all font-mono">
                    {txHash}
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    View on Sepolia Etherscan →
                  </a>
                </div>
              </div>
            )}
            
            {txStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Swap failed. Please ensure you're on Sepolia testnet and try again.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* KYC Modal */}
        {showKYCModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  KYC Verification Required
                </h3>
                <p className="text-gray-600 mb-6">
                  To send amounts above $200, you need to complete identity verification for regulatory compliance.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowKYCModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleKYCRedirect}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
                  >
                    Verify Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Send;