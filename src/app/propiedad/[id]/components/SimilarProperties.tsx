"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, MapPin } from 'lucide-react';
import { PropertyData } from '@/app/shared/interfaces';
import { getSimilarProperties, getZoneById } from '@/app/shared/firebase';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';

interface SimilarPropertiesProps {
  currentPropertyId: string;
  propertyType: string;
  transactionType: string;
  zone?: string;
  condo?: string;
  price?: number;
}

export default function SimilarProperties({
  currentPropertyId,
  propertyType,
  transactionType,
  zone,
  condo,
  price
}: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneNames, setZoneNames] = useState<Record<string, string>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<'MXN' | 'USD'>('MXN');
  const { convertMXNtoUSD } = useExchangeRate();

  // Load currency preference from localStorage
  useEffect(() => {
    // Function to load currency from localStorage
    const loadCurrency = () => {
      try {
        if (typeof window !== 'undefined') {
          const filtersJson = localStorage.getItem('propertyFilters');
          if (filtersJson) {
            const filters = JSON.parse(filtersJson);
            if (filters && (filters.currency === 'USD' || filters.currency === 'MXN')) {
              setSelectedCurrency(filters.currency);
            }
          }
        }
      } catch (error) {
        console.error('Error reading currency from localStorage:');
      }
    };

    // Initial load
    loadCurrency();

    // Set up polling to detect changes from other components
    const intervalId = setInterval(loadCurrency, 500);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchSimilarProperties() {
      try {

        const similarProps = await getSimilarProperties({
          currentPropertyId,
          propertyType,
          transactionType,
          zone,
          condo,
          price,
          maxResults: 4 // Updated to match the renamed parameter
        });



        // Only update state if component is still mounted
        if (!isMounted) return;

        // Get zone names 
        const zoneMap: Record<string, string> = {};
        for (const prop of similarProps) {
          if (prop?.zone && !zoneMap[prop.zone]) {
            try {
              const zoneData = await getZoneById(prop.zone);
              if (zoneData && zoneData.name) {
                zoneMap[prop.zone] = zoneData.name;
              }
            } catch (err) {
              console.error("Error fetching zone:");
            }
          }
        }

        if (!isMounted) return;
        setZoneNames(zoneMap);
        setProperties(similarProps);
      } catch (error) {
        console.error("SIMILAR: Error in similar properties:");
        if (isMounted) {
          setProperties([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSimilarProperties();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [currentPropertyId, propertyType, transactionType, zone, condo, price]);

  // Don't show anything while loading
  if (loading) {
 
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Propiedades similares</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-28 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }



  // Hide completely if no properties found
  if (properties.length === 0) {

    return null;
  }

  // Format price based on currency and value
  const formatPrice = (priceValue: number) => {
    if (selectedCurrency === 'USD') {
      // Convert MXN to USD
      const usdPrice = convertMXNtoUSD(priceValue);
      
      // Format based on value range
      if (usdPrice < 1000) {
        return `USD ${usdPrice.toFixed(0)}`;
      } else if (usdPrice < 1000000) {
        return `USD ${(usdPrice / 1000).toFixed(usdPrice % 1000 === 0 ? 0 : 1)} K`;
      } else {
        return `USD ${(usdPrice / 1000000).toFixed(1)} M`;
      }
    } else {
      // MXN formatting
      if (priceValue < 1000000) {
        return `${(priceValue / 1000).toFixed(priceValue % 1000 === 0 ? 0 : 1)} K`;
      } else {
        return `${(priceValue / 1000000).toFixed(1)} MDP`;
      }
    }
  };

  return (
    <div className="">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Propiedades similares</h3>
      
      {/* Grid layout - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            zoneName={property.zone ? zoneNames[property.zone] : undefined}
            selectedCurrency={selectedCurrency}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for property card to improve readability
function PropertyCard({ 
  property, 
  zoneName, 
  selectedCurrency, 
  formatPrice 
}: { 
  property: PropertyData, 
  zoneName?: string,
  selectedCurrency: 'MXN' | 'USD',
  formatPrice: (price: number) => string
}) {
  // Handle dummy properties
  if (property.isDummy) {
    return (
      <div className="block group">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          <div className="relative h-28 w-full bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
              Ver más propiedades
            </div>
          </div>
          <div className="p-2">
            <h4 className="font-medium text-gray-500 text-sm truncate">
              {property.propertyType === 'casa' ? 'Casas similares' : 'Propiedades similares'}
            </h4>
            <p className="text-xs text-gray-400 truncate">
              {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular property card
  return (
    <Link href={`/propiedad/${property.id}`} className="block group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full">
        {/* Property Image */}
        <div className="relative h-28 w-full">
          {property.imageUrls && property.imageUrls[0] ? (
            <div className="relative w-full h-full">
              <Image 
                src={property.imageUrls[0]} 
                alt="Propiedad"
                fill
                className="object-cover"
                priority={false}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Propiedad</span>
            </div>
          )}
          {property.price && property.price > 0 && (
            <div className="absolute bottom-1 right-1 bg-white/80 rounded border border-white px-1 text-xs font-medium">
              {formatPrice(property.price)}
            </div>
          )}
        </div>
        
        {/* Property Info - Simplified for smaller cards */}
        <div className="p-2">
            <h4 className="font-medium text-gray-900 text-xs truncate">
            {property.propertyType === 'departamento' ? 'Depa' : 'Casa'}
            {property.modelo && ` ${property.modelo}`}
            {property.condoName && ` en ${property.condoName}`}
            </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed size={12} />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath size={12} />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {zoneName && (
              <div className="flex items-center gap-1 truncate">
                <MapPin size={12} />
                <span className="truncate text-[11px]">{zoneName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
