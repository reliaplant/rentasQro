"use client";

import { useState, useEffect } from 'react';
import { PropertyData } from '@/app/shared/interfaces';
import { getSimilarProperties, getZoneById } from '@/app/shared/firebase';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';
import PropertyCard from '@/app/components/PropertyCard'; // Import the shared PropertyCard component

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

  return (
    <div className="">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Propiedades similares</h3>
      
      {/* Grid layout - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {properties.map((property, index) => (
          <PropertyCard 
            key={property.id || index}
            property={property}
            index={index}
            currency={selectedCurrency as 'MXN' | 'USD'}
            linkTo={`/propiedad/${property.id}`}
            className="w-full h-full"
            type="compact" // Use a compact style for the similar properties grid
            showAsFavorite={false} // Don't show favorite button in similar properties
          />
        ))}
      </div>
    </div>
  );
}
