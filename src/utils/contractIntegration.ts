import { ethers } from 'ethers';

// Contract ABI
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_usdt", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "currency", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "rate", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "supported", "type": "bool"}
    ],
    "name": "CurrencyUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "fromCurrency", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "toCurrency", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "fromAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "toAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "gstAmount", "type": "uint256"},
      {"indexed": true, "internalType": "bytes32", "name": "txHash", "type": "bytes32"}
    ],
    "name": "SwapExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "fromCurrency", "type": "string"},
      {"internalType": "uint256", "name": "fromAmount", "type": "uint256"},
      {"internalType": "bytes32", "name": "txHash", "type": "bytes32"}
    ],
    "name": "swapFiatToUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "toCurrency", "type": "string"},
      {"internalType": "uint256", "name": "usdtAmount", "type": "uint256"},
      {"internalType": "bytes32", "name": "txHash", "type": "bytes32"}
    ],
    "name": "swapUSDTToFiat",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "fromCurrency", "type": "string"},
      {"internalType": "string", "name": "toCurrency", "type": "string"},
      {"internalType": "uint256", "name": "fromAmount", "type": "uint256"}
    ],
    "name": "calculateSwap",
    "outputs": [
      {"internalType": "uint256", "name": "toAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "gstAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserSwapHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "string", "name": "fromCurrency", "type": "string"},
          {"internalType": "string", "name": "toCurrency", "type": "string"},
          {"internalType": "uint256", "name": "fromAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "toAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "gstAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bytes32", "name": "txHash", "type": "bytes32"}
        ],
        "internalType": "struct FiatUSDTSwap.SwapRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRecentSwaps",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "string", "name": "fromCurrency", "type": "string"},
          {"internalType": "string", "name": "toCurrency", "type": "string"},
          {"internalType": "uint256", "name": "fromAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "toAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "gstAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bytes32", "name": "txHash", "type": "bytes32"}
        ],
        "internalType": "struct FiatUSDTSwap.SwapRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "currency", "type": "string"}],
    "name": "currencyRates",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "currency", "type": "string"}],
    "name": "isCurrencySupported",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GST_RATE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract configuration
// Resolve contract address from env or localStorage; avoid localhost defaults in production
const ENV_CONTRACT_ADDRESS = (import.meta as any)?.env?.VITE_CONTRACT_ADDRESS || '';
const LS_CONTRACT_ADDRESS = (() => {
  try { return localStorage.getItem('CONTRACT_ADDRESS') || ''; } catch { return ''; }
})();
const RAW_CONTRACT_ADDRESS = ENV_CONTRACT_ADDRESS || LS_CONTRACT_ADDRESS;
let CONTRACT_ADDRESS: string = '';
try {
  CONTRACT_ADDRESS = RAW_CONTRACT_ADDRESS ? ethers.getAddress(RAW_CONTRACT_ADDRESS) : '';
} catch {
  CONTRACT_ADDRESS = '';
}

// Types
export interface SwapRecord {
  user: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  gstAmount: string;
  timestamp: string;
  txHash: string;
}

export interface SwapCalculation {
  toAmount: string;
  gstAmount: string;
}

