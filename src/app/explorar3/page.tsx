'use client';

import { useEffect, useRef } from 'react';
import FilterExplorador from '../components/filterExplorador';
import Explorador from '../components/explorador';
import { useSearchParams } from 'next/navigation';
import { useFilters } from '../context/FilterContext';

export default function ExplorarPage() {
  const searchParams = useSearchParams();
  const { filters, updateFilter } = useFilters();
  
  // Use ref to ensure we only update on mount
  const hasInitializedRef = useRef(false);
  
  // Apply transaction type from URL if present - with safety check to prevent loops
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    const transactionType = searchParams?.get('t');
    
    if ((transactionType === 'renta' || transactionType === 'compra') && 
        transactionType !== filters.transactionType) {
      console.log(`ExplorarPage: Setting transaction type: ${transactionType}`);
      updateFilter('transactionType', transactionType);
    }
    
    hasInitializedRef.current = true;
  }, []);
  
  return (
    <main className="min-h-screen">
      <FilterExplorador />
      <Explorador />
    </main>
  );
}