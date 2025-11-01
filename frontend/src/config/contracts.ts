import { ethers } from 'ethers';

// Contract addresses from deployment.json (deployed on Sepolia)
// USDT address can be set via VITE_USDT_ADDRESS env variable or uses default
const ENV_USDT_ADDRESS = (import.meta as any)?.env?.VITE_USDT_ADDRESS || '';
const DEFAULT_USDT_ADDRESS = '0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD'; // From deployment.json

// Helper function to ensure addresses are properly checksummed
const getChecksummedAddress = (address: string): string => {
  if (!address) return address;
  try {
    return ethers.getAddress(address.toLowerCase());
  } catch (error) {
    console.warn('Failed to checksum address:', address, error);
    return address;
  }
};

export const CONTRACT_ADDRESSES = {
  swap: getChecksummedAddress('0xeAB6f03ad3C23224d50e15a9F0A2024004d53408'), // Fixed calculation contract
  usdt: getChecksummedAddress(ENV_USDT_ADDRESS || DEFAULT_USDT_ADDRESS), // Use env variable or default deployed address
};

// USDT ABI
export const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function mint(address to, uint256 amount) external', // MockUSDT mint function
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Swap Contract ABI
export const SWAP_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_usdt", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
    "name": "GST_RATE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
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
  }
];

// Network configuration
export const NETWORK_CONFIG = {
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545'
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org'
  }
};

// Ensure correct network is connected
export const ensureCorrectNetwork = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    // Check if we're on Sepolia (where contracts are deployed) or localhost
    if (network.chainId === 11155111n) {
      console.log('✅ Connected to Sepolia testnet - contracts available');
      return;
    } else if (network.chainId === 31337n) {
      console.log('⚠️ Connected to localhost network - contracts not deployed here');
      console.log('🔄 Please switch to Sepolia testnet for contract interaction');
      return;
    } else {
      // Try to switch to Sepolia first (where contracts are deployed)
      console.log('🔄 Switching to Sepolia testnet...');
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID (11155111)
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Sepolia not added, add it
          console.log('➕ Adding Sepolia testnet...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7', // 11155111 in hex
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (error: any) {
    console.warn('⚠️ Network switch failed, continuing with current network:', error.message);
    // Don't throw error, just continue with current network
  }
};