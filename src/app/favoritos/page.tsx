"use client";

import { useState, useEffect } from 'react';
import { getProperty } from '@/app/shared/firebase';
import { PropertyData } from '@/app/shared/interfaces';
import { useFavorites } from '@/app/hooks/useFavorites';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, MapPin, X } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavoriteProperties() {
      if (favorites.length === 0) {
        setFavoriteProperties([]);
        setLoading(false);
        return;
      }

      try {
        const propertiesPromises = favorites.map(id => getProperty(id).catch(() => null));
        const properties = await Promise.all(propertiesPromises);
        
        // Filter out any null results (failed to load)
        setFavoriteProperties(properties.filter(p => p !== null) as PropertyData[]);
      } catch (error) {
        console.error('Error loading favorite properties:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFavoriteProperties();
  }, [favorites]);

  const formatPropertyType = (type: string) => {
    if (type === 'departamento') return 'Depa';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <div className="w-full px-[4vw] py-12">
        <h1 className="text-3xl font-semibold mb-6">Mis Favoritos</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="w-full px-[4vw] py-24">
        <h1 className="text-xl font-semibold mb-6">Mis Favoritos</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-medium text-gray-700">No tienes propiedades guardadas</h2>
          <p className="text-gray-500 mt-2">
            Guarda propiedades haciendo clic en el ícono de corazón para verlas después
          </p>
          <Link href="/" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-lg">
            Explorar propiedades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-[4vw] py-12">
      <h1 className="text-xl font-semibold mb-6">Mis Favoritos</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {favoriteProperties.map(property => (
          <div key={property.id} className="group block">
            <div className="bg-white rounded-xl overflow-hidden relative">
              {/* Badge de transacción */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
                </span>
              </div>

              {/* Remove from favorites button */}
              <button 
                onClick={() => toggleFavorite(property.id!)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-200 cursor-pointer group/btn"
                aria-label="Quitar de favoritos"
              >
                <X size={16} className="text-gray-400 group-hover/btn:text-pink-500 transition-colors duration-200" />
              </button>

              {/* Property Image */}
              <Link href={`/propiedad/${property.id}`}>
                <div className="aspect-[16/12] relative bg-gray-100">
                  {property.imageUrls && property.imageUrls[0] ? (
                    <Image
                      src={property.imageUrls[0]}
                      alt={property.condoName || "Propiedad"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={false}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Property Info */}
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
        ))}
      </div>
    </div>
  );
}
