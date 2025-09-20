import { ethers } from 'ethers';

// FiatUSDTSwap Contract ABI
const FIAT_USDT_SWAP_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_usdt", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "token", "type": "address"}
    ],
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
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
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
    "inputs": [],
    "name": "usdt",
    "outputs": [
      {"internalType": "contract IERC20", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GST_RATE",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// USDT ERC20 ABI (minimal)
const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Contract addresses on Sepolia testnet
const FIAT_USDT_SWAP_CONTRACT = '0x...'; // Replace with your deployed contract address
const USDT_CONTRACT_ADDRESS = '0x...'; // Replace with USDT contract address on Sepolia

// Sepolia network configuration
const SEPOLIA_NETWORK = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia test network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

export const switchToSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_NETWORK.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_NETWORK],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network');
      }
    } else {
      throw new Error('Failed to switch to Sepolia network');
    }
  }
};

export const getContract = (provider: ethers.BrowserProvider, withSigner = false) => {
  const contractInterface = new ethers.Interface(FIAT_USDT_SWAP_ABI);
  
  if (withSigner) {
    const signer = provider.getSigner();
    return new ethers.Contract(FIAT_USDT_SWAP_CONTRACT, contractInterface, signer);
  }
  
  return new ethers.Contract(FIAT_USDT_SWAP_CONTRACT, contractInterface, provider);
};

export const getUSDTContract = (provider: ethers.BrowserProvider, withSigner = false) => {
  const contractInterface = new ethers.Interface(USDT_ABI);
  
  if (withSigner) {
    const signer = provider.getSigner();
    return new ethers.Contract(USDT_CONTRACT_ADDRESS, contractInterface, signer);
  }
  
  return new ethers.Contract(USDT_CONTRACT_ADDRESS, contractInterface, provider);
};

export const convertINRToUSDT = async (inrAmount: number): Promise<{
  usdtAmount: number;
  gstAmount: number;
  totalCost: number;
}> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    // Convert INR amount to wei (assuming 18 decimals)
    const inrAmountWei = ethers.parseUnits(inrAmount.toString(), 18);

    // Call calculateSwap function
    const [toAmountWei, gstAmountWei] = await contract.calculateSwap(
      'INR',
      'USDT',
      inrAmountWei
    );

    // Convert back to readable format
    const usdtAmount = parseFloat(ethers.formatUnits(toAmountWei, 18));
    const gstAmount = parseFloat(ethers.formatUnits(gstAmountWei, 18));
    const totalCost = usdtAmount + gstAmount;

    return {
      usdtAmount,
      gstAmount,
      totalCost
    };
  } catch (error) {
    console.error('Error converting INR to USDT:', error);
    throw error;
  }
};

export const getUSDTBalance = async (address: string): Promise<number> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const usdtContract = getUSDTContract(provider);

    const balance = await usdtContract.balanceOf(address);
    return parseFloat(ethers.formatUnits(balance, 6)); // USDT has 6 decimals
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    return 0;
  }
};

export const approveUSDT = async (amount: number): Promise<string> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    await switchToSepolia();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const usdtContract = getUSDTContract(provider, true);

    const amountWei = ethers.parseUnits(amount.toString(), 6); // USDT has 6 decimals
    
    const tx = await usdtContract.approve(FIAT_USDT_SWAP_CONTRACT, amountWei);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('Error approving USDT:', error);
    throw error;
  }
};

export const swapUSDTToFiat = async (
  toCurrency: string,
  usdtAmount: number
): Promise<string> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    await switchToSepolia();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider, true);

    const usdtAmountWei = ethers.parseUnits(usdtAmount.toString(), 6); // USDT has 6 decimals
    const txHash = ethers.keccak256(ethers.toUtf8Bytes(Date.now().toString()));

    // First approve USDT spending
    await approveUSDT(usdtAmount);

    // Execute swap
    const tx = await contract.swapUSDTToFiat(toCurrency, usdtAmountWei, txHash);
    await tx.wait();

    return tx.hash;
  } catch (error) {
    console.error('Error swapping USDT to fiat:', error);
    throw error;
  }
};

export const getUserSwapHistory = async (address: string): Promise<any[]> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    const swaps = await contract.getUserSwapHistory(address);
    
    return swaps.map((swap: any) => ({
      user: swap.user,
      fromCurrency: swap.fromCurrency,
      toCurrency: swap.toCurrency,
      fromAmount: ethers.formatUnits(swap.fromAmount, 18),
      toAmount: ethers.formatUnits(swap.toAmount, 18),
      gstAmount: ethers.formatUnits(swap.gstAmount, 18),
      timestamp: Number(swap.timestamp),
      txHash: swap.txHash
    }));
  } catch (error) {
    console.error('Error getting user swap history:', error);
    return [];
  }
};

export const getRecentSwaps = async (): Promise<any[]> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    const swaps = await contract.getRecentSwaps();
    
    return swaps.map((swap: any) => ({
      user: swap.user,
      fromCurrency: swap.fromCurrency,
      toCurrency: swap.toCurrency,
      fromAmount: ethers.formatUnits(swap.fromAmount, 18),
      toAmount: ethers.formatUnits(swap.toAmount, 18),
      gstAmount: ethers.formatUnits(swap.gstAmount, 18),
      timestamp: Number(swap.timestamp),
      txHash: swap.txHash
    }));
  } catch (error) {
    console.error('Error getting recent swaps:', error);
    return [];
  }
};

export const getGSTRate = async (): Promise<number> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    const gstRate = await contract.GST_RATE();
    return Number(gstRate) / 100; // Convert from basis points to percentage
  } catch (error) {
    console.error('Error getting GST rate:', error);
    return 18; // Default 18%
  }
};

// Legacy functions for backward compatibility
export const sendUSDT = async (toAddress: string, amount: number): Promise<string> => {
  // This function is now replaced by swapUSDTToFiat
  // For direct USDT transfers, we can implement this separately if needed
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    await switchToSepolia();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const usdtContract = getUSDTContract(provider, true);

    const amountWei = ethers.parseUnits(amount.toString(), 6); // USDT has 6 decimals
    
    const tx = await usdtContract.transfer(toAddress, amountWei);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending USDT:', error);
    throw error;
  }
};

export const getRecentTransactions = async (address: string): Promise<any[]> => {
  // Use getUserSwapHistory instead
  return getUserSwapHistory(address);
};