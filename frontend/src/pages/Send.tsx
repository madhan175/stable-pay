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
import { paymentsAPI } from '../services/api';
import { frontendContractService, SwapRecord } from '../utils/contractIntegration';
import { Link } from 'react-router-dom';

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
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeLoading, setGasFeeLoading] = useState(false);

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

  const estimateGasFee = async () => {
    if (!isConnected || !account) return;
    
    setGasFeeLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      // Use safe fee data getter that handles networks without EIP-1559 support
      let feeData: ethers.FeeData;
      try {
        feeData = await provider.getFeeData();
      } catch (error: any) {
        // Network doesn't support EIP-1559, use legacy gas price
        const errorMsg = error?.message || String(error);
        const isEIP1559Error = errorMsg.includes('maxPriorityFeePerGas') || errorMsg.includes('-32601');
        if (isEIP1559Error) {
          console.warn('⚠️ [GAS] Network doesn\'t support EIP-1559, using legacy gas pricing');
        } else {
          console.warn('⚠️ [GAS] getFeeData failed, using fallback:', errorMsg);
        }
        
        // Try to get gas price from window.ethereum directly
        let gasPrice: bigint | null = null;
        try {
          if (typeof window !== 'undefined' && window.ethereum) {
            const gasPriceHex = await window.ethereum.request({ method: 'eth_gasPrice' });
            if (gasPriceHex && typeof gasPriceHex === 'string') {
              gasPrice = BigInt(gasPriceHex);
            }
          }
        } catch {
          // Try provider.send as fallback
          try {
            if ('send' in provider && typeof (provider as any).send === 'function') {
              const result = await (provider as any).send('eth_gasPrice', []);
              if (result) {
                gasPrice = typeof result === 'string' ? BigInt(result) : BigInt(result);
              }
            }
          } catch {
            // Ignore
          }
        }
        
        feeData = {
          gasPrice: gasPrice || ethers.parseUnits('20', 'gwei'),
          maxFeePerGas: null,
          maxPriorityFeePerGas: null,
          toJSON: () => ({})
        } as ethers.FeeData;
      }
      const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
      
      // Estimate gas for a simple transaction (21000 gas units)
      const gasLimit = 21000n;
      const estimatedFee = gasLimit * gasPrice;
      const feeInETH = ethers.formatEther(estimatedFee);
      
      setGasFee(feeInETH);
      console.log('⛽ [GAS] Estimated gas fee:', feeInETH, 'ETH');
    } catch (error) {
      console.error('Failed to estimate gas fee:', error);
      setGasFee('0.001'); // Fallback estimate
    } finally {
      setGasFeeLoading(false);
    }
  };

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
      
      // Estimate gas fee when conversion is complete
      await estimateGasFee();
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

        // Proceed with blockchain transaction - Direct P2P USDT transfer
        setTxStatus('pending');
        
        try {
          // Direct USDT transfer (P2P between wallets)
          console.log('🔄 [P2P] Initiating USDT transfer:', {
            from: account,
            to: merchantAddress,
            amount: usdtAmount
          });
          
          const txResult = await sendUSDT(merchantAddress, parseFloat(usdtAmount));
          setTxHash(txResult.hash);
          console.log('✅ [P2P] USDT transfer completed:', txResult.hash);
          
          // Save transaction to backend with gas information
          try {
            await paymentsAPI.save({
              txHash: txResult.hash,
              sender: account!,
              receiver: merchantAddress,
              amount: usdtAmount,
              timestamp: new Date().toISOString(),
              gasUsed: txResult.gasUsed,
              blockNumber: txResult.blockNumber,
            });
            console.log('✅ [P2P] Transaction saved to backend with gas info');
          } catch (e) { 
            console.warn('⚠️ Save payment failed:', e); 
          }
          
          setTxStatus('success');
        } catch (transferError: any) {
          console.error('❌ [P2P] Transfer failed:', transferError);
          setTxStatus('error');
          
          // Show user-friendly error message
          if (transferError.message?.includes('Insufficient')) {
            alert('Insufficient USDT balance. Please ensure you have enough USDT in your wallet.');
          } else if (transferError.message?.includes('user rejected')) {
            alert('Transaction cancelled by user.');
          } else {
            alert(`Transfer failed: ${transferError.message || 'Unknown error'}`);
          }
        }
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
    <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12 lg:py-16">
      <div className="text-center mb-6 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Send Payment
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600">
          Convert INR to USDT and send to merchant wallet
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        {/* Currency Rates */}
        <div className="mb-6">
          <CurrencyRateDisplay />
        </div>
        
        {/* INR Input */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Amount in INR
          </label>
          <div className="relative">
            <span className="absolute left-3 sm:left-4 top-3.5 sm:top-4 text-gray-500 font-medium text-sm sm:text-base">₹</span>
            <input
              type="number"
              value={inrAmount}
              onChange={(e) => setInrAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 sm:pl-10 pr-4 py-3 sm:py-4 text-lg sm:text-xl font-semibold border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* Conversion Arrow */}
        {inrAmount && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2.5 sm:p-3 rounded-full">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white transform rotate-90" />
            </div>
          </div>
        )}

        {/* USDT Output */}
        {usdtAmount && (
          <div className="mb-6 sm:mb-8">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Equivalent USDT
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-3.5 sm:top-4 text-gray-500 font-medium text-sm sm:text-base">$</span>
              <input
                type="text"
                value={usdtAmount}
                readOnly
                className="w-full pl-8 sm:pl-10 pr-12 sm:pr-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl"
              />
              {isConverting && (
                <RefreshCw className="absolute right-3 sm:right-4 top-3.5 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-spin" />
              )}
            </div>
            
            {/* USD Value Display */}
            {usdAmount && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-green-800">Current USD Value:</span>
                </div>
                <div className="text-base sm:text-lg font-semibold text-green-900 mt-1">
                  ${usdAmount} USD
                </div>
                <div className="text-xs text-green-600 mt-1">
                  USDT is pegged to USD (1:1 ratio)
                </div>
              </div>
            )}
            
            {/* Gas Fee Display */}
            {gasFee && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">⛽</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-blue-800">Estimated Gas Fee:</span>
                  </div>
                  {gasFeeLoading ? (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-blue-900 whitespace-nowrap">
                      {parseFloat(gasFee).toFixed(6)} ETH
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Network fee for transaction execution
                </div>
              </div>
            )}
          </div>
        )}

        {/* Merchant Address */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Merchant Wallet Address
          </label>
          <input
            type="text"
            value={merchantAddress}
            onChange={(e) => setMerchantAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-0 outline-none transition-colors duration-200"
          />
        </div>

        {/* User Status */}
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-yellow-800">
                Phone verification required for transactions
              </span>
            </div>
          </div>
        )}

        {/* Gas Fee Warning */}
        {gasFee && parseFloat(gasFee) > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">⛽</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-orange-800">
                Gas Fee Required: {parseFloat(gasFee).toFixed(6)} ETH
              </span>
            </div>
            <div className="text-xs text-orange-600 mt-1">
              You need Sepolia ETH in your wallet to pay for transaction fees
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
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 touch-manipulation"
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
                <div className="mt-3">
                  <Link
                    to="/receive"
                    className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                  >
                    View Dashboard
                  </Link>
                </div>
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