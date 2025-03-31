'use client';

import { useEffect, useState } from 'react';
import { getProperties } from '../shared/firebase';
import type { PropertyData } from '../shared/interfaces';
import Link from 'next/link';
import { FaHeart, FaStar } from 'react-icons/fa';

const Explorador = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);

  useEffect(() => {
    const loadProperties = async () => {
      const allProperties = await getProperties();
      const publishedProperties = allProperties.filter(p => p.status === 'publicada');
      setProperties(publishedProperties);
    };

    loadProperties();
  }, []);

  return (
    <div className="mx-auto px-[5vw] py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {properties.map((property) => (
          <Link 
            href={`/propiedad/${property.id}`}
            key={property.id} 
            className="group block"
          >
            <div className="relative rounded-xl overflow-hidden">
              {/* Badge Superior - Mostrar tipo de transacción */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
                </span>
              </div>

              {/* Botón Favorito */}
              <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-transform">
                <FaHeart className="w-4 h-4 text-gray-500" />
              </button>

              {/* Imagen Principal */}
              <div className="aspect-[16/12] relative">
                <img 
                  src={property.imageUrls?.[0] || '/placeholder.jpg'} 
                  alt={property.descripcion}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                
                {/* Indicadores de galería */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Contenido */}
              <div className="pt-3 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} en {property.zone}
                    </h3>
                    {property.condo && (
                      <p className="text-sm text-gray-500">
                        {property.condo}
                      </p>
                    )}
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Explorador;
