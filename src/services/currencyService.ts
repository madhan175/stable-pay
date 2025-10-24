// Currency service for real-time USD rate fetching
export interface CurrencyRates {
  usdToInr: number;
  usdtToUsd: number; // Always 1:1
  lastUpdated: Date;
}

class CurrencyService {
  private rates: CurrencyRates | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  async getCurrentRates(): Promise<CurrencyRates> {
    const now = Date.now();
    
    // Return cached rates if still valid
    if (this.rates && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      console.log('💰 [CURRENCY] Fetching real-time USD rates...');
      
      // Fetch USD to INR rate
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (!data.rates || !data.rates.INR) {
        throw new Error('Invalid API response');
      }

      this.rates = {
        usdToInr: data.rates.INR,
        usdtToUsd: 1, // USDT is pegged to USD
        lastUpdated: new Date()
      };

      this.lastFetchTime = now;
      
      console.log('✅ [CURRENCY] Rates updated:', {
        'USD to INR': this.rates.usdToInr.toFixed(2),
        'USDT to USD': this.rates.usdtToUsd,
        'Last Updated': this.rates.lastUpdated.toLocaleTimeString()
      });

      return this.rates;
    } catch (error) {
      console.error('❌ [CURRENCY] Failed to fetch rates:', error);
      
      // Fallback to cached rates or default
      if (this.rates) {
        console.log('🔄 [CURRENCY] Using cached rates');
        return this.rates;
      }
      
      // Ultimate fallback
      console.log('🔄 [CURRENCY] Using fallback rates');
      this.rates = {
        usdToInr: 83.0, // Approximate fallback rate
        usdtToUsd: 1,
        lastUpdated: new Date()
      };
      
      return this.rates;
    }
  }

  // Convert USDT amount to USD (always 1:1 but useful for clarity)
  usdtToUsd(usdtAmount: number): number {
    return usdtAmount; // USDT is pegged to USD
  }

  // Convert USDT amount to INR
  async usdtToInr(usdtAmount: number): Promise<number> {
    const rates = await this.getCurrentRates();
    return usdtAmount * rates.usdToInr;
  }

  // Convert INR amount to USDT
  async inrToUsdt(inrAmount: number): Promise<number> {
    const rates = await this.getCurrentRates();
    return inrAmount / rates.usdToInr;
  }

  // Get formatted currency string
  formatCurrency(amount: number, currency: 'USD' | 'INR' | 'USDT'): string {
    switch (currency) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'INR':
        return `₹${amount.toFixed(2)}`;
      case 'USDT':
        return `${amount.toFixed(6)} USDT`;
      default:
        return amount.toFixed(6);
    }
  }
}

export const currencyService = new CurrencyService();
