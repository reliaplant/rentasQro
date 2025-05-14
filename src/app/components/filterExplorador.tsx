'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { FaBed, FaBath, FaCheck, FaCar, FaTimes } from 'react-icons/fa';
import { getZones } from '../shared/firebase';
import type { ZoneData } from '../shared/interfaces';
import { usePathname } from 'next/navigation';
import { useFilters } from '../context/FilterContext';
import { useExchangeRate } from '../hooks/useExchangeRate';

// Define MAX_PRICE constant with a much higher value
const MAX_PRICE = 1000000000; // 1 billion - effectively "no limit"
const USD_TO_MXN_RATE = 20; // Default exchange rate

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
  // Find the current zone name for display
  const selectedZoneName = selectedZone 
    ? zones.find(z => z.id === selectedZone)?.name || 'Zona'
    : 'Zonas';

  return (
    <div className="relative">
      {!selectedZone ? (
        // Standard dropdown when no zone is selected
        <div className="relative w-28 sm:w-32">
          <select
            value={selectedZone}
            onChange={(e) => onChange(e.target.value)}
            className={`
              w-full appearance-none rounded-full
              px-2.5 py-1.5 text-xs font-medium
              transition-all cursor-pointer
              bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200
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
      ) : (
        // Active filter with reset button
        <button
          onClick={() => onChange('')}
          className="flex items-center justify-between bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all"
        >
          <span>{selectedZoneName}</span>
          <FaTimes className="w-3 h-3 ml-2 text-violet-500 hover:scale-125 hover:text-violet-700 transition-all duration-200 cursor-pointer" />
        </button>
      )}
    </div>
  );
});

ZoneSelect.displayName = 'ZoneSelect';

// Add PropertyTypeSelect component
const PropertyTypeSelect = memo(({ 
  selectedType, 
  onChange 
}: { 
  selectedType: string, 
  onChange: (type: string) => void 
}) => {
  const propertyTypes = [
    { id: 'casa', name: 'Casa' },
    { id: 'departamento', name: 'Depa' },
    { id: 'terreno', name: 'Terreno' }
  ];
  
  // Find the current property type name for display
  const selectedTypeName = selectedType
    ? propertyTypes.find(t => t.id === selectedType)?.name || 'Tipo'
    : 'Tipo';

  return (
    <div className="relative">
      {!selectedType ? (
        // Standard dropdown when no property type is selected
        <div className="relative w-28 sm:w-32">
          <select
            value={selectedType}
            onChange={(e) => onChange(e.target.value)}
            className={`
              w-full appearance-none rounded-full
              px-2.5 py-1.5 text-xs font-medium
              transition-all cursor-pointer
              bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200
            `}
          >
            <option value="">Tipo</option>
            {propertyTypes.map((type) => (
              <option 
                key={type.id} 
                value={type.id}
                className={selectedType === type.id ? '!text-violet-600' : ''}
              >
                {type.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        // Active filter with reset button
        <button
          onClick={() => onChange('')}
          className="flex items-center justify-between bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all"
        >
          <span>{selectedTypeName}</span>
          <FaTimes className="w-3 h-3 ml-2 text-violet-500 hover:scale-125 hover:text-violet-700 transition-all duration-200 cursor-pointer" />
        </button>
      )}
    </div>
  );
});

PropertyTypeSelect.displayName = 'PropertyTypeSelect';

// Memoized numeric filter buttons for better performance
// Moving this BEFORE FilterExplorador to fix the TypeScript errors
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
  
  // State for price dropdown and temporary values
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  
  const [isClient, setIsClient] = useState(false);
  const { exchangeRate, convertMXNtoUSD, convertUSDtoMXN } = useExchangeRate();

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

  // Memoize format functions for price conversion
  const formatPrice = useCallback((value: number): string => {
    if (!value) return '';
    const displayValue = filters.currency === 'USD' ? convertMXNtoUSD(value) : value;
    return new Intl.NumberFormat('es-MX').format(Math.round(displayValue));
  }, [filters.currency, convertMXNtoUSD]);

  // Improved cleanNumberString function to handle millions and thousands better
  const cleanNumberString = useCallback((str: string): number => {
    if (!str) return 0;
    
    // Remove commas, spaces and other non-numeric characters, but allow decimals
    let numStr = str.replace(/[^\d.]/g, '');
    const numericValue = Number(numStr);
    
    // Handle currency conversion
    const convertedValue = filters.currency === 'USD' ? convertUSDtoMXN(numericValue) : numericValue;
    
    return convertedValue;
  }, [filters.currency, convertUSDtoMXN]);

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
  }, [filters.currency, filters.priceRange, formatPrice]);

  // Remove old exchange rate effect and use the new functions instead
  useEffect(() => {
    setMinPriceInput(filters.priceRange[0] > 0 ? formatPrice(filters.priceRange[0]) : '');
    setMaxPriceInput(filters.priceRange[1] < MAX_PRICE ? formatPrice(filters.priceRange[1]) : '');
  }, [filters.currency, filters.priceRange, formatPrice]);

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

  // Update the handler for currency toggle to use the context
  const handleCurrencyChange = useCallback((currency: 'MXN' | 'USD') => {
    updateFilter('currency', currency);
  }, [updateFilter]);

  // Memoized handler for property type selection
  const handlePropertyTypeChange = useCallback((propertyType: string) => {
    updateFilter('propertyType', propertyType);
  }, [updateFilter]);

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

  // Enhanced price range display with proper formatting for large numbers
  const formatPriceRangeForDisplay = useCallback(() => {
    const hasMinPrice = filters.priceRange[0] > 0;
    const hasMaxPrice = filters.priceRange[1] < MAX_PRICE;
    
    if (hasMinPrice && hasMaxPrice) {
      return `${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`;
    } else if (hasMinPrice) {
      return `Desde ${formatPrice(filters.priceRange[0])}`;
    } else if (hasMaxPrice) {
      return `Hasta ${formatPrice(filters.priceRange[1])}`;
    }
    return 'Precio';
  }, [filters.priceRange, formatPrice]);

  // Apply price filter when button is clicked - update for better handling of large numbers
  const applyPriceFilter = () => {
    const minPrice = tempMinPrice.trim() ? cleanNumberString(tempMinPrice) : 0;
    
    // Handle max price with proper validation
    let maxPrice = MAX_PRICE;
    if (tempMaxPrice.trim()) {
      maxPrice = cleanNumberString(tempMaxPrice);
      
      // Validate the max price - ensure it's a positive value
      if (maxPrice <= 0) {
        maxPrice = MAX_PRICE;
      }
      
      // Make sure min price doesn't exceed max price
      if (minPrice > 0 && minPrice >= maxPrice) {
        // If min price is greater than max price, set max price to a reasonable multiple
        maxPrice = Math.max(minPrice * 1.5, minPrice + 1000000);
      }
    }
    
    // Log the values for debugging
    console.log("Applying price filter:", { 
      minPrice,
      maxPrice,
      currency: filters.currency
    });
    
    // Update the filter with validated values
    updateFilter('priceRange', [minPrice, maxPrice]);
    
    // Update the displayed values
    setMinPriceInput(minPrice > 0 ? formatPrice(minPrice) : '');
    setMaxPriceInput(maxPrice < MAX_PRICE ? formatPrice(maxPrice) : '');
    
    // Close the dropdown
    setIsPriceDropdownOpen(false);
  };

  // Clear price filter
  const clearPriceFilter = () => {
    updateFilter('priceRange', [0, MAX_PRICE]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setTempMinPrice('');
    setTempMaxPrice('');
    setIsPriceDropdownOpen(false);
  };

  // Initialize the price inputs when the component mounts or filters change
  useEffect(() => {
    if (filters.priceRange[0] > 0) {
      setMinPriceInput(formatPrice(filters.priceRange[0]));
      setTempMinPrice(formatPrice(filters.priceRange[0]));
    } else {
      setMinPriceInput('');
      setTempMinPrice('');
    }
    
    if (filters.priceRange[1] < MAX_PRICE) {
      setMaxPriceInput(formatPrice(filters.priceRange[1]));
      setTempMaxPrice(formatPrice(filters.priceRange[1]));
    } else {
      setMaxPriceInput('');
      setTempMaxPrice('');
    }
  }, [filters.currency, filters.priceRange, formatPrice]);

  // Add ref for price dropdown
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setIsPriceDropdownOpen(false);
      }
    };

    if (isPriceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPriceDropdownOpen]);

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-16 z-40 transition-all duration-300 shadow-sm hover:shadow-md">
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

              {/* Property Type filter - Add right after Zona */}
              {isClient && (
                <PropertyTypeSelect
                  selectedType={filters.propertyType}
                  onChange={handlePropertyTypeChange}
                />
              )}

              {/* Precio - ajustes de tamaño */}
              {isClient && (
                <div className="relative" ref={priceDropdownRef}>
                  {/* Price Button */}
                  <button
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                    className={`
                      flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${(filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE)
                        ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                        : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                    `}
                  >
                    <span>{formatPriceRangeForDisplay()}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${isPriceDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Price Dropdown with improved visibility */}
                  {isPriceDropdownOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto md:fixed md:inset-auto md:absolute">
                      <div className="flex min-h-full items-center justify-center md:items-start md:justify-start">
                        {/* Overlay for mobile - helps with visibility */}
                        <div className="fixed inset-0 bg-black bg-opacity-25 md:hidden" onClick={() => setIsPriceDropdownOpen(false)} />
                        
                        {/* Actual dropdown content */}
                        <div className="bg-white rounded-lg shadow-xl w-[90vw] md:w-72 m-4 md:m-0 md:mt-2 md:shadow-lg relative md:left-0 md:right-auto">
                          <div className="p-4">
                            {/* Header with close button for mobile */}
                            <div className="flex justify-between items-center mb-4 md:hidden">
                              <h3 className="text-sm font-medium text-gray-900">Filtro de precio</h3>
                              <button onClick={() => setIsPriceDropdownOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                                <FaTimes className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                            
                            {/* Currency Selector */}
                            <div className="flex bg-gray-50/80 rounded-full p-0.5 shadow-inner mb-4 w-min">
                              {['MXN', 'USD'].map((curr) => (
                                <button
                                  key={curr}
                                  onClick={() => handleCurrencyChange(curr as 'MXN' | 'USD')}
                                  className={`
                                    px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                                    cursor-pointer
                                    ${filters.currency === curr
                                      ? 'bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200'
                                      : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}
                                  `}
                                >
                                  {curr}
                                </button>
                              ))}
                            </div>

                            {/* Min Price Input */}
                            <div className="mb-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Precio mínimo</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Mínimo"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                                  value={tempMinPrice}
                                  onChange={(e) => setTempMinPrice(e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  {filters.currency}
                                </span>
                              </div>
                            </div>

                            {/* Max Price Input */}
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Precio máximo</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Máximo"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                                  value={tempMaxPrice}
                                  onChange={(e) => setTempMaxPrice(e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  {filters.currency}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={clearPriceFilter}
                                className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Limpiar
                              </button>
                              <button
                                onClick={applyPriceFilter}
                                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors"
                              >
                                Aplicar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
