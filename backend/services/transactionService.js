const axios = require('axios');
const supabaseService = require('./supabaseService');

class TransactionService {
  constructor() {
    this.coingeckoApiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  async convertINRToUSD(inrAmount) {
    try {
      // Use CoinGecko API to get USD to INR rate
      const response = await axios.get(`${this.coingeckoApiUrl}/simple/price`, {
        params: {
          ids: 'usd-coin',
          vs_currencies: 'inr'
        }
      });

      console.log('CoinGecko API Response:', response.data);

      if (response.data && response.data['usd-coin'] && response.data['usd-coin'].inr) {
        const usdToInrRate = response.data['usd-coin'].inr;
        const usdAmount = inrAmount / usdToInrRate;
        
        console.log(`Conversion: ${inrAmount} INR = ${usdAmount} USD (Rate: ${usdToInrRate})`);
        
        return {
          usdAmount,
          inrAmount,
          rate: usdToInrRate
        };
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Fallback rate if API fails
      const fallbackRate = 83.0; // Approximate USD to INR rate
      const usdAmount = inrAmount / fallbackRate;
      
      console.log(`Fallback conversion: ${inrAmount} INR = ${usdAmount} USD (Rate: ${fallbackRate})`);
      
      return {
        usdAmount,
        inrAmount,
        rate: fallbackRate
      };
    }
  }

  async checkKYCRequirement(inrAmount) {
    const conversion = await this.convertINRToUSD(inrAmount);
    const requiresKYC = conversion.usdAmount > 200;
    
    return {
      requiresKYC,
      usdAmount: conversion.usdAmount,
      inrAmount: conversion.inrAmount,
      rate: conversion.rate
    };
  }

  async createTransaction(userId, transactionData) {
    try {
      // Check KYC requirement
      const kycCheck = await this.checkKYCRequirement(transactionData.amount_inr);
      
      // Get user's KYC status
      const user = await supabaseService.getUserByPhone(transactionData.phone);
      const kycVerified = user && user.kyc_status === 'verified';

      const transaction = {
        user_id: userId,
        recipient_wallet: transactionData.recipient_wallet,
        amount_inr: transactionData.amount_inr,
        amount_usd: kycCheck.usdAmount,
        amount_usdt: kycCheck.usdAmount, // 1:1 with USD for USDT
        requires_kyc: kycCheck.requiresKYC,
        kyc_verified: kycVerified,
        status: kycCheck.requiresKYC && !kycVerified ? 'blocked' : 'created'
      };

      const createdTransaction = await supabaseService.createTransaction(transaction);
      
      return {
        transaction: createdTransaction,
        kycCheck,
        kycVerified,
        canProceed: !kycCheck.requiresKYC || kycVerified
      };
    } catch (error) {
      console.error('Transaction creation error:', error);
      throw new Error('Failed to create transaction');
    }
  }

  async updateTransactionStatus(transactionId, status, additionalData = {}) {
    try {
      const updates = {
        status,
        ...additionalData
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const updatedTransaction = await supabaseService.updateTransaction(transactionId, updates);
      return updatedTransaction;
    } catch (error) {
      console.error('Transaction update error:', error);
      throw new Error('Failed to update transaction');
    }
  }

  async getTransactionHistory(userId) {
    try {
      const transactions = await supabaseService.getTransactions(userId);
      return transactions;
    } catch (error) {
      console.error('Transaction history error:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  // Mock blockchain transaction (replace with actual Web3 implementation)
  async executeBlockchainTransaction(transactionId, recipientWallet, amountUSDT) {
    try {
      // Update status to pending
      await this.updateTransactionStatus(transactionId, 'pending');

      // Simulate blockchain transaction
      // In real implementation, this would interact with Web3/MetaMask
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      const mockBlockNumber = Math.floor(Math.random() * 1000000) + 18000000;
      const mockGasUsed = Math.floor(Math.random() * 100000) + 50000;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update with success
      await this.updateTransactionStatus(transactionId, 'completed', {
        tx_hash: mockTxHash,
        block_number: mockBlockNumber,
        gas_used: mockGasUsed
      });

      return {
        success: true,
        txHash: mockTxHash,
        blockNumber: mockBlockNumber,
        gasUsed: mockGasUsed
      };
    } catch (error) {
      console.error('Blockchain transaction error:', error);
      
      // Update with failure
      await this.updateTransactionStatus(transactionId, 'failed', {
        error_message: error.message
      });

      throw new Error('Blockchain transaction failed');
    }
  }
}

module.exports = new TransactionService();