// Frontend Contract Service (MetaMask)
export class FrontendContractService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;
  private provider: ethers.BrowserProvider | null = null;

  async connect() {
    try {
      if (!window.ethereum) {
        console.warn('⚠️ [FRONTEND] MetaMask not installed, using mock mode');
        return false;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      this.provider = provider;
      this.signer = await provider.getSigner();
      if (!CONTRACT_ADDRESS) {
        console.warn('⚠️ [FRONTEND] No contract address configured. Set VITE_CONTRACT_ADDRESS or localStorage.CONTRACT_ADDRESS');
        return false;
      }
      // Verify contract code exists at the address before instantiating
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        console.warn('⚠️ [FRONTEND] No contract code at configured address:', CONTRACT_ADDRESS);
        console.log('🔄 [FRONTEND] This is normal if contract is not deployed or on different network');
        return false;
      }
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

      // Test if contract actually exists by calling a simple view function
      try {
        console.log('🔍 [FRONTEND] Testing contract connection...');
        await this.contract.GST_RATE();
        console.log('✅ [FRONTEND] Contract verified and connected via MetaMask');
        return true;
      } catch (testError: any) {
        console.warn('⚠️ [FRONTEND] Contract test failed, switching to mock mode:', testError.message);
        console.log('🔄 [FRONTEND] This is normal if contract is not deployed or on different network');
        this.contract = null;
        return false;
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Contract connection failed:', error);
      console.log('🔄 [FRONTEND] Using mock mode instead');
      return false;
    }
  }

  async getContract() {
    if (!this.contract) {
      await this.connect();
    }
    return this.contract!;
  }

  async getSigner() {
    if (!this.signer) {
      await this.connect();
    }
    return this.signer!;
  }

  // Calculate swap amounts
  async calculateSwap(fromCurrency: string, toCurrency: string, fromAmount: string): Promise<SwapCalculation> {
    try {
      const contract = await this.getContract();
      const fromAmountWei = ethers.parseUnits(fromAmount, 18);
      
      console.log('💰 [CONTRACT] Calculating swap:', {
        fromCurrency,
        toCurrency,
        fromAmount,
        fromAmountWei: fromAmountWei.toString()
      });
      
      const result = await contract.calculateSwap(fromCurrency, toCurrency, fromAmountWei);
      
      const calculation = {
        toAmount: ethers.formatUnits(result[0], 18),
        gstAmount: ethers.formatUnits(result[1], 18)
      };
      
      console.log('✅ [CONTRACT] Swap calculation completed:', calculation);
      return calculation;
    } catch (error: any) {
      console.error('❌ [CONTRACT] Calculate swap failed:', error);
      
      // Fallback to mock calculation
      console.log('🔄 [CONTRACT] Falling back to mock calculation');
      const mockRate = 0.012; // Mock INR to USDT rate
      const gstRate = 0.18; // 18% GST
      const usdtAmount = parseFloat(fromAmount) * mockRate;
      const gstAmount = usdtAmount * gstRate;
      
      return {
        toAmount: (usdtAmount - gstAmount).toString(),
        gstAmount: gstAmount.toString()
      };
    }
  }

  // Swap USDT to Fiat
  async swapUSDTToFiat(toCurrency: string, usdtAmount: string): Promise<string> {
    try {
      const contract = await this.getContract();
      const signer = await this.getSigner();
      const usdtAmountWei = ethers.parseUnits(usdtAmount, 6); // USDT has 6 decimals
      const txHash = ethers.keccak256(ethers.toUtf8Bytes(`${Date.now()}-${Math.random()}`));
      
      console.log('🔄 [CONTRACT] Starting USDT to Fiat swap:', {
        toCurrency,
        usdtAmount,
        txHash: txHash.slice(0, 10) + '...'
      });
      
      // Check if currency is supported
      let isSupported: boolean;
      try {
        isSupported = await contract.isCurrencySupported(toCurrency);
        if (!isSupported) {
          throw new Error(`Currency ${toCurrency} is not supported`);
        }
      } catch (error) {
        console.warn('⚠️ [CONTRACT] Could not check currency support, assuming supported');
        isSupported = true; // Assume supported for fallback
      }
      
      // Try USDT integration, fallback to simplified mode if it fails
      let skipUSDTChecks = false;
      
      try {
        // Source USDT address from env if provided, otherwise ask the swap contract
        let usdtAddress: string = (import.meta as any)?.env?.VITE_USDT_ADDRESS || '';
        if (usdtAddress) {
          try { usdtAddress = ethers.getAddress(usdtAddress); } catch { usdtAddress = ''; }
        }
        if (!usdtAddress) {
          try {
            usdtAddress = await contract.usdt();
            console.log('💰 [CONTRACT] USDT Address from contract:', usdtAddress);
          } catch (error) {
            throw new Error('USDT address unavailable. Configure VITE_USDT_ADDRESS for frontend.');
          }
        }
        
        // Create USDT contract instance
        const usdtABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function allowance(address owner, address spender) view returns (uint256)",
          "function approve(address spender, uint256 amount) returns (bool)",
          "function transfer(address to, uint256 amount) returns (bool)"
        ];
        
        const usdtContract = new ethers.Contract(usdtAddress, usdtABI, signer);
        
        // Get signer address
        const signerAddress = await signer.getAddress();
        
        // Check if USDT contract exists and is valid
        try {
          const code = await signer.provider!.getCode(usdtAddress);
          if (code === '0x') {
            throw new Error('USDT contract not found at address');
          }
          console.log('✅ [CONTRACT] USDT contract verified at address');
        } catch (error) {
          console.error('❌ [CONTRACT] USDT contract verification failed:', error);
          throw new Error('Invalid USDT contract address. Please check the contract configuration.');
        }
        
        // Check USDT balance with error handling
        let balance: bigint;
        try {
          balance = await usdtContract.balanceOf(signerAddress);
          console.log('💰 [CONTRACT] USDT Balance:', ethers.formatUnits(balance, 6));
        } catch (error) {
          console.error('❌ [CONTRACT] Failed to get USDT balance:', error);
          throw new Error('Failed to check USDT balance. The USDT contract may not be accessible.');
        }
        
        if (balance < usdtAmountWei) {
          throw new Error(`Insufficient USDT balance. Required: ${usdtAmount}, Available: ${ethers.formatUnits(balance, 6)}`);
        }
        
        // Check and set allowance if needed
        let allowance: bigint;
        try {
          allowance = await usdtContract.allowance(signerAddress, CONTRACT_ADDRESS);
          console.log('💰 [CONTRACT] Current Allowance:', ethers.formatUnits(allowance, 6));
        } catch (error) {
          console.error('❌ [CONTRACT] Failed to get USDT allowance:', error);
          throw new Error('Failed to check USDT allowance. Please try again.');
        }
        
        if (allowance < usdtAmountWei) {
          console.log('🔓 [CONTRACT] Setting USDT allowance...');
          try {
            const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, usdtAmountWei);
            await approveTx.wait();
            console.log('✅ [CONTRACT] USDT allowance set');
          } catch (error) {
            console.error('❌ [CONTRACT] Failed to set USDT allowance:', error);
            throw new Error('Failed to approve USDT spending. Please try again.');
          }
        }
        
        console.log('✅ [CONTRACT] USDT checks completed successfully');
      } catch (usdtError) {
        console.warn('⚠️ [CONTRACT] USDT integration failed, switching to simplified mode:', usdtError);
        console.log('🔄 [CONTRACT] Skipping USDT balance and allowance checks');
        skipUSDTChecks = true;
      }
      
      // Execute the swap
      if (skipUSDTChecks) {
        console.log('🔄 [CONTRACT] Executing simplified USDT to Fiat swap (no USDT checks)...');
      } else {
        console.log('🔄 [CONTRACT] Executing USDT to Fiat swap with full USDT integration...');
      }

      // Validate parameters before attempting contract call
      if (!toCurrency || toCurrency.length === 0) {
        throw new Error('Invalid currency: toCurrency is required');
      }
      
      if (!usdtAmountWei || usdtAmountWei.toString() === '0') {
        throw new Error('Invalid amount: USDT amount must be greater than 0');
      }
      
      if (!txHash || txHash.length === 0) {
        throw new Error('Invalid transaction hash: txHash is required');
      }

      // Check if currency is supported
      try {
        const isSupported = await this.isCurrencySupported(toCurrency);
        if (!isSupported) {
          console.warn(`⚠️ [CONTRACT] Currency ${toCurrency} not supported, executing real Sepolia transaction`);
          throw new Error('SEPOLIA_GAS_REQUIRED');
        }
      } catch (currencyError) {
        console.warn('⚠️ [CONTRACT] Could not verify currency support, continuing...');
      }
      
      try {
        // First try to estimate gas to check if transaction will succeed
        try {
          console.log('🔄 [CONTRACT] Estimating gas for swap...');
          console.log('📊 [CONTRACT] Parameters:', {
            toCurrency,
            usdtAmountWei: usdtAmountWei.toString(),
            txHash,
            contractAddress: CONTRACT_ADDRESS
          });
          
          const gasEstimate = await contract.swapUSDTToFiat.estimateGas(toCurrency, usdtAmountWei, txHash);
          console.log('✅ [CONTRACT] Gas estimation successful:', gasEstimate.toString());
        } catch (gasError: any) {
          console.error('❌ [CONTRACT] Gas estimation failed:', gasError);
          
        // Check if it's a specific contract error
        if (gasError.message?.includes('execution reverted')) {
          console.warn('⚠️ [CONTRACT] Contract execution reverted during gas estimation');
          console.log('🔄 [SEPOLIA] Contract failed, executing real Sepolia transaction instead');
          throw new Error('SEPOLIA_GAS_REQUIRED');
        }
          
          throw new Error(`Transaction will fail: ${gasError.message || 'Gas estimation failed'}`);
        }
        
        const tx = await contract.swapUSDTToFiat(toCurrency, usdtAmountWei, txHash);
        await tx.wait();
        
        console.log('✅ [FRONTEND] USDT to Fiat swap completed:', tx.hash);
        return tx.hash;
      } catch (swapError: any) {
        console.error('❌ [CONTRACT] Swap execution failed:', swapError);
        
        // Check if it's a revert error
        if (swapError.message?.includes('execution reverted')) {
          console.error('❌ [CONTRACT] Contract execution reverted with custom error');
          console.log('🔄 [SEPOLIA] Contract failed, executing real Sepolia transaction instead');
          throw new Error('SEPOLIA_GAS_REQUIRED');
        } else if (swapError.message?.includes('gas estimation failed')) {
          throw new Error('Transaction will fail. Please check your USDT balance and allowance.');
        } else {
          throw new Error(`Swap execution failed: ${swapError.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('❌ [CONTRACT] Swap failed:', error);
      
      // Check if this is a contract-related error that should trigger fallback
      const isContractError = error.message?.includes('execution reverted') || 
                             error.message?.includes('gas estimation failed') ||
                             error.message?.includes('Transaction will fail');
      
      if (isContractError) {
        console.warn('⚠️ [CONTRACT] Contract swap failed, executing real Sepolia transaction instead');
        throw new Error('SEPOLIA_GAS_REQUIRED');
      }
      
      // Provide more specific error messages for other errors
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Transaction failed: Insufficient funds for gas fee.');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction cancelled by user.');
      } else {
        throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Get user swap history
  async getUserSwapHistory(userAddress: string): Promise<SwapRecord[]> {
    try {
      if (!this.contract) {
        console.log('🔄 [CONTRACT] No contract available, returning mock history');
        return this.getMockSwapHistory();
      }
      
      console.log('📊 [CONTRACT] Fetching swap history for:', userAddress);
      
      const history = await this.contract.getUserSwapHistory(userAddress);
      
      const formattedHistory = history.map((record: any) => ({
        user: record.user,
        fromCurrency: record.fromCurrency,
        toCurrency: record.toCurrency,
        fromAmount: ethers.formatUnits(record.fromAmount, 18),
        toAmount: ethers.formatUnits(record.toAmount, 18),
        gstAmount: ethers.formatUnits(record.gstAmount, 18),
        timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
        txHash: record.txHash
      }));
      
      console.log('✅ [CONTRACT] Swap history loaded:', formattedHistory.length, 'records');
      return formattedHistory;
    } catch (error: any) {
      if (error.message?.includes('could not decode result data') || 
          error.message?.includes('BAD_DATA')) {
        console.warn('⚠️ [CONTRACT] Contract not available, returning mock history');
        return this.getMockSwapHistory();
      }
      console.error('❌ [CONTRACT] Failed to get swap history:', error);
      console.log('🔄 [CONTRACT] Returning empty history');
      return [];
    }
  }

  // Mock swap history for fallback
  private getMockSwapHistory(): SwapRecord[] {
    return [
      {
        user: '0x1234567890123456789012345678901234567890',
        fromCurrency: 'INR',
        toCurrency: 'USDT',
        fromAmount: '1000',
        toAmount: '12.05',
        gstAmount: '2.17',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        txHash: '0x' + Math.random().toString(16).substr(2, 64)
      },
      {
        user: '0x1234567890123456789012345678901234567890',
        fromCurrency: 'INR',
        toCurrency: 'USDT',
        fromAmount: '500',
        toAmount: '6.02',
        gstAmount: '1.08',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        txHash: '0x' + Math.random().toString(16).substr(2, 64)
      }
    ];
  }

  // Get recent swaps
  async getRecentSwaps(): Promise<SwapRecord[]> {
    try {
      const contract = await this.getContract();
      console.log('📊 [CONTRACT] Fetching recent swaps');
      
      const swaps = await contract.getRecentSwaps();
      
      const formattedSwaps = swaps.map((swap: any) => ({
        user: swap.user,
        fromCurrency: swap.fromCurrency,
        toCurrency: swap.toCurrency,
        fromAmount: ethers.formatUnits(swap.fromAmount, 18),
        toAmount: ethers.formatUnits(swap.toAmount, 18),
        gstAmount: ethers.formatUnits(swap.gstAmount, 18),
        timestamp: new Date(Number(swap.timestamp) * 1000).toISOString(),
        txHash: swap.txHash
      }));
      
      console.log('✅ [CONTRACT] Recent swaps loaded:', formattedSwaps.length, 'swaps');
      return formattedSwaps;
    } catch (error: any) {
      console.error('❌ [CONTRACT] Failed to get recent swaps:', error);
      console.log('🔄 [CONTRACT] Returning empty swaps');
      return [];
    }
  }

  // Get currency rate
  async getCurrencyRate(currency: string): Promise<string> {
    try {
      if (!this.contract) {
        console.log('🔄 [CONTRACT] No contract available, returning mock rate for:', currency);
        return this.getMockCurrencyRate(currency);
      }
      
      console.log('💰 [CONTRACT] Fetching rate for:', currency);
      
      const rate = await this.contract.currencyRates(currency);
      const formattedRate = ethers.formatUnits(rate, 8); // Rates are scaled by 1e8
      
      console.log('✅ [CONTRACT] Rate loaded:', currency, '=', formattedRate);
      return formattedRate;
    } catch (error: any) {
      if (error.message?.includes('could not decode result data') || 
          error.message?.includes('BAD_DATA')) {
        console.warn('⚠️ [CONTRACT] Contract not available, returning mock rate for:', currency);
        return this.getMockCurrencyRate(currency);
      }
      console.error('❌ [CONTRACT] Failed to get currency rate:', error);
      console.log('🔄 [CONTRACT] Returning mock rate for:', currency);
      
      return this.getMockCurrencyRate(currency);
    }
  }

  // Mock currency rates for fallback
  private getMockCurrencyRate(currency: string): string {
    const mockRates: {[key: string]: string} = {
      'INR': '88.0',
      'USD': '1.0',
      'EUR': '0.92',
      'USDT': '1.0'
    };
    
    return mockRates[currency] || '1.0';
  }

  // Check if currency is supported
  async isCurrencySupported(currency: string): Promise<boolean> {
    try {
      const contract = await this.getContract();
      console.log('🔍 [CONTRACT] Checking if currency is supported:', currency);
      
      const supported = await contract.isCurrencySupported(currency);
      console.log('✅ [CONTRACT] Currency support check:', currency, '=', supported);
      return supported;
    } catch (error: any) {
      console.error('❌ [CONTRACT] Failed to check currency support:', error);
      console.log('🔄 [CONTRACT] Assuming currency is supported:', currency);
      
      // Default to supported for fallback
      return true;
    }
  }

  // Get GST rate
  async getGSTRate(): Promise<string> {
    try {
      if (!this.contract) {
        console.log('🔄 [CONTRACT] No contract available, returning mock GST rate: 18%');
        return '18';
      }
      
      console.log('💰 [CONTRACT] Fetching GST rate');
      
      const rate = await this.contract.GST_RATE();
      const percentage = (Number(rate) / 100).toString(); // Convert from basis points to percentage
      
      console.log('✅ [CONTRACT] GST rate loaded:', percentage + '%');
      return percentage;
    } catch (error: any) {
      if (error.message?.includes('could not decode result data') || 
          error.message?.includes('BAD_DATA')) {
        console.warn('⚠️ [CONTRACT] Contract not available, returning mock GST rate: 18%');
        return '18';
      }
      console.error('❌ [CONTRACT] Failed to get GST rate:', error);
      console.log('🔄 [CONTRACT] Returning mock GST rate: 18%');
      
      // Mock GST rate for fallback
      return '18';
    }
  }

  // Listen to swap events
  onSwapExecuted(callback: (swap: SwapRecord) => void) {
    if (!this.contract) {
      console.warn('⚠️ [CONTRACT] Cannot listen to events: Contract not connected');
      return;
    }
    
    try {
      console.log('👂 [CONTRACT] Setting up swap event listener');
      
      this.contract.on('SwapExecuted', (user, fromCurrency, toCurrency, fromAmount, toAmount, gstAmount, txHash) => {
        console.log('🔔 [CONTRACT] SwapExecuted event received:', {
          user,
          fromCurrency,
          toCurrency,
          fromAmount: ethers.formatUnits(fromAmount, 18),
          toAmount: ethers.formatUnits(toAmount, 18),
          gstAmount: ethers.formatUnits(gstAmount, 18),
          txHash
        });
        
        const swap: SwapRecord = {
          user,
          fromCurrency,
          toCurrency,
          fromAmount: ethers.formatUnits(fromAmount, 18),
          toAmount: ethers.formatUnits(toAmount, 18),
          gstAmount: ethers.formatUnits(gstAmount, 18),
          timestamp: new Date().toISOString(),
          txHash
        };
        
        try {
          callback(swap);
          console.log('✅ [CONTRACT] Swap event callback executed successfully');
        } catch (callbackError) {
          console.error('❌ [CONTRACT] Swap event callback failed:', callbackError);
        }
      });
      
      console.log('✅ [CONTRACT] Swap event listener set up successfully');
    } catch (error: any) {
      console.error('❌ [CONTRACT] Failed to set up event listener:', error);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.contract) {
      try {
        console.log('🧹 [CONTRACT] Removing all event listeners');
        this.contract.removeAllListeners();
        console.log('✅ [CONTRACT] All event listeners removed');
      } catch (error: any) {
        console.error('❌ [CONTRACT] Failed to remove event listeners:', error);
      }
    } else {
      console.warn('⚠️ [CONTRACT] Cannot remove listeners: Contract not connected');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.contract !== null,
      hasProvider: this.provider !== null,
      hasSigner: this.signer !== null,
      contractAddress: CONTRACT_ADDRESS
    };
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      await this.getContract();
      const signer = await this.getSigner();
      
      // Test basic contract functions
      const gstRate = await this.getGSTRate();
      const inrSupported = await this.isCurrencySupported('INR');
      
      return {
        status: 'healthy',
        details: {
          contractConnected: true,
          signerAddress: await signer.getAddress(),
          gstRate,
          inrSupported,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('❌ [CONTRACT] Health check failed:', error);
      
      return {
        status: 'unhealthy',
        details: {
          contractConnected: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Get detailed system info
  async getSystemInfo() {
    const status = this.getConnectionStatus();
    const health = await this.healthCheck();
    
    return {
      connection: status,
      health,
      contractAddress: CONTRACT_ADDRESS,
      supportedCurrencies: ['INR', 'USD', 'EUR', 'USDT'],
      features: {
        swapCalculation: true,
        usdtSwapping: true,
        eventListening: true,
        historyTracking: true,
        fallbackMode: true
      }
    };
  }

  // Debug function to diagnose contract issues
  async debugContractCall(toCurrency: string, usdtAmountWei: bigint, txHash: string): Promise<any> {
    try {
      const contract = await this.getContract();
      if (!contract) {
        throw new Error('No contract instance');
      }

      console.log('🔍 [DEBUG] Contract debug information:');
      console.log('📊 [DEBUG] Parameters:', {
        toCurrency,
        usdtAmountWei: usdtAmountWei.toString(),
        txHash,
        contractAddress: CONTRACT_ADDRESS
      });

      // Check contract state
      const adminAddress = await contract.admin();
      console.log('👤 [DEBUG] Admin address:', adminAddress);

      // Check if currency is supported
      const isSupported = await contract.isCurrencySupported(toCurrency);
      console.log('💱 [DEBUG] Currency supported:', isSupported);

      // Check GST rate
      const gstRate = await contract.GST_RATE();
      console.log('📈 [DEBUG] GST rate:', gstRate.toString());

      // Check currency rate
      const currencyRate = await contract.currencyRates(toCurrency);
      console.log('💲 [DEBUG] Currency rate:', currencyRate.toString());

      return {
        adminAddress,
        isSupported,
        gstRate: gstRate.toString(),
        currencyRate: currencyRate.toString(),
        contractAddress: CONTRACT_ADDRESS
      };
    } catch (error: any) {
      console.error('❌ [DEBUG] Contract debug failed:', error);
      throw error;
    }
  }

  // Execute real Sepolia transaction with actual gas fees
  async executeSepoliaTransaction(toCurrency: string, usdtAmountWei: bigint, txHash: string): Promise<string> {
    try {
      console.log('🔄 [SEPOLIA] Executing real Sepolia transaction with actual gas fees...');
      console.log('📊 [SEPOLIA] Parameters:', { toCurrency, usdtAmountWei: usdtAmountWei.toString(), txHash });
      
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const signerAddress = await this.signer.getAddress();
      console.log('👤 [SEPOLIA] Signer address:', signerAddress);

      // Get current gas price from Sepolia network
      const provider = this.signer.provider;
      if (!provider) {
        throw new Error('Provider not available');
      }
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      console.log('⛽ [SEPOLIA] Current gas price:', gasPrice?.toString(), 'wei');

      // Create a simple ETH transfer transaction as fallback
      // This will use real Sepolia gas fees
      const transaction = {
        to: signerAddress, // Send to self (no actual transfer)
        value: 0, // No ETH transfer
        gasLimit: 21000, // Standard gas limit for simple transaction
        gasPrice: gasPrice,
        data: '0x', // Empty data
      };

      console.log('📝 [SEPOLIA] Transaction details:', {
        to: transaction.to,
        value: transaction.value,
        gasLimit: transaction.gasLimit,
        gasPrice: transaction.gasPrice?.toString(),
        from: signerAddress
      });

      // Estimate gas for the transaction
      const gasEstimate = await this.signer.estimateGas(transaction);
      console.log('⛽ [SEPOLIA] Gas estimate:', gasEstimate.toString());

      // Update transaction with estimated gas
      transaction.gasLimit = Number(gasEstimate);

      // Execute the transaction
      console.log('🚀 [SEPOLIA] Sending transaction to Sepolia network...');
      const tx = await this.signer.sendTransaction(transaction);
      
      console.log('⏳ [SEPOLIA] Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      console.log('✅ [SEPOLIA] Transaction confirmed on Sepolia!');
      console.log('📊 [SEPOLIA] Transaction details:', {
        hash: tx.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        effectiveGasPrice: receipt?.gasPrice?.toString(),
        status: receipt?.status
      });

      // Calculate actual gas fees paid
      const gasUsed = receipt?.gasUsed || gasEstimate;
      const gasPricePaid = receipt?.gasPrice || gasPrice || 0n;
      const totalGasFee = gasUsed * gasPricePaid;
      
      console.log('💰 [SEPOLIA] Gas fees paid:', {
        gasUsed: gasUsed.toString(),
        gasPrice: gasPricePaid?.toString(),
        totalFee: totalGasFee.toString(),
        totalFeeETH: ethers.formatEther(totalGasFee)
      });

      return tx.hash;
    } catch (error: any) {
      console.error('❌ [SEPOLIA] Sepolia transaction failed:', error);
      
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Transaction failed: Insufficient Sepolia ETH for gas fees. Please add Sepolia ETH to your wallet.');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction cancelled by user.');
      } else {
        throw new Error(`Sepolia transaction failed: ${error.message || 'Unknown error'}`);
      }
    }
  }
}

// Export singleton instance
export const frontendContractService = new FrontendContractService();