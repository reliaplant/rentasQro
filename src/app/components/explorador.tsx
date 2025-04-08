'use client';

import { useEffect, useState } from 'react';
import { getProperties } from '../shared/firebase';
import type { PropertyData } from '../shared/interfaces';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import { useFilters } from '../context/FilterContext';

const Explorador = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Get filters from context
  const { filters } = useFilters();

  // Cargar propiedades
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        const allProperties = await getProperties();
        const publishedProperties = allProperties.filter(p => p.status === 'publicada');
        setProperties(publishedProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProperties();
  }, []);

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
        <div className="pt-3 space-y-3">
          <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="flex gap-2 items-center">
            <div className="w-10 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <div className="w-10 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <div className="w-10 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="w-1/3 h-5 bg-gray-200 animate-pulse rounded mt-2"></div>
        </div>
      </div>
    </div>
  );

  // Componente PropertyCard
  const PropertyCard = ({ property }: { property: PropertyData }) => {
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
    const maxImages = property.imageUrls?.length || 1;

    const formatPropertyType = (type: string) => {
      if (type === 'departamento') return 'Depa';
      return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
      <div className="group block ">
        <div className="relative rounded-xl overflow-hidden">
          {/* Badge de transacción */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
            </span>
          </div>

          {/* Botón Favorito con hover effect - updated with favorite functionality */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-200 cursor-pointer group/btn"
            aria-label={isFav ? "Eliminar de favoritos" : "Añadir a favoritos"}
          >
            <FaHeart className={`w-4 h-4 ${isFav ? "text-pink-500" : "text-gray-400"} group-hover/btn:text-pink-500 transition-colors duration-200`} />
          </button>

          {/* Contenedor de imagen */}
          <div className="aspect-[16/12] relative bg-gray-100 overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out w-full h-full"
              style={{ 
              transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {property.imageUrls?.map((url, index) => (
              <div key={index} className="flex-shrink-0 w-full h-full relative">
              <Image 
              src={url || '/placeholder.jpg'} 
              alt={`${property.descripcion || 'Imagen de propiedad'} ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index === 0}
              className="object-cover"
              />
              </div>
              ))}
            </div>
            {/* Gradient overlay for dots visibility */}
            <div className="absolute -bottom-3 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
            
            {/* Botones de navegación - siempre visibles si hay más de una imagen */}
            {maxImages > 1 && (
              <>
                <button 
                  onClick={(e) => property.id && navigateImage(e, property.id, 'prev', maxImages)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
                >
                  <FaChevronLeft className="w-4 h-4 text-gray-800" />
                </button>
                <button 
                  onClick={(e) => property.id && navigateImage(e, property.id, 'next', maxImages)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
                >
                  <FaChevronRight className="w-4 h-4 text-gray-800" />
                </button>
              </>
            )}

            {/* Indicadores de posición */}
            {maxImages > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {[...Array(maxImages)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Información de la propiedad */}
          <div className="pt-3 space-y-1">
            <div className="flex items-start justify-between">
              <div className="w-full">
                <h3 className="font-medium text-gray-900 truncate">
                  {formatPropertyType(property.propertyType)} en {property.condoName}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {property.zone || 'Zona no especificada'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>{property.bedrooms} rec</span>
                  <span>•</span>
                  <span>{property.bathrooms} baños</span>
                  <span>•</span>
                  <span>{property.construccionM2}m²</span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-1 pt-2">
              <span className="font-semibold">${property.price.toLocaleString()}</span>
              <span className="text-gray-500">
                {property.transactionType === 'renta' ? '/mes' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto px-[5vw] py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading ? (
          // Mostrar skeletons durante la carga
          [...Array(10)].map((_, index) => (
            <PropertySkeleton key={index} />
          ))
        ) : filteredProperties.length > 0 ? (
          // Mostrar propiedades filtradas cuando están cargadas
          filteredProperties.map((property) => (
            <Link 
              href={`/propiedad/${property.id}`} 
              key={property.id}
              className="cursor-pointer"
            >
              <PropertyCard property={property} />
            </Link>
          ))
        ) : (
          // Mensaje cuando no hay propiedades disponibles
          <div className="col-span-full py-20 text-center">
            <h3 className="text-lg font-medium text-gray-700">
              No hay propiedades disponibles
            </h3>
            <p className="text-gray-500 mt-1">
              Intenta cambiar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explorador;
