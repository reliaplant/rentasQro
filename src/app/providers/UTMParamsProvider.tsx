'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  [key: string]: string | undefined;
}

interface UTMParamsContextType {
  utmParams: UtmParams;
  formatUtmParamsForUrl: (params?: UtmParams) => string;
}

const UTMParamsContext = createContext<UTMParamsContextType>({
  utmParams: {},
  formatUtmParamsForUrl: () => '',
});

export function UTMParamsProvider({ children }: { children: React.ReactNode }) {
  const [utmParams, setUtmParams] = useState<UtmParams>({});
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract UTM parameters from URL
  useEffect(() => {
    if (!searchParams) return;
    
    const params: UtmParams = {};
    let hasUtmParams = false;
    
    // Extract all utm_* parameters
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('utm_')) {
        params[key] = value;
        hasUtmParams = true;
      }
    }
    
    if (hasUtmParams) {
      // Save to localStorage
      try {
        localStorage.setItem('utm_params', JSON.stringify(params));
      } catch (error) {
        console.error('Error saving UTM params to localStorage:', error);
      }
      setUtmParams(params);
    } else {
      // Try to load from localStorage if URL doesn't have UTM parameters
      try {
        const savedUtmParams = localStorage.getItem('utm_params');
        if (savedUtmParams) {
          setUtmParams(JSON.parse(savedUtmParams));
        }
      } catch (error) {
        console.error('Error loading UTM params from localStorage:', error);
      }
    }
  }, [pathname, searchParams]);
  
  // Format UTM parameters for use in URLs
  const formatUtmParamsForUrl = (params: UtmParams = utmParams): string => {
    if (Object.keys(params).length === 0) return '';
    
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.append(key, value);
    });
    
    return urlParams.toString();
  };
  
  return (
    <UTMParamsContext.Provider value={{ utmParams, formatUtmParamsForUrl }}>
      {children}
    </UTMParamsContext.Provider>
  );
}

export const useUtmParams = () => useContext(UTMParamsContext);
