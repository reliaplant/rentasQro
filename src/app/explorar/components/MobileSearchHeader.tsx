'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFilters } from '../../context/FilterContext';
import { FaSlidersH, FaTimes, FaCheck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Define property type interface
interface PropertyType {
  id: string;
  label: string;
}

// Define property types array - removed 'local'
const propertyTypes: PropertyType[] = [
  { id: 'casa', label: 'Casa' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'terreno', label: 'Terreno' }
];

// Updated to accept isOpen and onClose props
interface MobileSearchHeaderProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MobileSearchHeader = ({ isOpen = false, onClose }: MobileSearchHeaderProps) => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(isOpen);
  const [menuIsVisible, setMenuIsVisible] = useState(true);
  const router = useRouter();
  
  // For price range inputs
  const [minPrice, setMinPrice] = useState(filters.priceRange[0] > 0 ? filters.priceRange[0].toString() : '');
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1] < 1000000000 ? filters.priceRange[1].toString() : '');
  
  // Add a separate state for tracking preventa in the UI to prevent race conditions
  const [localPreventa, setLocalPreventa] = useState(filters.preventa);
  
  // Add a ref to track if a preventa update is in progress
  const preventaUpdateInProgress = useRef(false);
  
  // Add state for tracking active preventa filter
  const [isPreventaFilterActive, setIsPreventaFilterActive] = useState(filters.preventaFilterActive);
  
  // Keep local state in sync with context
  useEffect(() => {
    if (!preventaUpdateInProgress.current) {
      setLocalPreventa(filters.preventa);
      setIsPreventaFilterActive(filters.preventaFilterActive);
    }
  }, [filters.preventa, filters.preventaFilterActive]);
  
  // Debug logging
  useEffect(() => {
    console.log(`MobileSearchHeader: Local preventa is now: ${localPreventa}, IsActive: ${isPreventaFilterActive}, Context preventa is: ${filters.preventa}`);
  }, [localPreventa, isPreventaFilterActive, filters.preventa]);

  // Count applied filters for the badge
  const countAppliedFilters = () => {
    let count = 0;
    if (filters.selectedZone) count++;
    if (filters.propertyType) count++;
    if (filters.preventaFilterActive) count++; // Count only if filter is active
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

  // Fix: Handle transaction type change correctly without resetting filters
  const handleTransactionTypeChange = (type: 'compra' | 'renta') => {
    // Skip if already at this transaction type
    if (filters.transactionType === type) return;
    
    console.log(`MobileSearchHeader: Setting transaction type to ${type}`);

    // Don't reset all filters, just update the transaction type
    updateFilter('transactionType', type);
    
    // If changing to renta, ensure preventa is false
    if (type === 'renta') {
      updateFilter('preventa', false);
    }
  };
  
  // Handle property type selection
  const handlePropertyTypeChange = (type: string) => {
    if (filters.propertyType === type) {
      // Deselect if already selected
      updateFilter('propertyType', '');
    } else {
      updateFilter('propertyType', type);
    }
  };

  // Get the appropriate value for the availability dropdown
  const getAvailabilitySelectValue = () => {
    if (!isPreventaFilterActive) return "all";
    return localPreventa ? "preventa" : "inmediata";
  };

  // Updated handler for the availability toggle with chips UI
  const handleAvailabilityChange = (value: string) => {
    console.log(`MobileSearchHeader: User selected availability: ${value}`);
    
    // Prevent race conditions by marking an update in progress
    preventaUpdateInProgress.current = true;
    
    if (value === "all") {
      // "All" selected - disable active filtering
      setLocalPreventa(false);
      setIsPreventaFilterActive(false);
      updateFilter('preventa', false);
      updateFilter('preventaFilterActive', false);
    } else if (value === "preventa") {
      // If preventa is already active, toggle it off
      if (isPreventaFilterActive && localPreventa) {
        setLocalPreventa(false);
        setIsPreventaFilterActive(false);
        updateFilter('preventa', false);
        updateFilter('preventaFilterActive', false);
      } else {
        // Otherwise, enable preventa
        setLocalPreventa(true);
        setIsPreventaFilterActive(true);
        updateFilter('preventa', true);
        updateFilter('preventaFilterActive', true);
      }
    } else if (value === "inmediata") {
      // If inmediata is already active, toggle it off
      if (isPreventaFilterActive && !localPreventa) {
        setLocalPreventa(false);
        setIsPreventaFilterActive(false);
        updateFilter('preventa', false);
        updateFilter('preventaFilterActive', false);
      } else {
        // Otherwise, enable inmediata
        setLocalPreventa(false);
        setIsPreventaFilterActive(true);
        updateFilter('preventa', false);
        updateFilter('preventaFilterActive', true);
      }
    }
    
    // Set a small timeout before allowing synchronization again
    setTimeout(() => {
      preventaUpdateInProgress.current = false;
    }, 50);
  };
  
  // Handle applying price filter
  const applyPriceFilter = () => {
    const min = minPrice ? parseInt(minPrice, 10) : 0;
    const max = maxPrice ? parseInt(maxPrice, 10) : 1000000000;
    updateFilter('priceRange', [min, max]);
  };

  // Track the menu's visibility by checking its transform
  useEffect(() => {
    const checkMenuVisibility = () => {
      const menuElement = document.querySelector('nav');
      if (menuElement) {
        const style = window.getComputedStyle(menuElement);
        const transform = style.getPropertyValue('transform');
        const isHidden = transform.includes('matrix') && transform.includes('-');
        setMenuIsVisible(!isHidden);
      }
    };

    // Check visibility on scroll events
    window.addEventListener('scroll', checkMenuVisibility);
    
    // Initial check
    checkMenuVisibility();
    
    return () => {
      window.removeEventListener('scroll', checkMenuVisibility);
    };
  }, []);

  // Update isFilterModalOpen when isOpen prop changes
  useEffect(() => {
    setIsFilterModalOpen(isOpen);
  }, [isOpen]);

  // Handle modal close
  const handleClose = () => {
    setIsFilterModalOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      {/* We only want the modal part, not the header */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-white z-[9999] md:hidden">
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button 
                onClick={handleClose} 
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Cerrar modal"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter content - scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 1. Transaction Type - Compra/Renta - now more compact and rounded */}
              <div className="mb-6">
                <div className="flex bg-gray-50/80 rounded-full p-0.5 shadow-inner">
                  <button
                    onClick={() => handleTransactionTypeChange('compra')}
                    className={`flex-1 py-1.5 text-sm font-medium transition-all duration-200 rounded-full
                      ${filters.transactionType === 'compra'
                        ? 'bg-violet-100 text-violet-700 shadow-sm ring-2 ring-violet-200'
                        : 'text-gray-500 hover:text-violet-600'}`}
                  >
                    Comprar
                  </button>
                  <button
                    onClick={() => handleTransactionTypeChange('renta')}
                    className={`flex-1 py-1.5 text-sm font-medium transition-all duration-200 rounded-full
                      ${filters.transactionType === 'renta'
                        ? 'bg-violet-100 text-violet-700 shadow-sm ring-2 ring-violet-200'
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
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        // Apply price filter automatically when input changes
                        const min = e.target.value ? parseInt(e.target.value, 10) : 0;
                        const max = maxPrice ? parseInt(maxPrice, 10) : 1000000000;
                        updateFilter('priceRange', [min, max]);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Sin límite"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        // Apply price filter automatically when input changes
                        const min = minPrice ? parseInt(minPrice, 10) : 0;
                        const max = e.target.value ? parseInt(e.target.value, 10) : 1000000000;
                        updateFilter('priceRange', [min, max]);
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 3. Property Type - Now with selectable chips */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tipo de inmueble</h3>
                <div className="flex overflow-x-auto pb-2 -mx-1 px-1">
                  <div className="flex space-x-2 flex-nowrap">
                    {propertyTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handlePropertyTypeChange(type.id)}
                        className={`
                          whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${filters.propertyType === type.id
                            ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                            : 'bg-gray-50/80 text-gray-700 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                        `}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 4. Availability - Now with two selectable chips */}
              {filters.transactionType === 'compra' && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Disponibilidad</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAvailabilityChange("inmediata")}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200 flex items-center justify-center gap-2
                        ${isPreventaFilterActive && !localPreventa
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                      `}
                    >
                      {isPreventaFilterActive && !localPreventa && <FaCheck className="w-4 h-4 text-violet-600" />}
                      Inmediata
                    </button>
                    <button
                      onClick={() => handleAvailabilityChange("preventa")}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200 flex items-center justify-center gap-2
                        ${isPreventaFilterActive && localPreventa
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-700 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                      `}
                    >
                      {isPreventaFilterActive && localPreventa && <FaCheck className="w-4 h-4 text-violet-600" />}
                      Preventa
                    </button>
                  </div>
                  {isPreventaFilterActive && (
                    <button
                      onClick={() => handleAvailabilityChange("all")}
                      className="mt-2 text-xs text-violet-600 font-medium flex items-center gap-1"
                    >
                      <FaTimes className="w-3 h-3" />
                      Quitar filtro
                    </button>
                  )}
                </div>
              )}
              
              {/* 5. Bedrooms */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recámaras</h3>
                <div className="flex items-center gap-2">
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
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        transition-all duration-200 cursor-pointer relative group
                        ${filters.bedrooms === (num === 3 ? 3 : num)
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
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
                <div className="flex items-center gap-2">
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
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        transition-all duration-200 cursor-pointer relative group
                        ${filters.bathrooms === (num === 2 ? 2 : num)
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                      `}
                    >
                      {num === 2 ? '2+' : num}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 7. Parking spots */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Estacionamientos</h3>
                <div className="flex items-center gap-2">
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
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                        transition-all duration-200 cursor-pointer relative group
                        ${filters.parkingSpots === (num === 3 ? 3 : num)
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                      `}
                    >
                      {num === 3 ? '3+' : num}
                    </button>
                  ))}
                </div>
              </div>
              
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
                    setLocalPreventa(false);
                    setIsPreventaFilterActive(false);
                    preventaUpdateInProgress.current = false; // Reset the flag
                  }}
                  className="flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => {
                    // Make sure the context is in sync with our local state before closing
                    if (localPreventa !== filters.preventa || isPreventaFilterActive !== filters.preventaFilterActive) {
                      updateFilter('preventa', localPreventa);
                      updateFilter('preventaFilterActive', isPreventaFilterActive);
                    }
                    handleClose();
                  }}
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
