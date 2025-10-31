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

export const convertINRToUSDT = async (inrAmount: number): Promise<number> => {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const swapContract = new ethers.Contract(CONTRACT_ADDRESSES.swap, SWAP_ABI, signer);
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
    const provider = await getProvider();
    const usdtContract = new ethers.Contract(CONTRACT_ADDRESSES.usdt, USDT_ABI, provider);
    const decimals = await usdtContract.decimals();
    const balance = await usdtContract.balanceOf(address);
    return Number(ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error('Error getting USDT balance:', error);
    throw error instanceof Error ? error : new Error('Failed to get USDT balance');
  }
};

export const sendUSDT = async (toAddress: string, amount: number): Promise<string> => {
  try {
    if (!ethers.isAddress(toAddress)) throw new Error('Invalid recipient address');
    if (amount <= 0) throw new Error('Amount must be greater than 0');
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const usdtContract = new ethers.Contract(CONTRACT_ADDRESSES.usdt, USDT_ABI, signer);
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const fromAddress = await signer.getAddress();
    const balance = await usdtContract.balanceOf(fromAddress);
    if (balance < amountWei) throw new Error('Insufficient USDT balance');
    const gasEstimate = await usdtContract.transfer.estimateGas(toAddress, amountWei);
    const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
    const tx = await usdtContract.transfer(toAddress, amountWei, { gasLimit, gasPrice });
    const receipt = await tx.wait();
    if (!receipt || receipt.status === 0) throw new Error('Transaction failed');
    return tx.hash;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error instanceof Error ? error : new Error('Transaction failed');
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
    const logs = await provider.getLogs({ address: CONTRACT_ADDRESSES.swap, topics: [swapExecutedTopic, userTopic], fromBlock, toBlock: 'latest' });
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
