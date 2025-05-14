'use client';

import { useEffect, useRef } from 'react';
import { useFilters } from '@/app/context/FilterContext';

export default function ZibataRentaFiltersInitializer() {
  const { filters, updateFilter } = useFilters();
  const initialized = useRef(false);
  
  // Set filters for Zibata rental properties on component mount - only once
  useEffect(() => {
    if (initialized.current) return;
    
    console.log('Initializing Zibata rental filters - starting with:', filters.transactionType);
    
    // Force transaction type first to ensure other updates don't override it
    updateFilter('transactionType', 'renta');
    
    // Then set other filters
    setTimeout(() => {
      updateFilter('selectedZone', 'X5oWujYupjRKx0tF8Hlj'); // Use actual Zibata zone ID
    //   updateFilter('propertyType', 'casa');
      
      // Update URL to reflect the filters
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('t', 'renta');
        window.history.pushState({}, '', url);
      }
      
      console.log('Zibata rental filters initialized - transaction type now:', filters.transactionType);
    }, 0);
    
    initialized.current = true;
  }, [updateFilter, filters.transactionType]);
  
  // This component doesn't render anything
  return null;
}
