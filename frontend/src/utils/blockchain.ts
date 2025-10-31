import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESSES,
  USDT_ABI,
  SWAP_ABI,
  ensureCorrectNetwork
} from '../config/contracts';

interface SwapEventArgs {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: bigint;
  toAmount: bigint;
  timestamp: bigint;
}

type SwapEvent = ethers.Log & {
  args: SwapEventArgs;
  transactionHash: string;
  event: 'SwapExecuted';
  eventSignature: string;
};

export interface TransactionData {
  hash: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  timestamp: Date;
}

export const getProvider = async (): Promise<ethers.BrowserProvider> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  await ensureCorrectNetwork();
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Safely get fee data from provider with fallback for networks that don't support EIP-1559
 * Handles the case where eth_maxPriorityFeePerGas is not available
 */
export const getSafeFeeData = async (provider: ethers.Provider): Promise<ethers.FeeData> => {
  try {
    // Try to get fee data (may fail on networks without EIP-1559 support)
    const feeData = await provider.getFeeData();
    
    // If we got fee data with EIP-1559 fields, return it
    if (feeData.maxFeePerGas || feeData.maxPriorityFeePerGas) {
      return feeData;
    }
    
    // If we got legacy gasPrice, use that
    if (feeData.gasPrice) {
      return feeData;
    }
    
    // Fallback to default gas price
    return {
      gasPrice: ethers.parseUnits('20', 'gwei'),
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      toJSON: () => ({ gasPrice: ethers.parseUnits('20', 'gwei').toString() })
    } as ethers.FeeData;
  } catch (error: any) {
    // Network doesn't support EIP-1559 or getFeeData failed
    // This happens when the RPC doesn't support eth_maxPriorityFeePerGas
    const errorMsg = error?.message || String(error);
    const isEIP1559Error = errorMsg.includes('maxPriorityFeePerGas') || errorMsg.includes('-32601');
    
    if (isEIP1559Error) {
      console.warn('⚠️ [GAS] Network doesn\'t support EIP-1559 (eth_maxPriorityFeePerGas not available), using legacy gas pricing');
    } else {
      console.warn('⚠️ [GAS] getFeeData failed, using fallback:', errorMsg);
    }
    
    // Try to get gas price using window.ethereum directly (for BrowserProvider)
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const gasPriceHex = await window.ethereum.request({ method: 'eth_gasPrice' });
        if (gasPriceHex && typeof gasPriceHex === 'string') {
          return {
            gasPrice: BigInt(gasPriceHex),
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            toJSON: () => ({ gasPrice: BigInt(gasPriceHex).toString() })
          } as ethers.FeeData;
        }
      }
    } catch (rpcError) {
      console.warn('⚠️ [GAS] Direct RPC call failed, using default:', rpcError);
    }
    
    // Try provider.send if available (for JsonRpcProvider)
    try {
      if ('send' in provider && typeof (provider as any).send === 'function') {
        const gasPrice = await (provider as any).send('eth_gasPrice', []);
        if (gasPrice) {
          const gasPriceValue = typeof gasPrice === 'string' ? BigInt(gasPrice) : BigInt(gasPrice);
          return {
            gasPrice: gasPriceValue,
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            toJSON: () => ({ gasPrice: gasPriceValue.toString() })
          } as ethers.FeeData;
        }
      }
    } catch (rpcError) {
      // Ignore - already tried window.ethereum
    }
    
    // Final fallback: use a reasonable default gas price
    console.log('⚠️ [GAS] Using fallback gas price: 20 gwei');
    return {
      gasPrice: ethers.parseUnits('20', 'gwei'),
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      toJSON: () => ({ gasPrice: ethers.parseUnits('20', 'gwei').toString() })
    } as ethers.FeeData;
  }
};

export const convertINRToUSDT = async (inrAmount: number): Promise<number> => {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    // Ensure swap contract address is properly checksummed
    const checksummedSwapAddress = ethers.getAddress(CONTRACT_ADDRESSES.swap);
    const swapContract = new ethers.Contract(checksummedSwapAddress, SWAP_ABI, signer);
    const result = await swapContract.calculateSwap('INR', 'USDT', inrAmount);
    const usdtAmount = Array.isArray(result) ? result[0] : result;
    return Number(ethers.formatUnits(usdtAmount, 6));
  } catch (error) {
    console.error('Conversion failed:', error);
    throw error instanceof Error ? error : new Error('Failed to convert INR to USDT');
  }
};

