'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PropertyData } from '../../shared/interfaces';
import { useFilters } from '../../context/FilterContext';
import { FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { getPropertiesWithPagination } from '../../shared/firebase';
import PropertyCard from '../../components/PropertyCard'; // Import the PropertyCard component
import { useFavorites } from '../../hooks/useFavorites';
import { useExchangeRate } from '../../hooks/useExchangeRate';

const ListaExplorador = () => {
  // Change default sort option to 'relevante'
  const [sortOption, setSortOption] = useState('relevante');
  const { filters, updateFilter } = useFilters();
  
  // States for properties management
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<PropertyData[]>([]);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12); // Initial number of visible properties
  
  // Get exchange rate for currency conversion
  const { convertMXNtoUSD } = useExchangeRate();
  
  // Sorting options
  const sortOptions = [
    { id: 'relevante', label: 'Más relevantes' },
    { id: 'reciente', label: 'Más reciente' },
    { id: 'precio-alto', label: 'Mayor precio' },
    { id: 'precio-bajo', label: 'Menor precio' }
  ];

  // Get the label of the current sort option
  const selectedSortLabel = sortOptions.find(option => option.id === sortOption)?.label || 'Ordenar';

  // State to store the selected condo name
  const [selectedCondoName, setSelectedCondoName] = useState<string>("");

  // Load properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        const { properties: newProperties } = await getPropertiesWithPagination(null, 50); // Get more to filter
        
        // Only include properties with status 'publicada'
        const publishedProperties = newProperties.filter(p => p.status === 'publicada');
        setProperties(publishedProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, []);

  // Filter and sort properties
  useEffect(() => {
    let filtered = [...properties];
    
    // Ensure we only show properties with status 'publicada'
    filtered = filtered.filter(property => property.status === 'publicada');

    // Filter by transaction type
    if (filters.transactionType) {
      if (filters.transactionType === 'renta') {
        filtered = filtered.filter(property => 
          ['renta', 'ventaRenta'].includes(property.transactionType)
        );
      } else if (filters.transactionType === 'compra') {
        filtered = filtered.filter(property => 
          ['venta', 'ventaRenta'].includes(property.transactionType)
        );
      }
    }

    // Filter by zone
    if (filters.selectedZone) {
      filtered = filtered.filter(property => property.zone === filters.selectedZone);
    }
    
    // Filter by condo
    if (filters.selectedCondo) {
      filtered = filtered.filter(property => property.condo === filters.selectedCondo);
      
      // Find the condo name from the first matching property
      if (filtered.length > 0 && filtered[0].condoName) {
        setSelectedCondoName(filtered[0].condoName);
      }
    } else {
      // Reset condo name when no condo is selected
      setSelectedCondoName("");
    }

    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }

    // Filter by preventa boolean directly (not availability)
    if (filters.preventa) {
      console.log(`ListaExplorador: Filtering for preventa properties`);
      filtered = filtered.filter(property => property.preventa === true);
    }

    // Filter by bedrooms
    if (filters.bedrooms !== null) {
      filtered = filtered.filter(property => {
        if (filters.bedrooms === 3) {
          return property.bedrooms >= 3;
        }
        return property.bedrooms === filters.bedrooms;
      });
    }

    // Filter by bathrooms
    if (filters.bathrooms !== null) {
      filtered = filtered.filter(property => {
        if (filters.bathrooms === 2) {
          return property.bathrooms >= 2;
        }
        return property.bathrooms === filters.bathrooms;
      });
    }

    // Price filtering
    if (filters.priceRange[0] > 0) {
      filtered = filtered.filter(property => property.price >= filters.priceRange[0]);
    }
    
    const MAX_THRESHOLD = 999999999;
    if (filters.priceRange[1] < MAX_THRESHOLD) {
      filtered = filtered.filter(property => property.price <= filters.priceRange[1]);
    }

    // Filter by furnished - only apply when transaction type is 'renta'
    if (filters.transactionType === 'renta' && filters.isFurnished) {
      filtered = filtered.filter(property => property.furnished);
    }

    // Filter by pets allowed - only apply when transaction type is 'renta'
    if (filters.transactionType === 'renta' && filters.petsAllowed) {
      filtered = filtered.filter(property => property.petsAllowed);
    }

    // Filter by parking spots
    if (filters.parkingSpots !== null) {
      filtered = filtered.filter(property => {
        if (filters.parkingSpots === 3) {
          return property.parkingSpots >= 3;
        }
        return property.parkingSpots === filters.parkingSpots;
      });
    }

    // When filters change, reset visible count to initial 12
    setVisibleCount(12);
    
    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
      // Always prioritize featured properties first, regardless of sort option
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then apply the selected sort option to properties with the same featured status
      if (sortOption === 'precio-alto') {
        return b.price - a.price;
      } else if (sortOption === 'precio-bajo') {
        return a.price - b.price;
      } else if (sortOption === 'reciente') {
        // Fix for handling different date formats safely
        const getTimestamp = (prop: any) => {
          if (!prop.createdAt) return 0;
          
          // Handle Firestore Timestamp objects
          if (prop.createdAt.toMillis && typeof prop.createdAt.toMillis === 'function') {
            return prop.createdAt.toMillis();
          }
          
          // Handle JavaScript Date objects
          if (prop.createdAt instanceof Date) {
            return prop.createdAt.getTime();
          }
          
          // Handle string dates
          if (typeof prop.createdAt === 'string') {
            return new Date(prop.createdAt).getTime();
          }
          
          // Handle numeric timestamps
          if (typeof prop.createdAt === 'number') {
            return prop.createdAt;
          }
          
          // Default fallback
          return 0;
        };
        
        return getTimestamp(b) - getTimestamp(a);
      }
      // Default 'relevante' sorting - now will always respect featured status first
      return 0;
    });

    // Store all filtered properties
    setFilteredProperties(sortedFiltered);
  }, [
    filters.transactionType, 
    filters.selectedZone,
    filters.priceRange, 
    filters.bedrooms,
    filters.bathrooms,
    filters.isFurnished,
    filters.petsAllowed,
    filters.parkingSpots,
    filters.propertyType,
    filters.selectedCondo,
    filters.preventa, // Use preventa instead of availability
    properties,
    sortOption
  ]); 

  // Separate effect to reset filters when transaction type changes to 'compra'
  useEffect(() => {
    if (filters.transactionType === 'compra') {
      if (filters.isFurnished) {
        updateFilter('isFurnished', false);
      }
      if (filters.petsAllowed) {
        updateFilter('petsAllowed', false);
      }
    }
  }, [filters.transactionType, updateFilter]);

  // Add a separate effect for resetting rental-only filters
  useEffect(() => {
    if (filters.transactionType === 'compra') {
      if (filters.isFurnished || filters.petsAllowed) {
        // Use setTimeout to avoid the state update during render
        setTimeout(() => {
          if (filters.isFurnished) updateFilter('isFurnished', false);
          if (filters.petsAllowed) updateFilter('petsAllowed', false);
        }, 0);
      }
    }
  }, [filters.transactionType, filters.isFurnished, filters.petsAllowed, updateFilter]);

  // Update displayed properties whenever filtered properties or visible count changes
  useEffect(() => {
    setDisplayedProperties(filteredProperties.slice(0, visibleCount));
  }, [filteredProperties, visibleCount]);

  // Listen for sort option updates from the mobile sorting modal
  useEffect(() => {
    const handleSortUpdate = (event: any) => {
      if (event.detail && event.detail.sortOption) {
        setSortOption(event.detail.sortOption);
      }
    };
    
    window.addEventListener('updateSort', handleSortUpdate);
    
    return () => {
      window.removeEventListener('updateSort', handleSortUpdate);
    };
  }, []);

  // Handle image navigation
  const navigateImage = (e: React.MouseEvent, propertyId: string, direction: 'prev' | 'next', maxImages: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCurrentImageIndices(prev => {
      const currentIndex = prev[propertyId] || 0;
      if (direction === 'prev') {
        return { ...prev, [propertyId]: currentIndex === 0 ? maxImages - 1 : currentIndex - 1 };
      } else {
        return { ...prev, [propertyId]: currentIndex === maxImages - 1 ? 0 : currentIndex + 1 };
      }
    });
  };

  // Format property type display
  const formatPropertyType = (type: string) => {
    if (type === 'departamento') return 'Depa';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Loading skeleton component
  const PropertySkeleton = () => (
    <div className="group block">
      <div className="relative rounded-xl overflow-hidden">
        <div className="aspect-[16/12] bg-gray-200 animate-pulse"></div>
        <div className="pt-2 sm:pt-3 space-y-2 sm:space-y-3">
          <div className="w-3/4 h-4 sm:h-5 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-1/2 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <div className="w-8 sm:w-10 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <div className="w-8 sm:w-10 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <div className="w-8 sm:w-10 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="w-1/3 h-4 sm:h-5 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2"></div>
        </div>
      </div>
    </div>
  );

  // Add a function to clear condo filter
  const clearCondoFilter = useCallback(() => {
    updateFilter('selectedCondo', '');
  }, [updateFilter]);

  // Format property count text with proper grammar
  const formatPropertyCount = () => {
    const count = filteredProperties.length;
    const isPlural = count !== 1;
    
    let countText = `${count} ${isPlural ? 'inmuebles' : 'inmueble'}`;
    
    if (selectedCondoName && filters.selectedCondo) {
      countText += ` en ${selectedCondoName}`;
    }
    
    // Add preventa information
    if (filters.preventa) {
      countText += " en preventa";
    }
    
    return countText;
  };

  // Function to show more properties
  const handleShowMore = () => {
    setVisibleCount(prev => prev + 12); // Show 12 more properties
  };

  return (
    <div className="w-full pt-16 md:pt-0">
      {/* Header with property count and sorting options */}
      <div className="bg-white z-10 p-6 hidden md:block">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Property count information */}
          <div className="flex flex-col">
        <span className="text-xl font-semibold text-gray-800">{formatPropertyCount()}</span>
        <span className="text-sm text-gray-500">
          {filters.transactionType === 'renta' ? 'en renta' : 'en venta'} en Querétaro
          {filters.selectedCondo && (
            <>
          <button
            onClick={clearCondoFilter}
            className="ml-2 text-violet-600 hover:text-violet-800 text-xs"
          >
            <FaTimes className="inline w-3 h-3 mr-1" />
            Quitar filtro de condominio
          </button>
            </>
          )}
        </span>
          </div>
          
          {/* Sorting selector - Updated with 'relevante' as default and whitespace-nowrap */}
          <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2 whitespace-nowrap">Ordenar por:</span>
        <div className="relative">
          {sortOption === 'relevante' ? (
            <div className="relative w-36 sm:w-40">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`
              w-full appearance-none rounded-full
              px-3 py-1.5 text-xs font-medium whitespace-nowrap
              transition-all cursor-pointer
              bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200
            `}
          >
            {sortOptions.map((option) => (
              <option 
            key={option.id} 
            value={option.id}
            className={sortOption === option.id ? '!text-violet-600' : ''}
              >
            {option.label}
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
            <button
          onClick={() => setSortOption('relevante')}
          className="flex items-center justify-between bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap"
            >
          <span>{selectedSortLabel}</span>
          <FaTimes className="w-3 h-3 ml-2 text-violet-500 hover:scale-125 hover:text-violet-700 transition-all duration-200 cursor-pointer" />
            </button>
          )}
        </div>
          </div>
        </div>
      </div>
      
      {/* Property list */}
      <div className="p-6">
        {isLoading ? (
          // Loading skeletons - adjust mobile layout to 1 column
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(12)].map((_, index) => (
              <PropertySkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : displayedProperties.length > 0 ? (
          <>
            {/* Property cards - 1 column on small mobile, 2 on larger mobile, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {displayedProperties.map((property, index) => (
                <PropertyCard 
                  key={property.id}
                  property={property} 
                  index={index}
                  currency={filters.currency as 'MXN' | 'USD'}
                  linkTo={`/propiedad/${property.id}`}
                  className="mb-2 sm:mb-4"
                  size={window.innerWidth < 640 ? 'large' : 'default'}
                  openInNewTab={true} // Open in new tab
                />
              ))}
            </div>
            
            {/* Show more button */}
            {displayedProperties.length < filteredProperties.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-full text-sm font-medium transition-colors duration-200"
                >
                  Mostrar más ({Math.min(12, filteredProperties.length - displayedProperties.length)} de {filteredProperties.length - displayedProperties.length} restantes)
                </button>
              </div>
            )}
          </>
        ) : (
          // No properties found message
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No se encontraron propiedades</p>
            <p className="text-sm text-gray-500 mt-1">Intenta modificar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaExplorador;
