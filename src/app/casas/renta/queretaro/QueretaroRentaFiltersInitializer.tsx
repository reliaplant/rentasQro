'use client';

import { useEffect, useRef } from 'react';
import { useFilters } from '@/app/context/FilterContext';

export default function QueretaroRentaFiltersInitializer() {
  const { filters, updateFilter } = useFilters();
  const initialized = useRef(false);
  
  // Set filters for Queretaro rental properties on component mount - only once
  useEffect(() => {
    if (initialized.current) return;
    
    console.log('Initializing Queretaro rental filters - starting with:', filters.transactionType);
    
    // Force transaction type first
    updateFilter('transactionType', 'renta');
    
    // Then set other filters after transaction type is applied
    setTimeout(() => {
      updateFilter('selectedZone', ''); // Empty to show all Queretaro zones
    //   updateFilter('propertyType', 'casa');
      
      // Update URL to reflect the filters
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('t', 'renta');
        window.history.pushState({}, '', url);
      }
      
      console.log('Queretaro rental filters initialized - transaction type now:', filters.transactionType);
    }, 0);
    
    initialized.current = true;
  }, [filters.transactionType, updateFilter]);
  
  // This component doesn't render anything
  return null;
}