export const getUSDTBalance = async (address: string): Promise<number> => {
  try {
    if (!ethers.isAddress(address)) throw new Error('Invalid address format');
    
    // Check if USDT contract is configured
    if (!CONTRACT_ADDRESSES.usdt) {
      console.warn('⚠️ [USDT] USDT contract not configured, returning mock balance');
      return 1000; // Mock balance for testing
    }
    
    const provider = await getProvider();
    // Ensure USDT address and user address are properly checksummed
    const checksummedUsdtAddress = ethers.getAddress(CONTRACT_ADDRESSES.usdt);
    const checksummedUserAddress = ethers.getAddress(address);
    
    // Check if this is a mock/placeholder address
    const isMockAddress = checksummedUsdtAddress.toLowerCase() === '0x1234567890123456789012345678901234567890';
    
    if (isMockAddress) {
      console.warn(`⚠️ [USDT] Mock/placeholder address detected: ${checksummedUsdtAddress}, returning mock balance`);
      return 1000; // Mock balance for testing
    }
    
    // Verify contract exists at address
    const contractCode = await provider.getCode(checksummedUsdtAddress);
    if (!contractCode || contractCode === '0x') {
      console.warn(`⚠️ [USDT] No contract found at ${checksummedUsdtAddress}, returning mock balance`);
      return 1000; // Mock balance for testing
    }
    
    const usdtContract = new ethers.Contract(checksummedUsdtAddress, USDT_ABI, provider);
    
    let decimals: number;
    let balance: bigint;
    
    try {
      decimals = await usdtContract.decimals();
    } catch (decimalsError: any) {
      if (decimalsError.code === 'BAD_DATA' || decimalsError.message?.includes('decode result data')) {
        console.warn(`⚠️ [USDT] Contract at ${checksummedUsdtAddress} doesn't appear to be ERC20, returning mock balance`);
        return 1000;
      }
      throw decimalsError;
    }
    
    try {
      balance = await usdtContract.balanceOf(checksummedUserAddress);
    } catch (balanceError: any) {
      if (balanceError.code === 'BAD_DATA' || balanceError.message?.includes('decode result data')) {
        console.warn(`⚠️ [USDT] Cannot read balance from contract at ${checksummedUsdtAddress}, returning mock balance`);
        return 1000;
      }
      throw balanceError;
    }
    
    return Number(ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    console.warn('⚠️ [USDT] USDT balance check failed, returning mock balance');
    return 1000; // Mock balance for testing
  }
};

export const sendUSDT = async (toAddress: string, amount: number): Promise<{ hash: string; gasUsed?: string; blockNumber?: string }> => {
  try {
    if (!ethers.isAddress(toAddress)) throw new Error('Invalid recipient address');
    if (amount <= 0) throw new Error('Amount must be greater than 0');
    
    // Check if USDT contract is configured
    if (!CONTRACT_ADDRESSES.usdt) {
      console.error('❌ [USDT] USDT contract not configured');
      throw new Error(
        'USDT contract not deployed. Please deploy MockUSDT contract first:\n' +
        '1. Run: cd contarcts && npx hardhat run scripts/deploy-mock-usdt.js --network sepolia\n' +
        '2. Update VITE_USDT_ADDRESS in frontend/.env\n' +
        '3. Restart the frontend server\n' +
        'See: contarcts/DEPLOYMENT-INSTRUCTIONS.md for details'
      );
    }
    
    const provider = await getProvider();
    const signer = await provider.getSigner();
    // Ensure USDT address and recipient address are properly checksummed
    const checksummedUsdtAddress = ethers.getAddress(CONTRACT_ADDRESSES.usdt);
    const checksummedToAddress = ethers.getAddress(toAddress);
    
    // Check if this is a mock/placeholder address
    const isMockAddress = checksummedUsdtAddress.toLowerCase() === '0x1234567890123456789012345678901234567890';
    
    if (isMockAddress) {
      throw new Error(
        `Mock/placeholder USDT address detected: ${checksummedUsdtAddress}\n` +
        `This is a placeholder address and no contract is deployed here.\n\n` +
        `To use P2P transfers, you need to:\n` +
        `1. Deploy MockUSDT contract: cd contarcts && npx hardhat run scripts/deploy-mock-usdt.js --network sepolia\n` +
        `2. Update VITE_USDT_ADDRESS in frontend/.env with the deployed address\n` +
        `3. Restart the frontend server\n\n` +
        `Or set VITE_USDT_ADDRESS in your .env file to a valid deployed contract address.`
      );
    }
    
    // Verify network is Sepolia (where contracts are deployed)
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      throw new Error(
        `Wrong network! Contracts are deployed on Sepolia (Chain ID: 11155111). ` +
        `You are currently connected to Chain ID: ${network.chainId}. ` +
        `Please switch to Sepolia testnet in your wallet.`
      );
    }
    
    // Verify contract exists at address before attempting to use it
    const contractCode = await provider.getCode(checksummedUsdtAddress);
    if (!contractCode || contractCode === '0x') {
      throw new Error(
        `USDT contract not found at address ${checksummedUsdtAddress} on Sepolia network. ` +
        `Please verify:\n` +
        `1. The MockUSDT contract is deployed at this address on Sepolia\n` +
        `2. Deploy it using: cd contarcts && npx hardhat run scripts/deploy-mock-usdt.js --network sepolia\n` +
        `3. Update VITE_USDT_ADDRESS in frontend/.env with the deployed address\n` +
        `4. Check the address on Sepolia Etherscan: https://sepolia.etherscan.io/address/${checksummedUsdtAddress}`
      );
    }
    
    const usdtContract = new ethers.Contract(checksummedUsdtAddress, USDT_ABI, signer);
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const fromAddress = await signer.getAddress();
    
    // Try to get balance with better error handling
    let balance: bigint;
    try {
      balance = await usdtContract.balanceOf(fromAddress);
    } catch (balanceError: any) {
      if (balanceError.code === 'BAD_DATA' || balanceError.message?.includes('decode result data')) {
        throw new Error(
          `USDT contract at ${checksummedUsdtAddress} doesn't appear to be a valid ERC20 token contract. ` +
          `Please verify the contract address is correct and matches the deployed MockUSDT contract.`
        );
      }
      throw balanceError;
    }
    
    // Check if balance is insufficient
    if (balance < amountWei) {
      console.warn('⚠️ [USDT] Insufficient balance. Attempting to auto-mint for testing...');
      
      // Try to auto-mint if MockUSDT contract has mint function
      try {
        const mintAmount = ethers.parseUnits("10000", 6); // Mint 10,000 USDT
        console.log('💰 [USDT] Minting USDT for testing...');
        const mintTx = await usdtContract.mint(fromAddress, mintAmount);
        await mintTx.wait();
        console.log('✅ [USDT] Successfully minted USDT for testing');
        
        // Update balance after minting
        balance = await usdtContract.balanceOf(fromAddress);
      } catch (mintError: any) {
        console.error('❌ [USDT] Failed to auto-mint:', mintError.message);
        throw new Error(
          `Insufficient USDT balance. Your wallet has ${ethers.formatUnits(balance, 6)} USDT but needs ${amount} USDT.\n\n` +
          `To fund your wallet:\n` +
          `1. Run: cd contarcts && npx hardhat run scripts/fund-wallets.js --network sepolia ${fromAddress}\n` +
          `2. Or manually mint USDT if you have access to the MockUSDT contract`
        );
      }
    }
    
    const gasEstimate = await usdtContract.transfer.estimateGas(checksummedToAddress, amountWei);
    const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
    const feeData = await getSafeFeeData(provider);
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
    const tx = await usdtContract.transfer(checksummedToAddress, amountWei, { gasLimit, gasPrice });
    const receipt = await tx.wait();
    if (!receipt || receipt.status === 0) throw new Error('Transaction failed');
    return { 
      hash: tx.hash, 
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber.toString()
    };
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error; // Re-throw error instead of returning mock
  }
};

