import { useEffect, useState } from 'react';

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  [key: string]: string | undefined; // Allow for additional UTM parameters
}

export function useUtmParams() {
  const [utmParams, setUtmParams] = useState<UtmParams>({});

  // Function to extract UTM parameters from URL
  const extractUtmParams = (): UtmParams => {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    const params: UtmParams = {};
    
    // Extract all utm_* parameters
    for (const [key, value] of urlParams.entries()) {
      if (key.startsWith('utm_')) {
        params[key] = value;
      }
    }
    
    return params;
  };

  // Function to save UTM parameters to localStorage
  const saveUtmParams = (params: UtmParams) => {
    if (Object.keys(params).length === 0) return;
    
    try {
      localStorage.setItem('utm_params', JSON.stringify(params));
    } catch (error) {
      console.error('Error saving UTM params to localStorage:', error);
    }
  };

  // Function to load UTM parameters from localStorage
  const loadUtmParams = (): UtmParams => {
    try {
      const saved = localStorage.getItem('utm_params');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading UTM params from localStorage:', error);
      return {};
    }
  };

  // Function to format UTM parameters for use in URLs
  const formatUtmParamsForUrl = (params: UtmParams = utmParams): string => {
    if (Object.keys(params).length === 0) return '';
    
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.append(key, value);
    });
    
    return urlParams.toString();
  };

  // Load UTM parameters on initial mount
  useEffect(() => {
    // First check URL for UTM parameters
    const urlUtmParams = extractUtmParams();
    
    // If URL has UTM parameters, save them and use them
    if (Object.keys(urlUtmParams).length > 0) {
      saveUtmParams(urlUtmParams);
      setUtmParams(urlUtmParams);
    } else {
      // Otherwise, try to load from localStorage
      const savedUtmParams = loadUtmParams();
      setUtmParams(savedUtmParams);
    }
  }, []);

  return {
    utmParams,
    formatUtmParamsForUrl,
  };
}
