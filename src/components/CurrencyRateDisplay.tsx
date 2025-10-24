import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { currencyService } from '../services/currencyService';

interface CurrencyRateDisplayProps {
  className?: string;
  showLastUpdated?: boolean;
}

const CurrencyRateDisplay: React.FC<CurrencyRateDisplayProps> = ({ 
  className = '', 
  showLastUpdated = true 
}) => {
  const [rates, setRates] = useState<{
    usdToInr: number;
    usdtToUsd: number;
    lastUpdated: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentRates = await currencyService.getCurrentRates();
      setRates(currentRates);
    } catch (err) {
      setError('Failed to fetch rates');
      console.error('Rate fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">Rate fetch failed</span>
        </div>
      </div>
    );
  }

  if (!rates) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
          <span className="text-sm text-gray-600">Loading rates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Current Rates</span>
        </div>
        
        <button
          onClick={fetchRates}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="mt-2 space-y-1">
        <div className="text-sm text-blue-900">
          <span className="font-medium">1 USD</span> = <span className="font-semibold">₹{rates.usdToInr.toFixed(2)}</span>
        </div>
        <div className="text-sm text-blue-900">
          <span className="font-medium">1 USDT</span> = <span className="font-semibold">${rates.usdtToUsd.toFixed(2)} USD</span>
        </div>
        
        {showLastUpdated && (
          <div className="text-xs text-blue-600 mt-2">
            Updated: {rates.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyRateDisplay;
