import React, { useState, useEffect } from 'react';
import { ArrowRight, Wallet, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletConnect from '../components/WalletConnect';
import { convertINRToUSDT, sendUSDT } from '../utils/blockchain';

const Send = () => {
  const { account, isConnected } = useWallet();
  const [inrAmount, setInrAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const handleConvert = async () => {
    if (!inrAmount) return;
    
    setIsConverting(true);
    try {
      const converted = await convertINRToUSDT(parseFloat(inrAmount));
      setUsdtAmount(converted.toFixed(6));
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSend = async () => {
    if (!isConnected || !usdtAmount || !merchantAddress) return;
    
    setIsSending(true);
    setTxStatus('pending');
    
    try {
      const hash = await sendUSDT(merchantAddress, parseFloat(usdtAmount));
      setTxHash(hash);
      setTxStatus('success');
    } catch (error) {
      console.error('Transaction error:', error);
      setTxStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (inrAmount && parseFloat(inrAmount) > 0) {
      const timer = setTimeout(() => {
        handleConvert();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsdtAmount('');
    }
  }, [inrAmount]);

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
        {inrAmount && (
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <ArrowRight className="w-6 h-6 text-white transform rotate-90" />
            </div>
          </div>
        )}

        {/* USDT Output */}
        {usdtAmount && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Equivalent USDT
            </label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 font-medium">$</span>
              <input
                type="text"
                value={usdtAmount}
                readOnly
                className="w-full pl-8 pr-12 py-4 text-xl font-semibold bg-gray-50 border-2 border-gray-200 rounded-2xl"
              />
              {isConverting && (
                <RefreshCw className="absolute right-4 top-4 w-6 h-6 text-blue-500 animate-spin" />
              )}
            </div>
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
                  Connected: {account?.substring(0, 6)}...{account?.substring(-4)}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!usdtAmount || !merchantAddress || isSending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send USDT</span>
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
                    Transaction successful!
                  </span>
                </div>
                <p className="text-xs text-green-700 break-all">
                  TX: {txHash}
                </p>
              </div>
            )}
            
            {txStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Transaction failed. Please try again.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Send;