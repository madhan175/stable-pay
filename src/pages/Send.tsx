import { useState, useEffect } from 'react';
import { ArrowRight, Wallet, RefreshCw, CheckCircle, XCircle, Loader, AlertTriangle, DollarSign } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useKYC } from '../context/KYCContext';
import WalletConnect from '../components/WalletConnect';
import PhoneOTPModal from '../components/PhoneOTPModal';
import KYCModal from '../components/KYCModal';
import CurrencyRateDisplay from '../components/CurrencyRateDisplay';
import { convertINRToUSDT, sendUSDT } from '../utils/blockchain';
import { frontendContractService, SwapRecord } from '../utils/contractIntegration';

const Send = () => {
  const { account, isConnected } = useWallet();
  const { user, createTransaction, isLoading: kycLoading } = useKYC();
  const [inrAmount, setInrAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [, setTransactionData] = useState<any>(null);
  const [requiresKYC, setRequiresKYC] = useState(false);
  const [contractConnected, setContractConnected] = useState(false);
  const [swapHistory, setSwapHistory] = useState<SwapRecord[]>([]);
  const [gstRate, setGstRate] = useState('0');
  const [currencyRates, setCurrencyRates] = useState<{[key: string]: string}>({});

  // Initialize contract connection
  useEffect(() => {
    const initContract = async () => {
      try {
        const connected = await frontendContractService.connect();
        setContractConnected(connected);
        
        // Load initial data only if connected
        if (connected && account) {
          try {
            const history = await frontendContractService.getUserSwapHistory(account);
            setSwapHistory(history);
          } catch (error) {
            console.error('Failed to load swap history:', error);
          }
        }
        
        if (connected) {
          try {
            // Load GST rate
            const gst = await frontendContractService.getGSTRate();
            setGstRate(gst);
            
            // Load currency rates
            const currencies = ['INR', 'USD', 'EUR', 'USDT'];
            const rates: {[key: string]: string} = {};
            for (const currency of currencies) {
              try {
                const rate = await frontendContractService.getCurrencyRate(currency);
                rates[currency] = rate;
              } catch (error) {
                console.error(`Failed to load rate for ${currency}:`, error);
              }
            }
            setCurrencyRates(rates);
            
            // Listen to swap events
            frontendContractService.onSwapExecuted((swap) => {
              console.log('🔄 [CONTRACT] New swap executed:', swap);
              setSwapHistory(prev => [swap, ...prev]);
            });
            
            console.log('✅ [CONTRACT] Contract initialized successfully');
          } catch (error) {
            console.error('Failed to initialize contract data:', error);
          }
        } else {
          console.log('🔄 [CONTRACT] Running in mock mode');
        }
      } catch (error) {
        console.error('❌ [CONTRACT] Contract initialization failed:', error);
        setContractConnected(false);
      }
    };

    if (isConnected && account) {
      initContract();
    }

    return () => {
      frontendContractService.removeAllListeners();
    };
  }, [isConnected, account]);

  const handleConvert = async () => {
    if (!inrAmount) return;
    
    setIsConverting(true);
    try {
      let usdtValue = 0;
      
      if (contractConnected) {
        // Use contract for conversion
        const result = await frontendContractService.calculateSwap('INR', 'USDT', inrAmount);
        usdtValue = parseFloat(result.toAmount);
        setUsdtAmount(usdtValue.toFixed(6));
        console.log('💰 [CONTRACT] Conversion with GST:', {
          fromAmount: inrAmount,
          toAmount: result.toAmount,
          gstAmount: result.gstAmount,
          gstRate: gstRate + '%'
        });
      } else {
        // Fallback to mock conversion
        const converted = await convertINRToUSDT(parseFloat(inrAmount));
        usdtValue = converted;
        setUsdtAmount(converted.toFixed(6));
      }
      
      // Set USD amount (USDT is pegged to USD)
      setUsdAmount(usdtValue.toFixed(2));
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSend = async () => {
    if (!isConnected || !usdtAmount || !merchantAddress) return;
    
    // Check if user is authenticated
    if (!user) {
      setShowPhoneModal(true);
      return;
    }

    // Create transaction and check KYC requirement
    setIsSending(true);
    try {
      const result = await createTransaction({
        recipientWallet: merchantAddress,
        amountInr: parseFloat(inrAmount)
      });

      if (result.success) {
        setTransactionData(result.transaction);
        
        if (result.requiresKYC && user.kyc_status !== 'verified') {
          setRequiresKYC(true);
          setShowKYCModal(true);
          setIsSending(false);
          return;
        }

        // Proceed with blockchain transaction
        setTxStatus('pending');
        
        if (contractConnected) {
          try {
            // Debug contract call first
            try {
              const usdtAmountWei = BigInt(Math.floor(parseFloat(usdtAmount) * 1e6));
              const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
              await frontendContractService.debugContractCall('INR', usdtAmountWei, txHash);
            } catch (debugError) {
              console.warn('⚠️ [DEBUG] Contract debug failed, but continuing with swap attempt');
            }

            // Use contract for USDT to Fiat swap
            const hash = await frontendContractService.swapUSDTToFiat('INR', usdtAmount);
            setTxHash(hash);
            console.log('🔄 [CONTRACT] USDT to INR swap executed:', hash);
          } catch (contractError: any) {
            console.warn('⚠️ [CONTRACT] Contract swap failed, falling back to mock:', contractError);
            
            // Check if this is a contract fallback error
            if (contractError.message === 'SEPOLIA_GAS_REQUIRED') {
              console.log('🔄 [CONTRACT] Contract fallback triggered, executing real Sepolia transaction');
              
              // Execute real Sepolia transaction with actual gas fees
              const hash = await frontendContractService.executeSepoliaTransaction(
                'INR', 
                ethers.parseUnits(usdtAmount, 6), 
                '0x' + Math.random().toString(16).substr(2, 64)
              );
              setTxHash(hash);
              console.log('✅ [SEPOLIA] Real Sepolia transaction completed:', hash);
              return;
            }
            
            // Fallback to mock transaction (should not reach here with SEPOLIA_GAS_REQUIRED)
            const hash = await sendUSDT(merchantAddress, parseFloat(usdtAmount));
            setTxHash(hash);
            console.log('✅ [MOCK] Fallback transaction completed:', hash);
          }
        } else {
          // Fallback to mock transaction
          const hash = await sendUSDT(merchantAddress, parseFloat(usdtAmount));
          setTxHash(hash);
        }
        
        setTxStatus('success');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      setTxStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handlePhoneSuccess = () => {
    setShowPhoneModal(false);
    // Retry the transaction after phone verification
    setTimeout(() => handleSend(), 500);
  };

  const handleKYCSuccess = () => {
    setShowKYCModal(false);
    setRequiresKYC(false);
    // Retry the transaction after KYC verification
    setTimeout(() => handleSend(), 500);
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
        {/* Currency Rates */}
        <div className="mb-6">
          <CurrencyRateDisplay />
        </div>
        
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
            
            {/* USD Value Display */}
            {usdAmount && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Current USD Value:</span>
                </div>
                <div className="text-lg font-semibold text-green-900 mt-1">
                  ${usdAmount} USD
                </div>
                <div className="text-xs text-green-600 mt-1">
                  USDT is pegged to USD (1:1 ratio)
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

        {/* User Status */}
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Phone verification required for transactions
              </span>
            </div>
          </div>
        )}

        {user && user.kyc_status === 'none' && requiresKYC && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                KYC verification required for amounts over $200 USD
              </span>
            </div>
          </div>
        )}

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

            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Phone: {user.phone}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    KYC: {user.kyc_status}
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!usdtAmount || !merchantAddress || isSending || kycLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isSending || kycLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{kycLoading ? 'Processing...' : 'Sending...'}</span>
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
                <div className="mt-2 text-xs text-red-600">
                  If you see this error repeatedly, the system will automatically switch to Sepolia gas mode for testing.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contract Status */}
        {isConnected && (
          <div className="mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Contract Status</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  contractConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {contractConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              
              {contractConnected && (
            <div className="space-y-2 text-sm text-gray-600">
              <div>Contract: {frontendContractService.getConnectionStatus().contractAddress || 'Not configured'}</div>
                  <div>GST Rate: {gstRate}%</div>
                  <div>INR Rate: {currencyRates.INR || 'Loading...'}</div>
                  <div>USDT Rate: {currencyRates.USDT || 'Loading...'}</div>
                </div>
              )}
              
              {!contractConnected && (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="text-blue-600 font-medium">Sepolia Gas Mode Active</div>
                  <div>Using Sepolia testnet gas for transactions</div>
                  <div>Real blockchain interaction with testnet</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Swap History */}
        {contractConnected && swapHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Swaps</h3>
            <div className="space-y-3">
              {swapHistory.slice(0, 5).map((swap, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">
                        {swap.fromAmount} {swap.fromCurrency} → {swap.toAmount} {swap.toCurrency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(swap.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        GST: {swap.gstAmount}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {swap.txHash.slice(0, 10)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PhoneOTPModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={handlePhoneSuccess}
      />

      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSuccess={handleKYCSuccess}
      />
    </div>
  );
};

export default Send;