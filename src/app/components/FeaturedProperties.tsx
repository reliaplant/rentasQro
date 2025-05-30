'use client';

import { PropertyData } from '../shared/interfaces';
import PropertyCard from './PropertyCard';
import { useFilters } from '../context/FilterContext';
import Link from 'next/link';

interface FeaturedPropertiesProps {
  transactionType: 'renta' | 'compra';
  limit: number;
  preventa?: boolean;
  properties?: PropertyData[]; // Add properties as an optional prop
  isLoading?: boolean; // Add isLoading as an optional prop
}

export default function FeaturedProperties({
  transactionType,
  limit,
  preventa = false,
  properties = [],
  isLoading = false
}: FeaturedPropertiesProps) {
  const { filters } = useFilters();
  
  // Render loading skeletons when loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="group block">
            <div className="relative rounded-xl overflow-hidden">
              <div className="aspect-[16/12] bg-gray-200 animate-pulse"></div>
              <div className="pt-2 sm:pt-3 space-y-2 sm:space-y-3">
                <div className="w-3/4 h-4 sm:h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/2 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/3 h-4 sm:h-5 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Handle no properties case
  if (properties.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No se encontraron propiedades</p>
        <Link href={`/explorar?t=${transactionType}`} className="text-violet-600 font-medium mt-2 inline-block">
          Ver todas las propiedades
        </Link>
      </div>
    );
  }
  
  // Render properties in a 2x2 grid on mobile, 4 in a row on desktop
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {properties.map((property, index) => (
        <PropertyCard 
          key={property.id || index} 
          property={property} 
          index={index}
          currency={filters.currency}
          // Remove the type prop - we just want the featured properties to appear first 
          // without having a different appearance
        />
      ))}
    </div>
  );
}
