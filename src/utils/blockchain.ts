import { ethers } from 'ethers';

// Real USDT contract ABI for Sepolia testnet
const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// USDT and Swap contract addresses (resolve from env or localStorage)
const ENV_USDT_ADDRESS = (import.meta as any)?.env?.VITE_USDT_ADDRESS || '';
const ENV_SWAP_ADDRESS = (import.meta as any)?.env?.VITE_CONTRACT_ADDRESS || '';
const LS_USDT_ADDRESS = (() => {
  try { return localStorage.getItem('USDT_ADDRESS') || ''; } catch { return ''; }
})();
const LS_SWAP_ADDRESS = (() => {
  try { return localStorage.getItem('CONTRACT_ADDRESS') || ''; } catch { return ''; }
})();

const RAW_USDT_ADDRESS = ENV_USDT_ADDRESS || LS_USDT_ADDRESS;
const RAW_SWAP_ADDRESS = ENV_SWAP_ADDRESS || LS_SWAP_ADDRESS;

const resolveUsdtAddress = async (provider?: ethers.Provider): Promise<string> => {
  // 1) Prefer explicit env/localStorage
  if (RAW_USDT_ADDRESS) {
    try { return ethers.getAddress(RAW_USDT_ADDRESS); } catch { /* fall through */ }
  }

  // 2) Try reading from deployed swap contract if configured (env or localStorage)
  try {
    if (!RAW_SWAP_ADDRESS) return '';
    const swapAddress = ethers.getAddress(RAW_SWAP_ADDRESS);
    const usedProvider = provider || (typeof window !== 'undefined' && (window as any).ethereum ? new ethers.BrowserProvider((window as any).ethereum) : undefined);
    if (!usedProvider) return '';
    const code = await usedProvider.getCode(swapAddress);
    if (code === '0x') return '';
    const swapAbi = ["function usdt() view returns (address)"];
    const swapContract = new ethers.Contract(swapAddress, swapAbi, usedProvider);
    const addr: string = await swapContract.usdt();
    return ethers.getAddress(addr);
  } catch {
    return '';
  }
};

// Real conversion rate (fetch from API in production)
const INR_TO_USDT_RATE = 0.012; // 1 INR = 0.012 USDT (approximate)

export const convertINRToUSDT = async (inrAmount: number): Promise<number> => {
  try {
    console.log(`💰 [SEPOLIA] Converting ₹${inrAmount} to USDT...`);
    
    // Try to fetch real-time rate from API
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const inrToUsdRate = 1 / data.rates.INR; // Convert INR to USD
      const usdtAmount = inrAmount * inrToUsdRate;
      
      console.log(`✅ [SEPOLIA] Real-time conversion: ₹${inrAmount} = $${usdtAmount.toFixed(6)} USDT`);
      return usdtAmount;
    } catch (apiError) {
      console.warn('⚠️ [SEPOLIA] API rate fetch failed, using fallback rate');
      const usdtAmount = inrAmount * INR_TO_USDT_RATE;
      console.log(`💰 [SEPOLIA] Fallback conversion: ₹${inrAmount} = $${usdtAmount.toFixed(6)} USDT`);
      return usdtAmount;
    }
  } catch (error) {
    console.error('❌ [SEPOLIA] Conversion failed:', error);
    throw new Error('Failed to convert INR to USDT');
  }
};

export const getUSDTBalance = async (address: string): Promise<number> => {
  try {
    console.log(`🔍 [BLOCKCHAIN] Getting USDT balance for: ${address}`);
    
    if (typeof window.ethereum === 'undefined') {
      console.warn('⚠️ [BLOCKCHAIN] MetaMask not installed, using mock balance');
      return Math.random() * 1000; // Mock balance
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Resolve and verify USDT address first
    const usdtAddress = await resolveUsdtAddress(provider);
    if (!usdtAddress) {
      console.warn('⚠️ [BLOCKCHAIN] No VITE_USDT_ADDRESS configured, using mock balance');
      return Math.random() * 1000;
    }

    // Try real USDT contract first
    try {
      const code = await provider.getCode(usdtAddress);
      if (code === '0x') {
        throw new Error('USDT contract not found at configured address');
      }
      const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, provider);
      
      // Test if contract exists by checking if it returns data
      const balanceWei = await usdtContract.balanceOf(address);
      const decimals = await usdtContract.decimals();
      const balance = parseFloat(ethers.formatUnits(balanceWei, decimals));
      
      console.log(`✅ [BLOCKCHAIN] Real USDT Balance: ${balance.toFixed(6)} USDT`);
      return balance;
    } catch (contractError: any) {
      if (contractError.message?.includes('could not decode result data') || 
          contractError.message?.includes('BAD_DATA')) {
        console.warn('⚠️ [BLOCKCHAIN] USDT contract not available, using mock balance');
        return Math.random() * 1000; // Mock balance
      }
      throw contractError; // Re-throw other errors
    }
  } catch (error: any) {
    console.error('❌ [BLOCKCHAIN] Error getting USDT balance:', error);
    
    if (error.message?.includes('MetaMask not installed')) {
      console.warn('⚠️ [BLOCKCHAIN] MetaMask not installed, using mock balance');
      return Math.random() * 1000; // Mock balance
    } else if (error.message?.includes('User rejected')) {
      throw new Error('User rejected the request');
    } else {
      console.warn('⚠️ [BLOCKCHAIN] Using mock balance due to error');
      return Math.random() * 1000; // Fallback to mock balance
    }
  }
};

