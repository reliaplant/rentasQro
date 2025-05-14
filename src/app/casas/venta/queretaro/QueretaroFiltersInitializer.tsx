'use client';

import { useEffect, useRef } from 'react';
import { useFilters } from '@/app/context/FilterContext';

export default function QueretaroFiltersInitializer() {
  const { updateFilter } = useFilters();
  const initialized = useRef(false);
  
  // Set filters for Queretaro properties on component mount - only once
  useEffect(() => {
    if (initialized.current) return;
    
    console.log('Initializing Queretaro filters');
    
    // Set filters to show houses for sale in Queretaro
    updateFilter('transactionType', 'compra');
    // updateFilter('propertyType', 'casa');
    
    // Update URL to reflect the filters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('t', 'compra');
      window.history.pushState({}, '', url);
    }
    
    initialized.current = true;
  }, [updateFilter]);
  
  // This component doesn't render anything
  return null;
}