const parseSwapEvent = (log: ethers.Log, iface: ethers.Interface): SwapEvent => {
  const parsed = iface.parseLog({ topics: log.topics, data: log.data });
  return {
    ...log,
    args: {
      fromCurrency: parsed?.args[1] as string,
      toCurrency: parsed?.args[2] as string,
      fromAmount: parsed?.args[3] as bigint,
      toAmount: parsed?.args[4] as bigint,
      timestamp: parsed?.args[5] as bigint
    },
    event: 'SwapExecuted',
    eventSignature: parsed?.signature || ''
  } as SwapEvent;
};

export const getRecentTransactions = async (address: string): Promise<TransactionData[]> => {
  try {
    if (!ethers.isAddress(address)) throw new Error('Invalid address format');
    const provider = await getProvider();
    const blockNumber = await provider.getBlockNumber();
    const fromBlock = Math.max(0, blockNumber - 1000);
    const swapExecutedTopic = ethers.id('SwapExecuted(address,string,string,uint256,uint256,uint256)');
    const userTopic = ethers.zeroPadValue(address.toLowerCase(), 32);
    // Ensure swap contract address is properly checksummed
    const checksummedSwapAddress = ethers.getAddress(CONTRACT_ADDRESSES.swap);
    const logs = await provider.getLogs({ address: checksummedSwapAddress, topics: [swapExecutedTopic, userTopic], fromBlock, toBlock: 'latest' });
    const iface = new ethers.Interface(SWAP_ABI);
    const events = logs.map(log => parseSwapEvent(log, iface));
    return events.map(event => ({
      hash: event.transactionHash,
      fromCurrency: event.args.fromCurrency,
      toCurrency: event.args.toCurrency,
      fromAmount: Number(ethers.formatUnits(event.args.fromAmount, 6)),
      toAmount: Number(ethers.formatUnits(event.args.toAmount, 6)),
      timestamp: new Date(Number(event.args.timestamp) * 1000)
    })).slice(0, 10);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
