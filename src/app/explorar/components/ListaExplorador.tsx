'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PropertyData } from '../../shared/interfaces';
import { useFilters } from '../../context/FilterContext';
import { FaTimes, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { getPropertiesWithPagination } from '../../shared/firebase';
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
        
        // For compra mode, we'll handle the reset of isFurnished/petsAllowed outside this effect
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
      if (sortOption === 'precio-alto') {
        return b.price - a.price;
      } else if (sortOption === 'precio-bajo') {
        return a.price - b.price;
      } else if (sortOption === 'reciente') {
        // Assuming there's a createdAt timestamp, fallback to id comparison
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      }
      // Default 'relevante' sorting - could be a combination of factors
      return 0; // No specific sorting for 'relevante'
    });

    // Store all filtered properties
    setFilteredProperties(sortedFiltered);
  }, [filters.transactionType, 
      filters.selectedZone,
      filters.priceRange, 
      filters.bedrooms,
      filters.bathrooms,
      filters.isFurnished,
      filters.petsAllowed,
      filters.parkingSpots,
      filters.propertyType,
      filters.selectedCondo,
      properties,
      sortOption]); // Use individual filter properties instead of the whole filters object

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

  // PropertyCard component
  const PropertyCard = ({ property, index }: { property: PropertyData, index: number }) => {
    // Add favorites functionality
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isFav, setIsFav] = useState(false);
    
    // Initialize favorite state
    useEffect(() => {
      if (property.id) {
        setIsFav(isFavorite(property.id));
      }
    }, [property.id, isFavorite]);
    
    // Handle favorite button click
    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (property.id) {
        toggleFavorite(property.id);
        setIsFav(!isFav);
      }
    };

    const currentIndex = property.id ? currentImageIndices[property.id] || 0 : 0;
    const maxImages = property.imageUrls ? Math.min(property.imageUrls.length, 5) : 1;

    // Get property price in selected currency
    const getDisplayPrice = () => {
      if (filters.currency === 'USD') {
        return convertMXNtoUSD(property.price);
      }
      return property.price;
    };

    return (
      <div className="group block">
        <div className="relative rounded-lg sm:rounded-xl overflow-hidden">
          {/* Transaction badge */}
          <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 z-20">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
              {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
            </span>
          </div>

          {/* Favorite button */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-200 cursor-pointer group/btn"
            aria-label={isFav ? "Eliminar de favoritos" : "Añadir a favoritos"}
          >
            <FaHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFav ? "text-pink-500" : "text-gray-400"} group-hover/btn:text-pink-500 transition-colors duration-200`} />
          </button>

          {/* Image container */}
          <div className="aspect-[16/12] relative bg-gray-100 overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out w-full h-full"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {property.imageUrls?.slice(0, 5).map((url, imageIndex) => (
                <div key={imageIndex} className="flex-shrink-0 w-full h-full relative">
                  <Image 
                    src={url || '/placeholder.jpg'} 
                    alt={`${property.descripcion || 'Imagen de propiedad'} ${imageIndex + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover rounded-lg"
                    quality={imageIndex === 0 ? 80 : 40}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0M/d5DwAChQGFAyGkvgAAAABJRU5ErkJggg=="
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 z-10 pointer-events-none"></div>
            {/* Gradient overlay */}
            <div className="rounded-lg absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/30 to-transparent z-15"></div>
            
            {/* Navigation buttons */}
            {maxImages > 1 && (
              <>
                <button 
                  onClick={(e) => property.id && navigateImage(e, property.id, 'prev', maxImages)}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
                >
                  <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800" />
                </button>
                <button 
                  onClick={(e) => property.id && navigateImage(e, property.id, 'next', maxImages)}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
                >
                  <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800" />
                </button>
              </>
            )}

            {/* Position indicators */}
            {maxImages > 1 && (
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20">
                {[...Array(maxImages)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Property information */}
          <div className="pt-2 sm:pt-3 space-y-0.5 sm:space-y-1">
            <div className="flex items-start justify-between">
              <div className="w-full">
                <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                  {formatPropertyType(property.propertyType)} en {property.condoName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {property.zone === 'X5oWujYupjRKx0tF8Hlj' ? 'Zibatá' : property.zone || 'Zona no especificada'}
                </p>
                
                {/* Property metrics based on type */}
                {property.propertyType === 'terreno' ? (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    <span>{property.terrenoM2 || 0}m² terreno</span>
                    {(property.construccionM2 ?? 0) > 0 && (
                      <>
                        <span>•</span>
                        <span>{property.construccionM2}m² construcción</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    <span>{property.bedrooms} rec</span>
                    <span>•</span>
                    <span>{property.bathrooms} baños</span>
                    <span>•</span>
                    <span>{property.construccionM2}m²</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-0.5 sm:gap-1 pt-1 sm:pt-2">
              <span className="font-semibold text-sm sm:text-base text-black">
                {filters.currency === 'USD' ? '$' : '$'}
                {getDisplayPrice().toLocaleString(undefined, {
                  minimumFractionDigits: filters.currency === 'USD' ? 0 : 0,
                  maximumFractionDigits: filters.currency === 'USD' ? 0 : 0
                })}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {filters.currency} {property.transactionType === 'renta' ? '/mes' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
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
    
    if (selectedCondoName && filters.selectedCondo) {
      return `${count} ${isPlural ? 'inmuebles' : 'inmueble'} en ${selectedCondoName}`;
    } else {
      return `${count} ${isPlural ? 'inmuebles' : 'inmueble'}`;
    }
  };

  // Function to show more properties
  const handleShowMore = () => {
    setVisibleCount(prev => prev + 12); // Show 12 more properties
  };

  return (
    <div className="w-full">
      {/* Header with property count and sorting options */}
      <div className="bg-white z-10 p-6">
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
          
          {/* Sorting selector - Updated with 'relevante' as default */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Ordenar por:</span>
            <div className="relative">
              {sortOption === 'relevante' ? (
                <div className="relative w-36 sm:w-40">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className={`
                      w-full appearance-none rounded-full
                      px-3 py-1.5 text-xs font-medium
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
                  className="flex items-center justify-between bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all"
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
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(12)].map((_, index) => (
              <PropertySkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : displayedProperties.length > 0 ? (
          <>
            {/* Property cards in 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedProperties.map((property, index) => (
                <Link 
                  href={`/propiedad/${property.id}`} 
                  key={property.id}
                  className="cursor-pointer mb-2 sm:mb-4"
                >
                  <PropertyCard property={property} index={index} />
                </Link>
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
