const { ethers } = require('ethers');

// Contract configuration - ensure addresses are properly checksummed
const getChecksummedAddress = (address) => {
  if (!address) return address;
  try {
    return ethers.getAddress(address.toLowerCase());
  } catch (error) {
    console.warn('Failed to checksum address:', address, error);
    return address;
  }
};

const RAW_CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xeAB6f03ad3C23224d50e15a9F0A2024004d53408';
const RAW_USDT_ADDRESS = process.env.USDT_ADDRESS || '0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD';

const CONTRACT_ADDRESS = getChecksummedAddress(RAW_CONTRACT_ADDRESS); // From deployment.json
const USDT_ADDRESS = getChecksummedAddress(RAW_USDT_ADDRESS); // From deployment.json (properly checksummed)

// Contract ABI (same as frontend)
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
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Backend Contract Service (Provider + Private Key)
class BackendContractService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.wallet = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Use environment variables for RPC URL and private key
      const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key';
      const privateKey = process.env.ADMIN_PRIVATE_KEY;

      if (!privateKey) {
        throw new Error('ADMIN_PRIVATE_KEY not found in environment variables');
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);

      this.isConnected = true;
      console.log('🔗 [BACKEND] Contract connected via provider');
      console.log('👤 [BACKEND] Admin wallet:', this.wallet.address);
      
      return true;
    } catch (error) {
      console.error('❌ [BACKEND] Contract connection failed:', error);
      throw error;
    }
  }

  async getContract() {
    if (!this.contract) {
      await this.connect();
    }
    return this.contract;
  }

  async getWallet() {
    if (!this.wallet) {
      await this.connect();
    }
    return this.wallet;
  }

  // Calculate swap amounts
  async calculateSwap(fromCurrency, toCurrency, fromAmount) {
    const contract = await this.getContract();
    const fromAmountWei = ethers.parseUnits(fromAmount, 18);
    
    const result = await contract.calculateSwap(fromCurrency, toCurrency, fromAmountWei);
    
    return {
      toAmount: ethers.formatUnits(result[0], 18),
      gstAmount: ethers.formatUnits(result[1], 18)
    };
  }

  // Swap Fiat to USDT (admin function)
  async swapFiatToUSDT(userAddress, fromCurrency, fromAmount) {
    const contract = await this.getContract();
    const fromAmountWei = ethers.parseUnits(fromAmount, 18);
    const txHash = ethers.keccak256(ethers.toUtf8Bytes(`${Date.now()}-${Math.random()}`));
    
    const tx = await contract.swapFiatToUSDT(userAddress, fromCurrency, fromAmountWei, txHash);
    await tx.wait();
    
    console.log('✅ [BACKEND] Fiat to USDT swap completed:', tx.hash);
    return tx.hash;
  }

  // Get user swap history
  async getUserSwapHistory(userAddress) {
    const contract = await this.getContract();
    const history = await contract.getUserSwapHistory(userAddress);
    
    return history.map(record => ({
      user: record.user,
      fromCurrency: record.fromCurrency,
      toCurrency: record.toCurrency,
      fromAmount: ethers.formatUnits(record.fromAmount, 18),
      toAmount: ethers.formatUnits(record.toAmount, 18),
      gstAmount: ethers.formatUnits(record.gstAmount, 18),
      timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
      txHash: record.txHash
    }));
  }

  // Get recent swaps
  async getRecentSwaps() {
    const contract = await this.getContract();
    const swaps = await contract.getRecentSwaps();
    
    return swaps.map(swap => ({
      user: swap.user,
      fromCurrency: swap.fromCurrency,
      toCurrency: swap.toCurrency,
      fromAmount: ethers.formatUnits(swap.fromAmount, 18),
      toAmount: ethers.formatUnits(swap.toAmount, 18),
      gstAmount: ethers.formatUnits(swap.gstAmount, 18),
      timestamp: new Date(Number(swap.timestamp) * 1000).toISOString(),
      txHash: swap.txHash
    }));
  }

  // Get currency rate
  async getCurrencyRate(currency) {
    const contract = await this.getContract();
    const rate = await contract.currencyRates(currency);
    return ethers.formatUnits(rate, 8); // Rates are scaled by 1e8
  }

  // Check if currency is supported
  async isCurrencySupported(currency) {
    const contract = await this.getContract();
    return await contract.isCurrencySupported(currency);
  }

  // Get GST rate
  async getGSTRate() {
    const contract = await this.getContract();
    const rate = await contract.GST_RATE();
    return (Number(rate) / 100).toString(); // Convert from basis points to percentage
  }

  // Update currency rate (admin function)
  async updateCurrency(currency, rate, supported) {
    const contract = await this.getContract();
    const rateWei = ethers.parseUnits(rate, 8); // Rates are scaled by 1e8
    
    const tx = await contract.updateCurrency(currency, rateWei, supported);
    await tx.wait();
    
    console.log('✅ [BACKEND] Currency updated:', { currency, rate, supported });
    return tx.hash;
  }

  // Get admin address
  async getAdminAddress() {
    const contract = await this.getContract();
    return await contract.admin();
  }

  // Listen to swap events
  onSwapExecuted(callback) {
    if (!this.contract) return;
    
    this.contract.on('SwapExecuted', (user, fromCurrency, toCurrency, fromAmount, toAmount, gstAmount, txHash) => {
      const swap = {
        user,
        fromCurrency,
        toCurrency,
        fromAmount: ethers.formatUnits(fromAmount, 18),
        toAmount: ethers.formatUnits(toAmount, 18),
        gstAmount: ethers.formatUnits(gstAmount, 18),
        timestamp: new Date().toISOString(),
        txHash
      };
      callback(swap);
    });
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Export singleton instance
module.exports = new BackendContractService();
