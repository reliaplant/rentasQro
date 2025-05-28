'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPropertiesWithPagination } from '../shared/firebase';
import type { PropertyData } from '../shared/interfaces';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import { useFilters } from '../context/FilterContext';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useInView } from 'react-intersection-observer';
import PropertyCard from './PropertyCard';

// Número de propiedades a cargar por lote
const PROPERTIES_PER_PAGE = 10;

// Función para determinar la prioridad de carga de imágenes
const getImagePriority = (propertyIndex: number, imageIndex: number) => {
  // Las primeras 5-10 propiedades (depende del tamaño de pantalla) son prioritarias
  const isPriorityProperty = propertyIndex < 10;
  
  // Solo la primera imagen de cada propiedad prioritaria se carga con prioridad
  const isPriorityImage = imageIndex === 0;
  
  return isPriorityProperty && isPriorityImage;
};

const Explorador = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Nuevo estado para la carga inicial
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Get filters from context
  const { filters } = useFilters();
  
  // Get exchange rate for currency conversion
  const { convertMXNtoUSD } = useExchangeRate();

  // Configurar el observador para detección de scroll (infinite loading)
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '300px 0px',
  });

  // Cargar propiedades con paginación
  const loadProperties = useCallback(async (reset = false) => {
    if (!hasMore && !reset) return;
    
    try {
      setIsLoading(true);
      const { properties: newProperties, lastVisible, hasMoreDocs } = 
        await getPropertiesWithPagination(reset ? null : lastDoc, PROPERTIES_PER_PAGE);
      
      // Only include properties with status 'publicada'
      const publishedProperties = newProperties.filter(p => p.status === 'publicada');
      console.log(`Filtered ${newProperties.length - publishedProperties.length} non-published properties`);
      
      if (reset) {
        setProperties(publishedProperties);
      } else {
        setProperties(prev => [...prev, ...publishedProperties]);
      }
      
      setLastDoc(lastVisible);
      setHasMore(hasMoreDocs);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false); // Marcar que ya no estamos en la carga inicial
    }
  }, [lastDoc, hasMore]);

  // Cargar propiedades iniciales
  useEffect(() => {
    loadProperties(true);
  }, []);

  // Cargar más propiedades cuando el usuario haga scroll
  useEffect(() => {
    if (inView && !isLoading) {
      loadProperties();
    }
  }, [inView, loadProperties, isLoading]);

  // Efecto para filtrar propiedades basado en los filtros del contexto
  useEffect(() => {
    const filterProperties = () => {
      // Add debug logging
      console.log("Total properties before filtering:", properties.length);
      console.log("Current filters:", filters);

      let filtered = [...properties];
      
      // Debug each filter step
      const logFilterStep = (step: string, count: number) => {
        console.log(`After ${step} filter: ${count} properties remaining`);
      };

      // Ensure we only show properties with status 'publicada'
      filtered = filtered.filter(property => property.status === 'publicada');
      logFilterStep('status', filtered.length);

      // Filtrar por tipo de transacción
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
        logFilterStep('transaction type', filtered.length);
      }

      // Filtrar por zona
      if (filters.selectedZone) {
        filtered = filtered.filter(property => property.zone === filters.selectedZone);
        logFilterStep('zone', filtered.length);
      }
      
      // Filtrar por tipo de propiedad
      if (filters.propertyType) {
        filtered = filtered.filter(property => property.propertyType === filters.propertyType);
        logFilterStep('property type', filtered.length);
      }
      
      // Apply availability filter (inmediata or preventa)
      // Handle properties based on preventa boolean field
      if (filters.preventa === true) {
        console.log(`Explorador: Filtering for preventa properties`);
        filtered = filtered.filter(property => property.preventa === true);
        logFilterStep('preventa', filtered.length);
      }

      // Filter by preventa boolean field (not availability)
      if (filters.preventa) {
        console.log(`Explorador: Filtering for preventa properties`);
        filtered = filtered.filter(property => property.preventa === true);
        logFilterStep('preventa', filtered.length);
      }

      // Apply availability filter using both preventa and preventaFilterActive
      if (filters.preventaFilterActive) {
        if (filters.preventa) {
          console.log(`Explorador: Filtering for preventa properties`);
          filtered = filtered.filter(property => property.preventa === true);
        } else {
          console.log(`Explorador: Filtering for immediate properties`);
          filtered = filtered.filter(property => property.preventa !== true);
        }
        logFilterStep('availability', filtered.length);
      }

      // Filtrar por recámaras
      if (filters.bedrooms !== null) {
        filtered = filtered.filter(property => {
          if (filters.bedrooms === 3) {
            return property.bedrooms >= 3;
          }
          return property.bedrooms === filters.bedrooms;
        });
        logFilterStep('bedrooms', filtered.length);
      }

      // Filtrar por baños
      if (filters.bathrooms !== null) {
        filtered = filtered.filter(property => {
          if (filters.bathrooms === 2) {
            return property.bathrooms >= 2;
          }
          return property.bathrooms === filters.bathrooms;
        });
        logFilterStep('bathrooms', filtered.length);
      }

      // Improved price filtering with better handling of max value
      // Min price filter - only apply if greater than 0
      if (filters.priceRange[0] > 0) {
        filtered = filtered.filter(property => property.price >= filters.priceRange[0]);
        logFilterStep('min price', filtered.length);
      }
      
      // Max price filter - only apply if less than MAX_PRICE
      // Check both MAX_PRICE and a reasonable threshold like 999999999 to handle rounding
      const MAX_THRESHOLD = 999999999;
      if (filters.priceRange[1] < MAX_THRESHOLD) {
        filtered = filtered.filter(property => property.price <= filters.priceRange[1]);
        
        // Log excluded properties for debugging
        if (filtered.length === 0) {
          console.log("All properties excluded by max price filter:", {
            maxPrice: filters.priceRange[1],
            propertiesWithPrices: properties.map(p => ({ id: p.id, price: p.price }))
          });
        }
        
        logFilterStep('max price', filtered.length);
      }

      // Filtrar por amueblado
      if (filters.isFurnished) {
        filtered = filtered.filter(property => property.furnished);
        logFilterStep('furnished', filtered.length);
      }

      // Filtrar por mascotas
      if (filters.petsAllowed) {
        filtered = filtered.filter(property => property.petsAllowed);
        logFilterStep('pets allowed', filtered.length);
      }

      // Filtrar por estacionamientos
      if (filters.parkingSpots !== null) {
        filtered = filtered.filter(property => {
          if (filters.parkingSpots === 3) {
            return property.parkingSpots >= 3;
          }
          return property.parkingSpots === filters.parkingSpots;
        });
        logFilterStep('parking spots', filtered.length);
      }

      setFilteredProperties(filtered);
      console.log("Final filtered count:", filtered.length);
    };

    filterProperties();
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
    filters.preventaFilterActive, // Add the new dependency
    properties,
    convertMXNtoUSD
  ]);

  // Manejar navegación de imágenes con loop
  const navigateImage = (e: React.MouseEvent, propertyId: string, direction: 'prev' | 'next', maxImages: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCurrentImageIndices(prev => {
      const currentIndex = prev[propertyId] || 0;
      if (direction === 'prev') {
        // Si estamos en la primera imagen y vamos hacia atrás, ir a la última
        return { ...prev, [propertyId]: currentIndex === 0 ? maxImages - 1 : currentIndex - 1 };
      } else {
        // Si estamos en la última imagen y vamos hacia adelante, ir a la primera
        return { ...prev, [propertyId]: currentIndex === maxImages - 1 ? 0 : currentIndex + 1 };
      }
    });
  };

  // Componente Skeleton
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
  
  // Add the missing renderSkeletons function
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 w-full">
      {[...Array(10)].map((_, index) => (
        <PropertySkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );

  return (
    <div className="mx-auto px-3 sm:px-[5vw] py-8 sm:py-12">
      {isInitialLoading ? (
        // Show skeletons during initial loading
        renderSkeletons()
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {filteredProperties.length > 0 ? (
            // Show filtered properties when loaded
            filteredProperties.map((property, index) => (
              <PropertyCard 
                key={property.id}
                property={property} 
                index={index}
                currency={filters.currency} 
              />
            ))
          ) : (
            // Message when no properties available
            <div className="col-span-full py-12 sm:py-20 text-center">
              <h3 className="text-base sm:text-lg font-medium text-gray-700">
                No hay propiedades disponibles
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Intenta cambiar tus filtros de búsqueda
              </p>
            </div>
          )}
          
          {/* Observation element for infinite scroll */}
          {hasMore && (
            <div ref={ref} className="col-span-full flex justify-center py-8">
              {isLoading && !isInitialLoading && renderSkeletons()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explorador;
