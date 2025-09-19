import { ethers } from 'ethers';

// Mock USDT contract ABI (simplified)
const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Mock contract address (replace with actual USDT contract on testnet)
const USDT_CONTRACT_ADDRESS = '0x...'; // Replace with actual testnet USDT address

// Mock conversion rate (in production, use real API)
const INR_TO_USDT_RATE = 0.012; // 1 INR = 0.012 USDT (approximate)

export const convertINRToUSDT = async (inrAmount: number): Promise<number> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, fetch real-time rates from API
  return inrAmount * INR_TO_USDT_RATE;
};

export const getUSDTBalance = async (address: string): Promise<number> => {
  try {
    // Mock balance for demo purposes
    const mockBalance = Math.random() * 1000;
    return mockBalance;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
};

export const sendUSDT = async (toAddress: string, amount: number): Promise<string> => {
  try {
    // Mock transaction for demo
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return mockTxHash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

export const getRecentTransactions = async (address: string): Promise<any[]> => {
  try {
    // Mock transaction data for demo
    const mockTransactions = Array.from({ length: 5 }, (_, i) => ({
      hash: '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      from: '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      to: address,
      value: (Math.random() * 100).toFixed(6),
      timestamp: Date.now() / 1000 - (i * 86400) // Mock timestamps
    }));
    
    return mockTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};