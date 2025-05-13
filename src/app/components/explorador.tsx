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
  const { exchangeRate, convertMXNtoUSD } = useExchangeRate();

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
      
      const publishedProperties = newProperties.filter(p => p.status === 'publicada');
      
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
      let filtered = [...properties];

      // Filtrar por tipo de transacción
      if (filters.transactionType) {
        filtered = filtered.filter(property => {
          if (filters.transactionType === 'renta') {
            return ['renta', 'ventaRenta'].includes(property.transactionType);
          } else if (filters.transactionType === 'compra') {
            return ['venta', 'ventaRenta'].includes(property.transactionType);
          }
          return true;
        });
      }

      // Filtrar por zona
      if (filters.selectedZone) {
        filtered = filtered.filter(property => property.zone === filters.selectedZone);
      }

      // Filtrar por recámaras
      if (filters.bedrooms !== null) {
        filtered = filtered.filter(property => {
          if (filters.bedrooms === 3) {
            return property.bedrooms >= 3;
          }
          return property.bedrooms === filters.bedrooms;
        });
      }

      // Filtrar por baños
      if (filters.bathrooms !== null) {
        filtered = filtered.filter(property => {
          if (filters.bathrooms === 2) {
            return property.bathrooms >= 2;
          }
          return property.bathrooms === filters.bathrooms;
        });
      }

      // Filtrar por precio
      if (filters.priceRange[0] > 0) {
        filtered = filtered.filter(property => property.price >= filters.priceRange[0]);
      }
      if (filters.priceRange[1] < 50000) {
        filtered = filtered.filter(property => property.price <= filters.priceRange[1]);
      }

      // Filtrar por amueblado
      if (filters.isFurnished) {
        filtered = filtered.filter(property => property.furnished);
      }

      // Filtrar por mascotas
      if (filters.petsAllowed) {
        filtered = filtered.filter(property => property.petsAllowed);
      }

      // Filtrar por estacionamientos
      if (filters.parkingSpots !== null) {
        filtered = filtered.filter(property => {
          if (filters.parkingSpots === 3) {
            return property.parkingSpots >= 3;
          }
          return property.parkingSpots === filters.parkingSpots;
        });
      }

      setFilteredProperties(filtered);
    };

    filterProperties();
  }, [filters, properties]);

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

  // Componente PropertyCard
  const PropertyCard = ({ property, index }: { property: PropertyData, index: number }) => {
    // Add favorites functionality
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isFav, setIsFav] = useState(false);
    
    // Initialize favorite state when component mounts
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

    const formatPropertyType = (type: string) => {
      if (type === 'departamento') return 'Depa';
      return type.charAt(0).toUpperCase() + type.slice(1);
    };

    // Get property price in the selected currency
    const getDisplayPrice = () => {
      if (filters.currency === 'USD') {
        return convertMXNtoUSD(property.price);
      }
      return property.price;
    };

    return (
      <div className="group block">
        <div className="relative rounded-lg sm:rounded-xl overflow-hidden">
          {/* Badge de transacción */}
          <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 z-20">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
              {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
            </span>
          </div>

          {/* Botón Favorito con hover effect - updated with favorite functionality */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-200 cursor-pointer group/btn"
            aria-label={isFav ? "Eliminar de favoritos" : "Añadir a favoritos"}
          >
            <FaHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFav ? "text-pink-500" : "text-gray-400"} group-hover/btn:text-pink-500 transition-colors duration-200`} />
          </button>

          {/* Contenedor de imagen con overlay de oscurecimiento en hover */}
          <div className="aspect-[16/12] relative bg-gray-100 overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out w-full h-full"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {property.imageUrls?.slice(0, 5).map((url, imageIndex) => {
                const shouldPrioritize = getImagePriority(index, imageIndex);
                
                return (
                  <div key={imageIndex} className="flex-shrink-0 w-full h-full relative">
                    <Image 
                      src={url || '/placeholder.jpg'} 
                      alt={`${property.descripcion || 'Imagen de propiedad'} ${imageIndex + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 17vw, 15vw"
                      priority={shouldPrioritize}
                      loading={shouldPrioritize ? 'eager' : 'lazy'}
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
                );
              })}
            </div>
            {/* Overlay para oscurecer en hover - sin transición */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 z-10 pointer-events-none"></div>
            {/* Gradient overlay for dots visibility */}
            <div className="rounded-lg absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/30 to-transparent z-15"></div>
            
            {/* Botones de navegación - siempre visibles si hay más de una imagen */}
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

            {/* Indicadores de posición */}
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

          {/* Información de la propiedad */}
          <div className="pt-2 sm:pt-3 space-y-0.5 sm:space-y-1">
            <div className="flex items-start justify-between">
              <div className="w-full">
                <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                  {formatPropertyType(property.propertyType)} en {property.condoName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {property.zone === 'X5oWujYupjRKx0tF8Hlj' ? 'Zibatá' : property.zone || 'Zona no especificada'}
                </p>
                
                {/* Show different metrics based on property type */}
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

  // Renderizar esqueletos de carga durante la carga inicial
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
        // Mostrar los esqueletos durante la carga inicial
        renderSkeletons()
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {filteredProperties.length > 0 ? (
            // Mostrar propiedades filtradas cuando están cargadas
            filteredProperties.map((property, index) => (
              <Link 
                href={`/propiedad/${property.id}`} 
                key={property.id}
                className="cursor-pointer mb-2 sm:mb-4"
              >
                <PropertyCard property={property} index={index} />
              </Link>
            ))
          ) : (
            // Mensaje cuando no hay propiedades disponibles
            <div className="col-span-full py-12 sm:py-20 text-center">
              <h3 className="text-base sm:text-lg font-medium text-gray-700">
                No hay propiedades disponibles
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Intenta cambiar tus filtros de búsqueda
              </p>
            </div>
          )}
          
          {/* Elemento de observación para infinite scroll */}
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
