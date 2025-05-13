import { useState, useCallback, useEffect } from 'react';

// Fixed exchange rate - 20 MXN per USD
const FIXED_USD_TO_MXN_RATE = 20;

export const useExchangeRate = () => {
  // Use a fixed exchange rate instead of fetching from an API
  const [exchangeRate] = useState(FIXED_USD_TO_MXN_RATE);
  const [isLoading] = useState(false);

  // Function to convert MXN to USD
  const convertMXNtoUSD = useCallback((mxnAmount: number): number => {
    return mxnAmount / exchangeRate;
  }, [exchangeRate]);

  // Function to convert USD to MXN
  const convertUSDtoMXN = useCallback((usdAmount: number): number => {
    return usdAmount * exchangeRate;
  }, [exchangeRate]);

  return {
    exchangeRate,
    isLoading,
    convertMXNtoUSD,
    convertUSDtoMXN,
    refreshRate: () => {} // Empty function since we're not actually refreshing
  };
};
