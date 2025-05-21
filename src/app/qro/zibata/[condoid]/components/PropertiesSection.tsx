'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PropertyData } from '@/app/shared/interfaces';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoBedOutline } from 'react-icons/io5';
import { LuBath } from 'react-icons/lu';
import { TbCar } from 'react-icons/tb';

interface PropertiesSectionProps {
  properties: PropertyData[];
  condoName: string;
}

export default function PropertiesSection({ properties, condoName }: PropertiesSectionProps) {
  // Instead of returning null, show a message when there are no properties
  if (!properties || properties.length === 0) {
    return (
      <div className="px-4 md:px-0 my-12">
        <h3 className="text-xl pb-4 font-semibold mb-2 md:mb-3">Propiedades en {condoName}</h3>
        <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
          <p className="text-gray-600 text-base md:text-lg mb-4">
            No hay propiedades disponibles en {condoName} en este momento.
          </p>
          <Link 
            href="/qro/buscar" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200 "
          >
            Explora otras propiedades
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Estado para controlar la imagen mostrada para cada propiedad
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  
  // Separar propiedades por tipo de transacción
  const rentProperties = properties
    .filter(p => p.transactionType === 'renta' || p.transactionType === 'ambos')
    .slice(0, 4);
  
  const saleProperties = properties
    .filter(p => p.transactionType === 'venta' || p.transactionType === 'ambos')
    .slice(0, 4);
  
  // Navegación de imágenes con bucle
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

  const formatPropertyType = (type: string) => {
    if (type === 'departamento') return 'Depa';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Componente para renderizar una fila de propiedades
  const PropertyRow = ({ properties, title }: { properties: PropertyData[], title: string }) => {
    if (properties.length === 0) {
      // Show message when no properties are available for this category
      return (
        <div className="mb-12">
          <h3 className="text-xl pb-4 font-semibold mb-2 md:mb-3">{title}</h3>
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
            <p className="text-gray-600 text-base md:text-lg mb-4">
              No hay {title.toLowerCase()} disponibles en {condoName} en este momento.
            </p>
            <Link 
              href="/qro/buscar" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200"
            >
              Explora propiedades
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mb-12">
        <h3 className="text-xl pb-4 font-semibold mb-2 md:mb-3">{title}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {properties.map((property) => {
            const currentIndex = property.id ? currentImageIndices[property.id] || 0 : 0;
            const maxImages = property.imageUrls?.length || 1;
            
            return (
              <Link 
                href={`/qro/propiedades/${property.id}`} 
                key={property.id}
                className="cursor-pointer group block"
              >
                <div className="relative rounded-md overflow-hidden">
                  {/* Badge de transacción */}
                  <div className="absolute top-1.5 md:top-3 left-1.5 md:left-3 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] md:text-xs font-medium px-1.5 md:px-3 py-0.5 rounded-full shadow-sm">
                      {property.transactionType === 'renta' ? 'Renta' : 
                       property.transactionType === 'venta' ? 'Venta' : 
                       'Venta/Renta'}
                    </span>
                  </div>

                  {/* Contenedor de imagen */}
                  <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
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
                    
                    {/* Botones de navegación */}
                    {maxImages > 1 && (
                      <>
                        <button 
                          onClick={(e) => property.id && navigateImage(e, property.id, 'prev', maxImages)}
                          className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
                        >
                          <FaChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-800" />
                        </button>
                        <button 
                          onClick={(e) => property.id && navigateImage(e, property.id, 'next', maxImages)}
                          className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
                        >
                          <FaChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-800" />
                        </button>
                      </>
                    )}

                    {/* Indicadores de posición */}
                    {maxImages > 1 && (
                      <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5">
                        {[...Array(maxImages)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Información de la propiedad - Versión optimizada */}
                  <div className="pt-1.5 md:pt-3 space-y-0.5">
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        <h3 className="font-medium text-gray-900 truncate text-xs md:text-sm">
                          {formatPropertyType(property.propertyType)} • {property.modelo} • {property.condoName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500">
                          <div className="flex items-center gap-0.5">
                            <IoBedOutline className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <LuBath className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <TbCar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span>{property.parkingSpots}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-0.5">
                      <span className="font-semibold text-xs md:text-sm">
                        ${typeof property.price === 'number' ? property.price.toLocaleString() : '0'}
                      </span>
                      <span className="text-gray-500 text-[10px] md:text-xs">
                        {property.transactionType === 'renta' ? '/mes' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="">

      {/* Sección de Propiedades en Venta */}
      <PropertyRow 
        properties={saleProperties} 
        title={`Propiedades en venta`} 
      />
      
      {/* Sección de Propiedades en Renta */}
      <PropertyRow 
        properties={rentProperties} 
        title={`Propiedades en renta`} 
      />
    </div>
  );
}
