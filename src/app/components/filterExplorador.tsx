'use client';

import { useState, useEffect } from 'react';
import { FaBed, FaBath, FaCheck, FaCar, FaTimes } from 'react-icons/fa';
import { getZones } from '../shared/firebase';
import type { ZoneData } from '../shared/interfaces';
import { usePathname } from 'next/navigation';
import { useFilters, MAX_PRICE } from '../context/FilterContext';

const FilterExplorador = () => {
  const pathname = usePathname();
  const isExplorarPage = pathname === '/explorar';
  
  // Use the filter context
  const { filters, updateFilter } = useFilters();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');
  const USD_TO_MXN_RATE = 20;

  // Add local state for input values
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  // Define types for numeric values
  type NumericValue = number | '2+' | '3+';

  // Update arrays with proper typing
  const bedroomOptions: NumericValue[] = [1, 2, '3+'];
  const bathroomOptions: NumericValue[] = [1, '2+'];
  const parkingOptions: NumericValue[] = [1, 2, '3+'];

  useEffect(() => {
    const loadZones = async () => {
      const zonesData = await getZones();
      setZones(zonesData);
    };
    loadZones();
  }, []);

  // Función para formatear números según la moneda (without adding currency suffix)
  const formatPrice = (value: number): string => {
    if (!value) return '';
    const displayValue = currency === 'USD' ? value / USD_TO_MXN_RATE : value;
    return new Intl.NumberFormat('es-MX').format(Math.round(displayValue));
  };

  // Función para "limpiar" el string formateado y obtener solo números
  const cleanNumberString = (str: string): number => {
    if (!str) return 0;
    const numericValue = Number(str.replace(/[^0-9]/g, ''));
    return currency === 'USD' ? numericValue * USD_TO_MXN_RATE : numericValue;
  };

  // Initialize input fields with formatted values when filters change
  useEffect(() => {
    if (filters.priceRange[0] > 0) {
      setMinPriceInput(formatPrice(filters.priceRange[0]));
    } else {
      setMinPriceInput('');
    }
    
    // Use MAX_PRICE constant instead of hardcoded 50000
    if (filters.priceRange[1] < MAX_PRICE) {
      setMaxPriceInput(formatPrice(filters.priceRange[1]));
    } else {
      setMaxPriceInput('');
    }
  }, [currency, filters.priceRange]);

  // Efecto para convertir los precios cuando cambia la moneda
  useEffect(() => {
    if (currency === 'USD') {
      updateFilter('priceRange', [
        Math.round(filters.priceRange[0] / USD_TO_MXN_RATE) * USD_TO_MXN_RATE,
        Math.round(filters.priceRange[1] / USD_TO_MXN_RATE) * USD_TO_MXN_RATE
      ]);
    }
  }, [currency]);

  // Actualizar el tipo de transacción
  const handleTransactionTypeChange = (type: 'renta' | 'compra') => {
    updateFilter('transactionType', type);
  };

  // Función helper actualizada para manejar la selección/deselección
  const handleNumericFilter = (
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
  };

  // Handle min price input change with debounce
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };
  
  // Handle max price input change with debounce
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Estilos base compartidos para todos los botones y controles
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
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 shadow-none hover:shadow-md">
      <div className="px-[5vw] py-1.5">
        <div className="flex justify-between items-center">
          {/* Texto a la izquierda más pequeño */}
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <span className="font-medium">Filtros</span>
            {!isExplorarPage && <div className="h-4 w-px bg-gray-200"></div>}
            {!isExplorarPage && <span>Encuentra la propiedad perfecta</span>}
          </div>

          {/* Todos los filtros en línea */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Toggle Renta/Compra */}
            <div className="flex bg-gray-50/80 rounded-full p-0.5 shadow-inner">
              {['renta', 'compra'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTransactionTypeChange(type as 'renta' | 'compra')}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${filters.transactionType === type 
                      ? 'bg-violet-100 text-violet-700 shadow-sm ring-2 ring-violet-200' 
                      : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Zona - más compacta */}
            <div className="relative w-32">
              <select
                value={filters.selectedZone}
                onChange={(e) => updateFilter('selectedZone', e.target.value)}
                className={`
                  w-full appearance-none rounded-full
                  px-2.5 py-1.5 text-xs font-medium
                  transition-all cursor-pointer
                  ${filters.selectedZone 
                  ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200' 
                  : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                `}
              >
                <option value="">Zonas</option>
                {zones.map((zone) => (
                  <option 
                    key={zone.id} 
                    value={zone.id}
                    className={filters.selectedZone === zone.id ? '!text-violet-600' : ''}
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

            {/* Precio - ajustes de tamaño */}
            <div className="flex items-center gap-2">
              {/* Selector de moneda más pequeño */}
              <div className="flex bg-gray-50/80 rounded-full p-0.5 shadow-inner">
                {['MXN', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr as 'MXN' | 'USD')}
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                      ${currency === curr
                        ? 'bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200'
                        : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}
                    `}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* Inputs de precio más pequeños - updated for better editing */}
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
                    className="w-16 bg-transparent text-xs text-gray-600 placeholder-gray-400 focus:outline-none"
                    value={minPriceInput}
                    onChange={handleMinPriceChange}
                    onBlur={() => {
                      // Only format numbers on blur without adding currency
                      if (filters.priceRange[0] > 0) {
                        setMinPriceInput(formatPrice(filters.priceRange[0]));
                      }
                    }}
                    onFocus={(e) => {
                      // Move cursor to end on focus
                      const val = e.target.value;
                      e.target.value = '';
                      e.target.value = val;
                    }}
                  />
                  <span className="text-xs text-gray-500 ml-0.5">{currency}</span>
                </div>
                
                <div className="h-3.5 w-px bg-gray-200"></div>
                
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Max"
                    className="w-16 bg-transparent text-xs text-gray-600 placeholder-gray-400 focus:outline-none"
                    value={maxPriceInput}
                    onChange={handleMaxPriceChange}
                    onBlur={() => {
                      // Only format if there's a value and it's less than the MAX_PRICE
                      if (filters.priceRange[1] > 0 && filters.priceRange[1] < MAX_PRICE) {
                        setMaxPriceInput(formatPrice(filters.priceRange[1]));
                      }
                    }}
                    onFocus={(e) => {
                      // Move cursor to end on focus
                      const val = e.target.value;
                      e.target.value = '';
                      e.target.value = val;
                    }}
                  />
                  <span className="text-xs text-gray-500 ml-0.5">{currency}</span>
                </div>
              </div>
            </div>

            {/* Recámaras */}
            <div className="flex items-center gap-2">
              <FaBed className="text-gray-400" />
              <div className="flex gap-2">
                {bedroomOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumericFilter(num, filters.bedrooms, 'bedrooms')}
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                      transition-all duration-200 cursor-pointer relative group
                      ${filters.bedrooms === (num === '3+' ? 3 : Number(num))
                        ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                        : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                    `}
                  >
                    <span className={filters.bedrooms === (num === '3+' ? 3 : Number(num)) ? 'group-hover:opacity-0' : ''}>
                      {num}
                    </span>
                    {filters.bedrooms === (num === '3+' ? 3 : Number(num)) && (
                      <FaTimes className="w-3 h-3 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Baños */}
            <div className="flex items-center gap-2">
              <FaBath className="text-gray-400" />
              <div className="flex gap-2">
                {bathroomOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumericFilter(num, filters.bathrooms, 'bathrooms')}
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                      transition-all duration-200 cursor-pointer relative group
                      ${filters.bathrooms === (num === '2+' ? 2 : Number(num))
                        ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                        : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                    `}
                  >
                    <span className={filters.bathrooms === (num === '2+' ? 2 : Number(num)) ? 'group-hover:opacity-0' : ''}>
                      {num}
                    </span>
                    {filters.bathrooms === (num === '2+' ? 2 : Number(num)) && (
                      <FaTimes className="w-3 h-3 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amueblado - Solo en /explorar */}
            {isExplorarPage && (
              <button
                onClick={() => updateFilter('isFurnished', !filters.isFurnished)}
                className={`
                  ${baseButtonStyles}
                  ${filters.isFurnished ? selectedButtonStyles : unselectedButtonStyles}
                  flex items-center gap-2
                `}
              >
                {filters.isFurnished && <FaCheck className="w-3 h-3 text-violet-600" />}
                Amueblado
              </button>
            )}

            {/* Mascotas - Solo en /explorar */}
            {isExplorarPage && (
              <button
                onClick={() => updateFilter('petsAllowed', !filters.petsAllowed)}
                className={`
                  ${baseButtonStyles}
                  ${filters.petsAllowed ? selectedButtonStyles : unselectedButtonStyles}
                  flex items-center gap-2
                `}
              >
                {filters.petsAllowed && <FaCheck className="w-3 h-3 text-violet-600" />}
                Mascotas
              </button>
            )}

            {/* Estacionamientos */}
            {isExplorarPage && (
              <div className="flex items-center gap-2">
                <FaCar className="text-gray-400" />
                <div className="flex gap-2">
                  {parkingOptions.map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumericFilter(num, filters.parkingSpots, 'parkingSpots')}
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                        transition-all duration-200 cursor-pointer relative group
                        ${filters.parkingSpots === (num === '3+' ? 3 : Number(num))
                          ? 'bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm'
                          : 'bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200'}
                      `}
                    >
                      <span className={filters.parkingSpots === (num === '3+' ? 3 : Number(num)) ? 'group-hover:opacity-0' : ''}>
                        {num}
                      </span>
                      {filters.parkingSpots === (num === '3+' ? 3 : Number(num)) && (
                        <FaTimes className="w-3 h-3 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterExplorador;
