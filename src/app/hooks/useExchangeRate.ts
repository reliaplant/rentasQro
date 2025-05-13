import { useState, useEffect, useCallback } from 'react';

// Default fallback rate if API fails
const DEFAULT_USD_TO_MXN_RATE = 20;

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_TO_MXN_RATE);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the exchange rate from a public API
  const fetchExchangeRate = useCallback(async () => {
    try {
      setIsLoading(true);
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=MXN');
      const data = await response.json();
      console.log('API response:', data);
      if (data && data.rates && data.rates.MXN) {
        console.log('Fetched exchange rate:', data.rates.MXN);
        setExchangeRate(data.rates.MXN);
        // Cache the rate in localStorage for offline/future use
        localStorage.setItem('exchangeRate', JSON.stringify({
          rate: data.rates.MXN,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Try to get the rate from localStorage if fetch fails
      const cachedRate = localStorage.getItem('exchangeRate');
      if (cachedRate) {
        const { rate } = JSON.parse(cachedRate);
        setExchangeRate(rate);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount, check for cached rate and fetch new rate if needed
  useEffect(() => {
    const cachedRateData = localStorage.getItem('exchangeRate');
    
    if (cachedRateData) {
      const { rate, timestamp } = JSON.parse(cachedRateData);
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours expiry
      
      if (!isExpired) {
        setExchangeRate(rate);
        setIsLoading(false);
        return;
      }
    }
    
    fetchExchangeRate();
  }, [fetchExchangeRate]);

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
    refreshRate: fetchExchangeRate
  };
};
