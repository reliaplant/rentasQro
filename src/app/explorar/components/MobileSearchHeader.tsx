'use client';

import React, { useState } from 'react';
import { useFilters } from '../../context/FilterContext';
import { FaSlidersH, FaTimes, FaCheck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Define property type interface
interface PropertyType {
  id: string;
  label: string;
}

// Define property types array
const propertyTypes: PropertyType[] = [
  { id: 'casa', label: 'Casa' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'terreno', label: 'Terreno' },
  { id: 'local', label: 'Local' }
];

const MobileSearchHeader = () => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const router = useRouter();
  
  // For price range inputs
  const [minPrice, setMinPrice] = useState(filters.priceRange[0] > 0 ? filters.priceRange[0].toString() : '');
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1] < 1000000000 ? filters.priceRange[1].toString() : '');
  
  // Count applied filters for the badge
  const countAppliedFilters = () => {
    let count = 0;
    if (filters.selectedZone) count++;
    if (filters.propertyType) count++;
    if (filters.preventa) count++;
    if (filters.bedrooms !== null) count++;
    if (filters.bathrooms !== null) count++;
    if (filters.parkingSpots !== null) count++;
    if (filters.isFurnished) count++;
    if (filters.petsAllowed) count++;
    if (filters.priceRange[0] > 0) count++;
    if (filters.priceRange[1] < 1000000000) count++;
    return count;
  };

  const appliedFiltersCount = countAppliedFilters();
  
  // Determine type of transaction to display
  const transactionText = filters.transactionType === 'renta' ? 'Renta' : 'Compra';
  
  // Check if filters are applied (besides transaction type)
  const hasFilters = appliedFiltersCount > 0;
  const filtersText = hasFilters ? 'Con filtros aplicados' : 'Sin filtros aplicados';

  // Fix: Handle transaction type change correctly
  const handleTransactionTypeChange = (type: 'compra' | 'renta') => {
    // Skip if already at this transaction type
    if (filters.transactionType === type) return;
    
    console.log(`MobileSearchHeader: Setting transaction type to ${type}`);
    
    // Only preserve certain filters when changing type, reset others
    const preservedFilters = {
      selectedZone: filters.selectedZone,
      propertyType: filters.propertyType,
      priceRange: filters.priceRange,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
      parkingSpots: filters.parkingSpots,
      currency: filters.currency
    };
    
    // Reset all filters first
    resetFilters(); 
    
    // Set transaction type
    updateFilter('transactionType', type);
    
    // Restore preserved filters
    if (preservedFilters.selectedZone) updateFilter('selectedZone', preservedFilters.selectedZone);
    if (preservedFilters.propertyType) updateFilter('propertyType', preservedFilters.propertyType);
    if (preservedFilters.bedrooms !== null) updateFilter('bedrooms', preservedFilters.bedrooms);
    if (preservedFilters.bathrooms !== null) updateFilter('bathrooms', preservedFilters.bathrooms);
    if (preservedFilters.parkingSpots !== null) updateFilter('parkingSpots', preservedFilters.parkingSpots);
    updateFilter('priceRange', preservedFilters.priceRange);
    updateFilter('currency', preservedFilters.currency);
    
    // Ensure preventa is false for renta
    if (type === 'renta') {
      updateFilter('preventa', false);
      updateFilter('isFurnished', false);
      updateFilter('petsAllowed', false);
    }
    
    // Update URL
    router.push(`/explorar?t=${type}`);
  };
  
  // Handle property type selection with proper type annotation
  const handlePropertyTypeChange = (type: string) => {
    if (filters.propertyType === type) {
      // Deselect if already selected
      updateFilter('propertyType', '');
    } else {
      updateFilter('propertyType', type);
    }
  };
  
  // Handle applying price filter
  const applyPriceFilter = () => {
    const min = minPrice ? parseInt(minPrice, 10) : 0;
    const max = maxPrice ? parseInt(maxPrice, 10) : 1000000000;
    updateFilter('priceRange', [min, max]);
  };

  return (
    <>
      <div className="md:hidden sticky top-16 z-40 pt-3 px-4">
        <div className="bg-white shadow-sm rounded-xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900 line-clamp-1">
                Inmuebles en Querétaro
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {transactionText} · {filtersText}
              </p>
            </div>
            <button 
              aria-label="Filtros"
              onClick={() => setIsFilterModalOpen(true)}
              className="ml-3 p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors relative"
            >
              <FaSlidersH className="w-4 h-4 text-gray-700" />
              {appliedFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {appliedFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen filter modal with organized sections */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-white z-[9999] md:hidden">
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Cerrar modal"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter content - scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 1. Transaction Type - Compra/Renta */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tipo de operación</h3>
                <div className="flex bg-gray-50 rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => handleTransactionTypeChange('compra')}
                    className={`flex-1 py-2 text-sm font-medium transition-all duration-200 rounded-md
                      ${filters.transactionType === 'compra'
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : 'text-gray-500 hover:text-violet-600'}`}
                  >
                    Comprar
                  </button>
                  <button
                    onClick={() => handleTransactionTypeChange('renta')}
                    className={`flex-1 py-2 text-sm font-medium transition-all duration-200 rounded-md
                      ${filters.transactionType === 'renta'
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : 'text-gray-500 hover:text-violet-600'}`}
                  >
                    Rentar
                  </button>
                </div>
              </div>
              
              {/* 2. Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Rango de precio ({filters.currency})</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Sin límite"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="mt-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200"
                >
                  Aplicar precio
                </button>
              </div>
              
              {/* 3. Property Type */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tipo de inmueble</h3>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handlePropertyTypeChange(type.id)}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium text-left
                        flex items-center justify-between
                        ${filters.propertyType === type.id
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                      `}
                    >
                      <span>{type.label}</span>
                      {filters.propertyType === type.id && <FaCheck className="w-3.5 h-3.5 text-violet-600" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 4. Bedrooms */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recámaras</h3>
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (filters.bedrooms === (num === 3 ? 3 : num)) {
                          updateFilter('bedrooms', null);
                        } else {
                          updateFilter('bedrooms', num === 3 ? 3 : num);
                        }
                      }}
                      className={`
                        flex-1 py-2 text-sm font-medium rounded-md
                        ${filters.bedrooms === (num === 3 ? 3 : num)
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                      `}
                    >
                      {num === 3 ? '3+' : num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 5. Parking */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Estacionamientos</h3>
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (filters.parkingSpots === (num === 3 ? 3 : num)) {
                          updateFilter('parkingSpots', null);
                        } else {
                          updateFilter('parkingSpots', num === 3 ? 3 : num);
                        }
                      }}
                      className={`
                        flex-1 py-2 text-sm font-medium rounded-md
                        ${filters.parkingSpots === (num === 3 ? 3 : num)
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                      `}
                    >
                      {num === 3 ? '3+' : num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 6. Bathrooms */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Baños</h3>
                <div className="flex gap-2">
                  {[1, 2].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (filters.bathrooms === (num === 2 ? 2 : num)) {
                          updateFilter('bathrooms', null);
                        } else {
                          updateFilter('bathrooms', num === 2 ? 2 : num);
                        }
                      }}
                      className={`
                        flex-1 py-2 text-sm font-medium rounded-md
                        ${filters.bathrooms === (num === 2 ? 2 : num)
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                      `}
                    >
                      {num === 2 ? '2+' : num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 7. Availability (only for compra) */}
              {filters.transactionType === 'compra' && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Disponibilidad</h3>
                  <button
                    onClick={() => updateFilter('preventa', !filters.preventa)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium w-full text-left
                      flex items-center justify-between
                      ${filters.preventa
                        ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                        : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                    `}
                  >
                    <span>Preventa</span>
                    {filters.preventa && <FaCheck className="w-4 h-4 text-violet-600" />}
                  </button>
                </div>
              )}
              
              {/* 8. Additional filters for renta */}
              {filters.transactionType === 'renta' && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Características</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => updateFilter('isFurnished', !filters.isFurnished)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium w-full text-left
                        flex items-center justify-between
                        ${filters.isFurnished
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                      `}
                    >
                      <span>Amueblado</span>
                      {filters.isFurnished && <FaCheck className="w-4 h-4 text-violet-600" />}
                    </button>
                    <button
                      onClick={() => updateFilter('petsAllowed', !filters.petsAllowed)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium w-full text-left
                        flex items-center justify-between
                        ${filters.petsAllowed
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75'}
                      `}
                    >
                      <span>Acepta mascotas</span>
                      {filters.petsAllowed && <FaCheck className="w-4 h-4 text-violet-600" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with action buttons */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    resetFilters();
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 py-3 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileSearchHeader;
