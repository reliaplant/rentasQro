'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import FilterExplorador from '../../components/filterExplorador';
import { useFilters } from '../../context/FilterContext';

interface MobileFiltersProps {
  onClose: () => void;
}

export default function MobileFilters({ onClose }: MobileFiltersProps) {
  const { filters } = useFilters();

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium">Filtros</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Cerrar filtros"
        >
          <FaTimes className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-4">
        <FilterExplorador />
      </div>
      
      <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
        <button
          onClick={onClose}
          className="w-full py-3 text-white font-medium bg-violet-600 rounded-lg hover:bg-violet-700 shadow-sm"
        >
          Ver {filters.transactionType === 'renta' ? 'propiedades en renta' : 'propiedades en venta'}
        </button>
      </div>
    </div>
  );
}
