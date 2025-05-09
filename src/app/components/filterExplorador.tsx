'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { FaBed, FaBath, FaCheck, FaCar, FaTimes } from 'react-icons/fa';
import { getZones } from '../shared/firebase';
import type { ZoneData } from '../shared/interfaces';
import { usePathname } from 'next/navigation';
import { useFilters } from '../context/FilterContext';

// Define MAX_PRICE constant locally
const MAX_PRICE = 50000;
const USD_TO_MXN_RATE = 20;

// Memoized select component for better performance
const ZoneSelect = memo(({ 
  selectedZone, 
  zones, 
  onChange 
}: { 
  selectedZone: string, 
  zones: ZoneData[], 
  onChange: (zone: string) => void 
}) => {
  return (
    <div className="relative w-28 sm:w-32">
      <select
        value={selectedZone}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full appearance-none rounded-full
          px-2.5 py-1.5 text-xs font-medium
          transition-all cursor-pointer
          ${selectedZone 
          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200' 
          : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
        `}
      >
        <option value="">Zonas</option>
        {zones.map((zone) => (
          <option 
            key={zone.id} 
            value={zone.id}
            className={selectedZone === zone.id ? '!text-violet-600' : ''}
          >
            {zone.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

ZoneSelect.displayName = 'ZoneSelect';

// Memoized numeric filter buttons for better performance
const NumericFilterButton = memo(({ 
  value, 
  currentValue, 
  onClick 
}: { 
  value: string | number, 
  currentValue: number | null, 
  onClick: () => void 
}) => {
  const isSelected = currentValue === (value === '3+' ? 3 : value === '2+' ? 2 : Number(value));
  
  return (
    <button
      onClick={onClick}
      className={`
        w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
        transition-all duration-200 cursor-pointer relative group
        ${isSelected
          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
          : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
      `}
    >
      <span className={isSelected ? 'group-hover:opacity-0' : ''}>
        {value}
      </span>
      {isSelected && (
        <FaTimes className="w-3 h-3 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </button>
  );
});

NumericFilterButton.displayName = 'NumericFilterButton';

const FilterExplorador = () => {
  const pathname = usePathname();
  const isExplorarPage = pathname === '/explorar';
  
  // Use the filter context
  const { filters, updateFilter } = useFilters();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');

  // Add local state for input values with lazy initialization
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Define types for numeric values
  type NumericValue = number | '2+' | '3+';

  // Update arrays with proper typing - moved outside component for better performance
  const bedroomOptions: NumericValue[] = [1, 2, '3+'];
  const bathroomOptions: NumericValue[] = [1, '2+'];
  const parkingOptions: NumericValue[] = [1, 2, '3+'];

  // Add isClient state to prevent hydration mismatch - this only needs to run once
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load zones data once
  useEffect(() => {
    let mounted = true;
    const loadZones = async () => {
      try {
        const zonesData = await getZones();
        if (mounted) {
          setZones(zonesData);
        }
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    
    loadZones();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Memoize format functions to prevent unnecessary re-creations
  const formatPrice = useCallback((value: number): string => {
    if (!value) return '';
    const displayValue = currency === 'USD' ? value / USD_TO_MXN_RATE : value;
    return new Intl.NumberFormat('es-MX').format(Math.round(displayValue));
  }, [currency]);

  const cleanNumberString = useCallback((str: string): number => {
    if (!str) return 0;
    const numericValue = Number(str.replace(/[^0-9]/g, ''));
    return currency === 'USD' ? numericValue * USD_TO_MXN_RATE : numericValue;
  }, [currency]);

  // Initialize input fields with formatted values when filters change
  useEffect(() => {
    if (filters.priceRange[0] > 0) {
      setMinPriceInput(formatPrice(filters.priceRange[0]));
    } else {
      setMinPriceInput('');
    }
    
    if (filters.priceRange[1] < MAX_PRICE) {
      setMaxPriceInput(formatPrice(filters.priceRange[1]));
    } else {
      setMaxPriceInput('');
    }
  }, [currency, filters.priceRange, formatPrice]);

  // Efecto para convertir los precios cuando cambia la moneda
  useEffect(() => {
    if (currency === 'USD') {
      updateFilter('priceRange', [
        Math.round(filters.priceRange[0] / USD_TO_MXN_RATE) * USD_TO_MXN_RATE,
        Math.round(filters.priceRange[1] / USD_TO_MXN_RATE) * USD_TO_MXN_RATE
      ]);
    }
  }, [currency, updateFilter, filters.priceRange]);

  // Force compra as default on first render
  useEffect(() => {
    // Only run once on mount
    if (filters.transactionType === 'renta') {
      updateFilter('transactionType', 'compra');
    }
  }, []); // Empty dependency array means it only runs once

  // Actualizar el tipo de transacción - memoized for better performance
  const handleTransactionTypeChange = useCallback((type: 'compra' | 'renta') => {
    updateFilter('transactionType', type);
  }, [updateFilter]);

  // Función helper actualizada para manejar la selección/deselección - memoized
  const handleNumericFilter = useCallback((
    value: NumericValue,
    currentValue: number | null,
    filterKey: 'bedrooms' | 'bathrooms' | 'parkingSpots'
  ) => {
    const numValue = value === '2+' ? 2 : value === '3+' ? 3 : Number(value);
    if (currentValue === numValue) {
      updateFilter(filterKey, null); // Deseleccionar si ya está seleccionado
    } else {
      updateFilter(filterKey, numValue);
    }
  }, [updateFilter]);

  // Handle min price input change - memoized
  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMinPriceInput(inputValue);
    
    // Clear the filter if input is empty
    if (!inputValue.trim()) {
      updateFilter('priceRange', [0, filters.priceRange[1]]);
      return;
    }
    
    // Only extract numbers and update the filter
    const value = cleanNumberString(inputValue);
    updateFilter('priceRange', [value, filters.priceRange[1]]);
  }, [cleanNumberString, updateFilter, filters.priceRange]);
  
  // Handle max price input change - memoized
  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMaxPriceInput(inputValue);
    
    // Clear the filter if input is empty - use imported MAX_PRICE
    if (!inputValue.trim()) {
      updateFilter('priceRange', [filters.priceRange[0], MAX_PRICE]);
      return;
    }
    
    // Only extract numbers and update the filter
    const value = cleanNumberString(inputValue);
    updateFilter('priceRange', [filters.priceRange[0], value]);
  }, [cleanNumberString, updateFilter, filters.priceRange]);

  // Memoized handler for zone selection
  const handleZoneChange = useCallback((zone: string) => {
    updateFilter('selectedZone', zone);
  }, [updateFilter]);

  // Memoized handler for toggling boolean filters
  const handleToggle = useCallback((key: 'isFurnished' | 'petsAllowed') => {
    updateFilter(key, !filters[key]);
  }, [updateFilter, filters]);

  // Move static styles outside component to avoid recreating them on each render
  const baseButtonStyles = `
    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
    hover:bg-violet-50 hover:ring-2 hover:ring-violet-200
  `;

  const selectedButtonStyles = `
    bg-violet-50 text-violet-700 ring-2 ring-violet-200
    shadow-sm shadow-violet-100
  `;

  const unselectedButtonStyles = `
    bg-gray-50/80 text-gray-600 hover:text-violet-600
    border border-gray-200/75
  `;

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-16 z-50 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="px-[5vw] py-1.5">
        {/* Make layout stack on mobile with space between elements */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 md:gap-0">
          {/* Texto a la izquierda más pequeño */}
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <span className="font-medium">Filtros</span>
            {!isExplorarPage && <div className="h-4 w-px bg-gray-200"></div>}
            {!isExplorarPage && <span>Encuentra la propiedad perfecta</span>}
          </div>

          {/* Scrollable container for filters on mobile */}
          <div className="overflow-x-auto pb-2 md:pb-0 -mx-[5vw] px-[5vw] md:mx-0 md:px-0">
            {/* All filters horizontally scrollable on mobile, wrapping on larger screens */}
            <div className="flex items-center gap-4 flex-nowrap md:flex-wrap min-w-max md:min-w-0">
              {/* Toggle Renta/Compra */}
              <div className="flex bg-gray-50/80 rounded-full p-0.5 shadow-inner">
                {['compra','renta' ].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTransactionTypeChange(type as 'compra' | 'renta' )}
                  className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                  cursor-pointer
                  ${filters.transactionType === type 
                    ? 'bg-violet-100 text-violet-700 shadow-sm ring-2 ring-violet-200' 
                    : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
                ))}
              </div>

              {/* Zona with memoized component */}
              {isClient && zones.length > 0 && (
                <ZoneSelect
                  selectedZone={filters.selectedZone}
                  zones={zones}
                  onChange={handleZoneChange}
                />
              )}

              {/* Precio - ajustes de tamaño */}
              {isClient && (
                <div className="flex items-center gap-2">
                {/* Selector de moneda más pequeño */}
                <div className="flex bg-gray-50/80 rounded-full p-0.5 shadow-inner">
                  {['MXN', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr as 'MXN' | 'USD')}
                    className={`
                    px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                    cursor-pointer
                    ${currency === curr
                      ? 'bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200'
                      : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}
                    `}
                    suppressHydrationWarning
                  >
                    {curr}
                  </button>
                  ))}
                </div>

                  {/* Inputs de precio más pequeños */}
                  <div className={`
                    flex items-center gap-2 rounded-full px-2.5 py-1.5
                    ${(filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE)
                      ? 'bg-violet-50 ring-2 ring-violet-200'
                      : 'bg-gray-50/80 border border-gray-200/75'}
                  `}>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Min"
                        className="w-14 sm:w-16 bg-transparent text-xs text-gray-600 placeholder-gray-400 focus:outline-none"
                        value={minPriceInput}
                        onChange={handleMinPriceChange}
                        onBlur={() => {
                          if (filters.priceRange[0] > 0) {
                            setMinPriceInput(formatPrice(filters.priceRange[0]));
                          }
                        }}
                        onFocus={(e) => {
                          const val = e.target.value;
                          e.target.value = '';
                          e.target.value = val;
                        }}
                      />
                      <span className="text-xs text-gray-500 ml-0.5" suppressHydrationWarning>{currency}</span>
                    </div>
                    
                    <div className="h-3.5 w-px bg-gray-200"></div>
                    
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Max"
                        className="w-14 sm:w-16 bg-transparent text-xs text-gray-600 placeholder-gray-400 focus:outline-none"
                        value={maxPriceInput}
                        onChange={handleMaxPriceChange}
                        onBlur={() => {
                          if (filters.priceRange[1] > 0 && filters.priceRange[1] < MAX_PRICE) {
                            setMaxPriceInput(formatPrice(filters.priceRange[1]));
                          }
                        }}
                        onFocus={(e) => {
                          const val = e.target.value;
                          e.target.value = '';
                          e.target.value = val;
                        }}
                      />
                      <span className="text-xs text-gray-500 ml-0.5" suppressHydrationWarning>{currency}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recámaras with memoized buttons */}
              <div className="flex items-center gap-2">
                <FaBed className="text-gray-400" />
                <div className="flex gap-2">
                  {bedroomOptions.map((num) => (
                    <NumericFilterButton
                      key={num}
                      value={num}
                      currentValue={filters.bedrooms}
                      onClick={() => handleNumericFilter(num, filters.bedrooms, 'bedrooms')}
                    />
                  ))}
                </div>
              </div>

              {/* Baños with memoized buttons */}
              <div className="flex items-center gap-2">
                <FaBath className="text-gray-400" />
                <div className="flex gap-2">
                  {bathroomOptions.map((num) => (
                    <NumericFilterButton
                      key={num}
                      value={num}
                      currentValue={filters.bathrooms}
                      onClick={() => handleNumericFilter(num, filters.bathrooms, 'bathrooms')}
                    />
                  ))}
                </div>
              </div>

              {/* Amueblado - Solo en /explorar */}
              {isExplorarPage && (
                <button
                onClick={() => handleToggle('isFurnished')}
                className={`
                  ${baseButtonStyles}
                  ${filters.isFurnished ? selectedButtonStyles : unselectedButtonStyles}
                  flex items-center gap-2 cursor-pointer
                `}
                >
                {filters.isFurnished && <FaCheck className="w-3 h-3 text-violet-600" />}
                Amueblado
                </button>
              )}

              {/* Mascotas - Solo en /explorar */}
              {isExplorarPage && (
                <button
                onClick={() => handleToggle('petsAllowed')}
                className={`
                  ${baseButtonStyles}
                  ${filters.petsAllowed ? selectedButtonStyles : unselectedButtonStyles}
                  flex items-center gap-2 cursor-pointer
                `}
                >
                {filters.petsAllowed && <FaCheck className="w-3 h-3 text-violet-600" />}
                Mascotas
                </button>
              )}

              {/* Estacionamientos with memoized buttons */}
              {isExplorarPage && (
                <div className="flex items-center gap-2">
                  <FaCar className="text-gray-400" />
                  <div className="flex gap-2">
                    {parkingOptions.map((num) => (
                      <NumericFilterButton
                        key={num}
                        value={num}
                        currentValue={filters.parkingSpots}
                        onClick={() => handleNumericFilter(num, filters.parkingSpots, 'parkingSpots')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterExplorador;
