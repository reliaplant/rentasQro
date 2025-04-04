"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, MapPin } from 'lucide-react';
import { PropertyData } from '@/app/shared/interfaces';
import { getSimilarProperties, getZoneById } from '@/app/shared/firebase';

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

  useEffect(() => {
    let isMounted = true;

    async function fetchSimilarProperties() {
      try {
        console.log("SIMILAR: Starting fetch for similar properties");

        const similarProps = await getSimilarProperties({
          currentPropertyId,
          propertyType,
          transactionType,
          zone,
          condo,
          price,
          maxResults: 4 // Updated to match the renamed parameter
        });

        console.log("SIMILAR: Got properties:", similarProps.length);
        console.log("SIMILAR: Property IDs:", similarProps.map(p => p.id).join(', '));

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
              console.error("Error fetching zone:", err);
            }
          }
        }

        if (!isMounted) return;
        setZoneNames(zoneMap);
        setProperties(similarProps);
        console.log("SIMILAR: State updated with properties:", similarProps.length);
      } catch (error) {
        console.error("SIMILAR: Error in similar properties:", error);
        if (isMounted) {
          console.log("SIMILAR: Setting empty properties due to error");
          setProperties([]);
        }
      } finally {
        if (isMounted) {
          console.log("SIMILAR: Setting loading to false");
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
    console.log("SIMILAR: Rendering loading state");
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

  // Log the actual number of properties we're about to render
  console.log("SIMILAR: About to render", properties.length, "properties");
  console.log("SIMILAR: Property IDs to render:", properties.map(p => p.id));

  // Hide completely if no properties found
  if (properties.length === 0) {
    console.log("SIMILAR: No properties to render, returning null");
    return null;
  }

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
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for property card to improve readability
function PropertyCard({ property, zoneName }: { property: PropertyData, zoneName?: string }) {
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
              ${(property.price/1000).toFixed(0)}k
            </div>
          )}
        </div>
        
        {/* Property Info - Simplified for smaller cards */}
        <div className="p-2">
          <h4 className="font-medium text-gray-900 text-xs truncate">
            {`${property.propertyType === 'departamento' ? 'Depa' : 'Casa'}${property.condoName ? ` en ${property.condoName}` : ''}`}
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
