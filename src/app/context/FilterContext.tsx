'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ZoneData } from '../shared/interfaces';

// Update this line to use a much higher value
export const MAX_PRICE = 1000000000; // 1 billion

// Define types for filters - add preventaFilterActive to track explicit filtering
export interface FilterState {
  transactionType: 'renta' | 'compra' | '';
  selectedZone: string;
  priceRange: [number, number];
  bedrooms: number | null;
  bathrooms: number | null;
  isFurnished: boolean;
  petsAllowed: boolean;
  parkingSpots: number | null;
  currency: 'MXN' | 'USD'; 
  propertyType: string;
  selectedCondo: string;
  preventa: boolean; // True for preventa properties, false for immediate
  preventaFilterActive: boolean; // New field: true when we're explicitly filtering by preventa
}

// Define filter action interface
type FilterAction = {
  type: 'UPDATE_FILTER';
  payload: {
    key: keyof FilterState;
    value: any;
  };
} | {
  type: 'RESET_FILTERS';
};

// Create context interface
interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

// Default filter values
const defaultFilters: FilterState = {
  transactionType: 'compra',
  selectedZone: '',
  priceRange: [0, MAX_PRICE],
  bedrooms: null,
  bathrooms: null,
  isFurnished: false,
  petsAllowed: false,
  parkingSpots: null,
  currency: 'MXN', // Default to MXN
  propertyType: '', // Empty string means all property types
  selectedCondo: '', // Initialize with empty string
  preventa: false, // Default to false (not preventa)
  preventaFilterActive: false, // Default to false (no explicit filter)
};

// Create the context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Reducer function
const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'UPDATE_FILTER':
      const newState = {
        ...state,
        [action.payload.key]: action.payload.value,
      };
      
      // Save to localStorage whenever filter changes
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('propertyFilters', JSON.stringify(newState));
        }
      } catch (e) {
        console.error('Error saving filters to localStorage:', e);
      }
      
      return newState;
      
    case 'RESET_FILTERS':
      // Clear localStorage when resetting
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('propertyFilters');
        }
      } catch (e) {
        console.error('Error removing filters from localStorage:', e);
      }
      
      return defaultFilters;
      
    default:
      return state;
  }
};

// Provider component
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, dispatch] = useReducer(filterReducer, defaultFilters);
  const [initialized, setInitialized] = useState(false);
  const searchParams = useSearchParams();
  
  // Get transaction type from URL without using window
  const getURLTransactionType = useCallback(() => {
    if (!searchParams) return null;
    const transactionType = searchParams.get('t');
    return transactionType === 'renta' || transactionType === 'compra' ? transactionType : null;
  }, [searchParams]);
  
  // Enhanced function to check URL params for all relevant filters
  const checkURLForParams = useCallback(() => {
    let updated = false;

    // Only handle URL parameters for initial page load or explicit navigation,
    // don't reset filters just because a parameter isn't in the URL
    const transactionType = searchParams?.get('t');
    if ((transactionType === 'renta' || transactionType === 'compra') && 
        transactionType !== filters.transactionType) {
      console.log(`Setting transaction type from URL: ${transactionType}`);
      
      // If changing to renta, always set preventa to false
      if (transactionType === 'renta' && filters.preventa) {
        dispatch({
          type: 'UPDATE_FILTER',
          payload: { 
            key: 'preventa',
            value: false
          },
        });
      }
      
      dispatch({
        type: 'UPDATE_FILTER',
        payload: { 
          key: 'transactionType',
          value: transactionType
        },
      });
      updated = true;
    }
    
    // Check for preventa parameter - only set it if explicitly present
    const preventa = searchParams?.get('preventa');
    if (preventa === 'true' && !filters.preventa) {
      console.log(`Setting preventa to true from URL`);
      dispatch({
        type: 'UPDATE_FILTER',
        payload: { 
          key: 'preventa',
          value: true
        },
      });
      updated = true;
    }
    
    // Check for property type
    const propertyType = searchParams?.get('propertyType');
    if (propertyType && propertyType !== filters.propertyType) {
      console.log(`Setting property type from URL: ${propertyType}`);
      dispatch({
        type: 'UPDATE_FILTER',
        payload: { 
          key: 'propertyType',
          value: propertyType
        },
      });
      updated = true;
    }
    
    return updated;
  }, [filters.transactionType, filters.preventa, filters.propertyType, searchParams]);

  // Initialize filters once on client-side
  useEffect(() => {
    if (initialized) return;
    
    // First check URL params which take precedence
    const foundUrlParam = checkURLForParams();
    
    // Then try to load from localStorage (only on client)
    if (typeof window !== 'undefined') {
      try {
        const savedFilters = localStorage.getItem('propertyFilters');
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          
          // Update each filter individually to ensure type safety
          Object.keys(parsedFilters).forEach((key) => {
            // Skip transaction type if we already set it from URL
            if (key === 'transactionType' && foundUrlParam) {
              return;
            }
            
            if (key in defaultFilters) {
              dispatch({
                type: 'UPDATE_FILTER',
                payload: {
                  key: key as keyof FilterState,
                  value: parsedFilters[key],
                },
              });
            }
          });
        }
      } catch (e) {
        console.error('Error loading filters from localStorage:', e);
      }
    }
    
    setInitialized(true);
  }, [checkURLForParams, initialized]);

  // Watch for URL parameter changes
  useEffect(() => {
    if (!initialized) return;
    
    // Check for URL parameter changes
    checkURLForParams();
  }, [searchParams, checkURLForParams, initialized]);

  // Add effect to ensure preventa is false when transaction type is renta
  useEffect(() => {
    // Only force reset preventa if transaction type is renta and 
    // preventa was previously set to true
    if (filters.transactionType === 'renta' && filters.preventa) {
      console.log('FilterContext: Forcing preventa to false because transaction type is renta');
      
      // Don't dispatch immediately to avoid race conditions
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_FILTER',
          payload: { 
            key: 'preventa',
            value: false
          },
        });
      }, 0);
    }
  }, [filters.transactionType]); // Only run when transaction type changes, not when preventa changes

  // Add debug logging for filter updates
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    // Log transaction type changes for debugging
    if (key === 'transactionType') {
      console.log(`FilterContext: Updating transaction type from ${filters.transactionType} to ${value}`);
    }
    
    dispatch({
      type: 'UPDATE_FILTER',
      payload: { key, value },
    });
  };

  // Function to reset all filters
  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook to use the filter context
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
