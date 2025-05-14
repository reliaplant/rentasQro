'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { ZoneData } from '../shared/interfaces';

// Update this line to use a much higher value
export const MAX_PRICE = 1000000000; // 1 billion

// Define types for filters
export interface FilterState {
  transactionType: 'renta' | 'compra' | '';
  selectedZone: string;
  priceRange: [number, number];
  bedrooms: number | null;
  bathrooms: number | null;
  isFurnished: boolean;
  petsAllowed: boolean;
  parkingSpots: number | null;
  currency: 'MXN' | 'USD'; // New currency property
  propertyType: string; // Add propertyType filter
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

  // Load saved filters from localStorage on initial render
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedFilters = localStorage.getItem('propertyFilters');
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          
          // Update each filter individually to ensure type safety
          Object.keys(parsedFilters).forEach((key) => {
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
      }
    } catch (e) {
      console.error('Error loading filters from localStorage:', e);
    }
  }, []);

  // Function to update a single filter
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
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
