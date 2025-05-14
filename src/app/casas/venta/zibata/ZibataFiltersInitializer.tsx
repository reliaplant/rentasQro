'use client';

import { useEffect, useRef } from 'react';
import { useFilters } from '@/app/context/FilterContext';

export default function ZibataFiltersInitializer() {
  const { updateFilter } = useFilters();
  const initialized = useRef(false);
  
  // Set filters for Zibata properties on component mount - only once
  useEffect(() => {
    if (initialized.current) return;
    
    console.log('Initializing Zibata filters');
    
    // Set filters to show Zibata houses for sale
    updateFilter('selectedZone', 'X5oWujYupjRKx0tF8Hlj'); // Use actual Zibata zone ID
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
