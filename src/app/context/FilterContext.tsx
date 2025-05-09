'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { ZoneData } from '../shared/interfaces';

// Add this line somewhere near the top of the file
export const MAX_PRICE = 50000;

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
}

// Create context interface
interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

// Create the context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

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
};

// Provider component
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Function to update a single filter
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Function to reset all filters
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilter, resetFilters }}>
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