export const sendUSDT = async (toAddress: string, amount: number): Promise<string> => {
  try {
    console.log(`🚀 [SEPOLIA] Sending ${amount} USDT to ${toAddress}`);
    
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const usdtAddress = await resolveUsdtAddress(provider);
    if (!usdtAddress) {
      throw new Error('USDT contract address not configured (VITE_USDT_ADDRESS)');
    }
    const code = await provider.getCode(usdtAddress);
    if (code === '0x') {
      throw new Error('USDT contract not found at configured address');
    }
    const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);
    
    // Get decimals
    // Some mock/minimal tokens may not expose decimals; default gracefully
    let decimals = 6;
    try {
      decimals = await usdtContract.decimals();
    } catch (e) {
      console.warn('⚠️ [SEPOLIA] decimals() not available, defaulting to 6');
    }
    const amountWei = ethers.parseUnits(amount.toString(), decimals);
    
    // Check balance
    const balanceWei = await usdtContract.balanceOf(await signer.getAddress());
    if (balanceWei < amountWei) {
      throw new Error('Insufficient USDT balance');
    }
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei'); // Fallback to 20 gwei
    console.log(`⛽ [SEPOLIA] Gas price: ${gasPrice.toString()} wei`);
    
    // Estimate gas
    const gasEstimate = await usdtContract.transfer.estimateGas(toAddress, amountWei);
    console.log(`⛽ [SEPOLIA] Gas estimate: ${gasEstimate.toString()}`);
    
    // Execute transaction
    console.log(`📝 [SEPOLIA] Executing USDT transfer...`);
    const tx = await usdtContract.transfer(toAddress, amountWei, {
      gasLimit: gasEstimate,
      gasPrice: gasPrice
    });
    
    console.log(`⏳ [SEPOLIA] Transaction sent: ${tx.hash}`);
    console.log(`⏳ [SEPOLIA] Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    
    console.log(`✅ [SEPOLIA] Transaction confirmed!`);
    console.log(`📊 [SEPOLIA] Transaction details:`, {
      hash: tx.hash,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
      effectiveGasPrice: receipt?.gasPrice?.toString(),
      status: receipt?.status
    });
    
    // Calculate gas fees paid
    const gasUsed = receipt?.gasUsed || gasEstimate;
    const gasPricePaid = receipt?.gasPrice || gasPrice;
    const totalGasFee = gasUsed * gasPricePaid;
    
    console.log(`💰 [SEPOLIA] Gas fees paid:`, {
      gasUsed: gasUsed.toString(),
      gasPrice: gasPricePaid?.toString(),
      totalFee: totalGasFee.toString(),
      totalFeeETH: ethers.formatEther(totalGasFee)
    });
    
    return tx.hash;
  } catch (error: any) {
    console.error('❌ [SEPOLIA] USDT transfer failed:', error);
    
    if (error.message?.includes('MetaMask not installed')) {
      throw new Error('Please install MetaMask to send USDT');
    } else if (error.message?.includes('User rejected')) {
      throw new Error('Transaction cancelled by user');
    } else if (error.message?.includes('Insufficient USDT balance')) {
      throw new Error('Insufficient USDT balance for this transaction');
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient Sepolia ETH for gas fees');
    } else {
      throw new Error(`USDT transfer failed: ${error.message || 'Unknown error'}`);
    }
  }
};

export const getRecentTransactions = async (address: string): Promise<any[]> => {
  try {
    console.log(`🔍 [SEPOLIA] Fetching recent transactions for: ${address}`);
    
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get recent blocks and filter transactions
    const currentBlock = await provider.getBlockNumber();
    const transactions = [];
    
    // Check last 10 blocks for transactions involving this address
    for (let i = 0; i < 10; i++) {
      try {
        const block = await provider.getBlock(currentBlock - i, true);
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (typeof tx === 'object' && tx !== null) {
              const txObj = tx as any;
              if (txObj.from?.toLowerCase() === address.toLowerCase() || 
                  txObj.to?.toLowerCase() === address.toLowerCase()) {
                transactions.push({
                  hash: txObj.hash,
                  from: txObj.from,
                  to: txObj.to,
                  value: ethers.formatEther(txObj.value || 0),
                  timestamp: block.timestamp,
                  blockNumber: block.number,
                  gasUsed: txObj.gasLimit?.toString(),
                  gasPrice: txObj.gasPrice?.toString()
                });
              }
            }
          }
        }
      } catch (blockError) {
        console.warn(`⚠️ [SEPOLIA] Error fetching block ${currentBlock - i}:`, blockError);
      }
    }
    
    console.log(`✅ [SEPOLIA] Found ${transactions.length} recent transactions`);
    return transactions.slice(0, 10); // Return max 10 transactions
    
  } catch (error: any) {
    console.error('❌ [SEPOLIA] Error fetching transactions:', error);
    
    if (error.message?.includes('MetaMask not installed')) {
      console.warn('⚠️ [SEPOLIA] Using mock transactions due to MetaMask not installed');
    } else {
      console.warn('⚠️ [SEPOLIA] Using mock transactions due to error');
    }
    
    // Fallback to mock data
    const mockTransactions = Array.from({ length: 5 }, (_, i) => ({
      hash: '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      from: '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      to: address,
      value: (Math.random() * 100).toFixed(6),
      timestamp: Date.now() / 1000 - (i * 86400),
      blockNumber: 0,
      gasUsed: '0',
      gasPrice: '0'
    }));
    
    return mockTransactions;
  }
};