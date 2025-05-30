"use client";

import { useState, useEffect } from 'react';
import { getProperty } from '@/app/shared/firebase';
import { PropertyData } from '@/app/shared/interfaces';
import { useFavorites } from '@/app/hooks/useFavorites';
import Link from 'next/link';
import PropertyCard from '@/app/components/PropertyCard'; // Import the shared PropertyCard

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

  // Function to handle removing a property from favorites
  const handleRemoveFromFavorites = (propertyId: string) => {
    toggleFavorite(propertyId);
  };

  return (
    <div className="w-full px-[4vw] py-12">
      <h1 className="text-xl font-semibold mb-6">Mis Favoritos</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {favoriteProperties.map((property, index) => (
          <PropertyCard 
            key={property.id || index}
            property={property} 
            index={index}
            currency="MXN"
            linkTo={`/propiedad/${property.id}`}
            showAsFavorite={true} // Always show as favorite since we're in the favorites page
            onFavoriteClick={(id: string) => handleRemoveFromFavorites(id)} // Pass custom handler for favorite button
          />
        ))}
      </div>
    </div>
  );
}
