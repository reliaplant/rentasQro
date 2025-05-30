'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getZoneById, getZoneCondos } from '@/app/shared/firebase';
import { resumenCondo } from '@/app/shared/interfaces';
import { useFilters } from '@/app/context/FilterContext';

// Initialize mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Define interface for location data
interface Location {
  name: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  forRent: number;
  forSale: number;
  condoId: string;
  zoneId?: string;
  propiedadesRentaResumen?: any[];
  propiedadesVentaResumen?: any[];
  rentPriceMin?: number;
  rentPriceMax?: number;
  salePriceMin?: number;
  salePriceMax?: number;
}

export default function MapaZibata2({ 
  allowCondoFilter = true,
  resizeTrigger = 0,
  immediateResize = false,
  onCondoClick = (condoId: string, condoName: string, properties: any[]) => {}
}: { 
  allowCondoFilter?: boolean,
  resizeTrigger?: number,
  immediateResize?: boolean,
  onCondoClick?: (condoId: string, condoName: string, properties: any[]) => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get filters from context
  const { filters, updateFilter } = useFilters();
  
  // Define a fixed center point for Zibatá
  const ZIBATA_CENTER: [number, number] = [-100.335007, 20.680079];

  // Helper function to parse property list
  const parsePropertyList = (propertyList: any): any[] => {
    if (typeof propertyList === 'string') {
      try {
        propertyList = JSON.parse(propertyList);
      } catch (error) {
        return [];
      }
    }
    
    if (typeof propertyList === 'object' && propertyList !== null && !Array.isArray(propertyList)) {
      return Object.values(propertyList);
    } else if (!Array.isArray(propertyList)) {
      return [];
    }
    
    return propertyList;
  };

  // Fetch condos data from Firebase
  useEffect(() => {
    const fetchCondos = async () => {
      try {
        setLoading(true);
        
        const ZIBATA_ZONE_ID = 'X5oWujYupjRKx0tF8Hlj';
        
        const zoneData = await getZoneById(ZIBATA_ZONE_ID);
        if (!zoneData) {
          throw new Error('Zone not found');
        }
        
        const zoneCondos = await getZoneCondos(ZIBATA_ZONE_ID);
        
        // Filter out condos with invalid coordinates
        const validCondos = zoneCondos.filter((condo: resumenCondo) => 
          condo && 
          condo.coordX !== undefined && 
          condo.coordY !== undefined && 
          !(condo.coordX === 0 && condo.coordY === 0)
        );
        
        if (validCondos.length === 0) {
          setError('No se encontraron condominios con ubicación válida');
          return;
        }
        
        // Convert to the Location format
        const mappedLocations = validCondos.map((condo: resumenCondo) => ({
          name: condo.condoName,
          description: '',
          coordinates: [condo.coordX, condo.coordY] as [number, number],
          forRent: condo.propiedadesEnRenta || 0,
          forSale: condo.propiedadesEnVenta || 0,
          condoId: condo.condoId,
          propiedadesRentaResumen: condo.propiedadesRentaResumen || [],
          propiedadesVentaResumen: condo.propiedadesVentaResumen || [],
          // Include price range data
          rentPriceMin: condo.rentPriceMin || 0,
          rentPriceMax: condo.rentPriceMax || 0,
          salePriceMin: condo.salePriceMin || 0,
          salePriceMax: condo.salePriceMax || 0
        }));
        
        setLocations(mappedLocations);
      } catch (err) {
        setError('Failed to load condominium data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCondos();
  }, []);

  // Custom price formatter based on transaction type with optional suffix
  const formatPriceCustom = (price: number, isRent: boolean, showSuffix = true) => {
    if (isRent) {
      // For rent: Display as "16.5k" format
      return showSuffix 
        ? `${(price / 1000).toFixed(1).replace(/\.0$/, '')}k` 
        : `${(price / 1000).toFixed(1).replace(/\.0$/, '')}`;
    } else {
      // For sale: Display as "3.5 MDP" format
      return showSuffix 
        ? `${(price / 1000000).toFixed(1).replace(/\.0$/, '')} MDP` 
        : `${(price / 1000000).toFixed(1).replace(/\.0$/, '')}`;
    }
  };

  // Initialize map once locations are loaded
  useEffect(() => {
    if (map.current || !mapContainer.current || loading) return;
    if (locations.length === 0) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: ZIBATA_CENTER,
      zoom: 13,
    });
    
    map.current.on('load', () => {
      createMarkers();
      
      // Resize map to fit container properly
      if (immediateResize) {
        map.current?.resize();
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    return () => {
      // Clean up markers when map unmounts
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
      map.current?.remove();
    };
  }, [loading, locations]);

  // Create and display markers on the map - simplified function
  const createMarkers = () => {
    if (!map.current) return;
    
    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }
    
    // Use the transaction type from filters context
    const isRentView = filters.transactionType === 'renta';
    
    // Filter locations based on current transaction type
    let filteredLocations = locations.filter(location => 
      isRentView ? location.forRent > 0 : location.forSale > 0
    );
    
    // Get the properties that will be used for filtering
    const propertiesByLocation = filteredLocations.map(location => {
      const propertiesToCheck = isRentView 
        ? location.propiedadesRentaResumen || []
        : location.propiedadesVentaResumen || [];
        
      return {
        location,
        properties: propertiesToCheck
      };
    });
    
    // Apply filters to properties in each location
    const filteredLocationData = propertiesByLocation.map(({ location, properties }) => {
      // Apply property type filter
      let filteredProps = properties;
      
      if (filters.propertyType) {
        filteredProps = filteredProps.filter((prop: any) => 
          prop.propertyType === filters.propertyType
        );
      }
      
      // Apply preventa filter (using the boolean field, not availability)
      if (filters.preventa) {
        filteredProps = filteredProps.filter((prop: any) => prop.preventa === true);
      }
      
      // Apply bedrooms filter
      if (filters.bedrooms !== null) {
        filteredProps = filteredProps.filter((prop: any) => {
          if (filters.bedrooms === 3) {
            return prop.bedrooms >= 3;
          }
          return prop.bedrooms === filters.bedrooms;
        });
      }
      
      // Apply bathrooms filter
      if (filters.bathrooms !== null) {
        filteredProps = filteredProps.filter((prop: any) => {
          if (filters.bathrooms === 2) {
            return prop.bathrooms >= 2;
          }
          return prop.bathrooms === filters.bathrooms;
        });
      }
      
      // Apply parking spots filter
      if (filters.parkingSpots !== null) {
        filteredProps = filteredProps.filter((prop: any) => {
          if (filters.parkingSpots === 3) {
            return prop.parkingSpots >= 3;
          }
          return prop.parkingSpots === filters.parkingSpots;
        });
      }
      
      // Apply furnished filter - only for rentals
      if (isRentView && filters.isFurnished) {
        filteredProps = filteredProps.filter((prop: any) => prop.furnished);
      }
      
      // Apply pets allowed filter - only for rentals
      if (isRentView && filters.petsAllowed) {
        filteredProps = filteredProps.filter((prop: any) => prop.petsAllowed);
      }
      
      // Apply price filter
      const minPrice = filters.priceRange[0];
      const maxPrice = filters.priceRange[1];
      const MAX_THRESHOLD = 999999999;
      
      if (minPrice > 0 || maxPrice < MAX_THRESHOLD) {
        filteredProps = filteredProps.filter((prop: any) => {
          const price = prop.price || 0;
          return (minPrice === 0 || price >= minPrice) && 
                 (maxPrice >= MAX_THRESHOLD || price <= maxPrice);
        });
      }
      
      return {
        location,
        filteredProperties: filteredProps
      };
    });
    
    // Only keep locations that have properties matching all filters
    const locationsWithMatchingProps = filteredLocationData
      .filter(data => data.filteredProperties.length > 0)
      .map(data => ({
        ...data.location,
        matchingPropertiesCount: data.filteredProperties.length,
        // Calculate new price ranges based on filtered properties
        filteredMinPrice: Math.min(...data.filteredProperties.map((p: any) => p.price || Infinity)),
        filteredMaxPrice: Math.max(...data.filteredProperties.map((p: any) => p.price || 0)),
      }));
    
    // Create new markers from the filtered locations
    locationsWithMatchingProps.forEach(location => {
      // Calculate price range using the filtered properties
      let priceRangeText = '';
      let priceMin = location.filteredMinPrice === Infinity ? 0 : location.filteredMinPrice;
      let priceMax = location.filteredMaxPrice || 0;
      
      // Format price range text - only show suffix at the end
      if (priceMin > 0 && priceMax > 0) {
        if (priceMin === priceMax) {
          // If just one price, show single value
          priceRangeText = formatPriceCustom(priceMin, isRentView);
        } else {
          // For range, only show suffix at the end
          priceRangeText = `${formatPriceCustom(priceMin, isRentView, false)} - ${formatPriceCustom(priceMax, isRentView)}`;
        }
      }
      
      // Get actual property count from filtered properties
      const propertyCount = location.matchingPropertiesCount;
      
      // Create custom HTML element for marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      // Add selected-marker class if this location is the selected condo
      if (filters.selectedCondo === location.condoId) {
        el.classList.add('selected-marker');
      }
      
      // Set accent color based on transaction type
      const accentColor = isRentView ? '#EAB308' : '#8B5CF6';
      
      // Populate marker with content - white background with dark text and pin-like pointer
      el.innerHTML = `
        <div 
          class="flex flex-col items-center"
          style="width: 120px; transform: translate(-50%, -100%);"
          data-condo-id="${location.condoId}"
        >
          <div class="marker-container">
            <div 
              class="rounded-lg px-2 py-1 bg-white text-left shadow-md border border-gray-200"
            >
              ${priceRangeText ? `<div class="text-[10px] font-bold text-gray-700 leading-tight">${priceRangeText}</div>` : ''}
              <div class="flex items-center justify-between leading-tight">
                <span class="text-xs font-medium text-gray-800 truncate max-w-[80px]">${location.name}</span>
                <span class="font-bold text-sm ml-1 text-gray-900">${propertyCount}</span>
              </div>
            </div>
            <div class="marker-pointer" style="border-top-color: ${accentColor};"></div>
          </div>
        </div>
      `;
      
      // Create marker with simplified click handling
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(location.coordinates)
        .addTo(map.current!);
      
      // Simplify click handler
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Handle mobile vs desktop modes differently
        if (!allowCondoFilter) {
          // Mobile mode - show property cards
          const properties = isRentView 
            ? location.propiedadesRentaResumen || []
            : location.propiedadesVentaResumen || [];
            
          const enhancedProperties = properties.map(prop => ({
            ...prop,
            id: prop.id || '',
            condoName: location.name,
            zone: location.zoneId || 'X5oWujYupjRKx0tF8Hlj',
            zoneId: location.zoneId || 'X5oWujYupjRKx0tF8Hlj',
            zoneName: 'Zibatá',
            propertyType: prop.propertyType || 'casa',
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms || 0,
            construccionM2: prop.construccionM2 || 0,
            terrenoM2: prop.terrenoM2 || 0,
            parkingSpots: prop.parkingSpots || 0,
            imageUrls: prop.imageUrl ? [prop.imageUrl] : [],
            transactionType: isRentView ? 'renta' : 'venta',
            price: prop.price || 0,
            preventa: prop.preventa || false,
            descripcion: prop.descripcion || `Propiedad en ${location.name}`
          }));
          onCondoClick(location.condoId, location.name, enhancedProperties);
        } else {
          // Desktop mode - toggle filter
          updateFilter('selectedCondo', 
            filters.selectedCondo === location.condoId ? '' : location.condoId
          );
        }
        
        // Always fly to the marker location with reduced zoom level
        map.current?.flyTo({
          center: location.coordinates,
          zoom: 14,  // Reducido de 16 a 14 para una vista menos cercana
          duration: 800,
          essential: true
        });
      });
      
      // Store marker reference
      markersRef.current.push(marker);
    });
  };

  // Handle map resize when resizeTrigger changes
  useEffect(() => {
    if (!map.current || resizeTrigger <= 0) return;
    
    // Simple resize with minimal interruption
    setTimeout(() => {
      if (map.current) {
        map.current.resize();
      }
    }, 100);
  }, [resizeTrigger]);

  // Update markers when filters change
  useEffect(() => {
    if (!map.current || locations.length === 0) return;
    createMarkers();
  }, [
    filters.transactionType,
    filters.propertyType, 
    filters.selectedCondo,
    filters.priceRange,
    filters.bedrooms,
    filters.bathrooms,
    filters.parkingSpots,
    filters.isFurnished,
    filters.petsAllowed,
    filters.preventa
  ]); 

  // Make sure map resizes when container becomes visible
  useEffect(() => {
    if (!map.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) map.current.resize();
    });
    
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Clear selectedCondo when entering mobile mode
  useEffect(() => {
    if (!allowCondoFilter && filters.selectedCondo) {
      updateFilter('selectedCondo', '');
    }
  }, [allowCondoFilter, filters.selectedCondo, updateFilter]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl mb-2">Cargando mapa...</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Custom CSS for markers */}
      <style jsx global>{`
        .custom-marker {
          cursor: pointer;
        }
        .custom-marker:hover {
          z-index: 100;
        }
        .marker-container {
          position: relative;
        }
        .marker-pointer {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #8B5CF6;
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
        }
        .selected-marker .marker-container > div:first-child {
          transform: scale(1.1);
          box-shadow: 0 0 0 2px #8B5CF6;
          transition: all 0.2s ease-in-out;
        }
        .selected-marker .marker-pointer {
          transform: translateX(-50%);
          box-shadow: none;
          bottom: -10px;
          transition: all 0.2s ease-in-out;
        }
        
        .mapboxgl-map {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100% !important;
          width: 100% !important;
        }

        .map-container {
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
      
      {/* Map container */}
      <div
        ref={mapContainer}
        className="map-container absolute inset-0 w-full h-full shadow-md"
        style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: 0, 
          right: 0,
          height: '100%',
          width: '100%'
        }}
      />
    </div>
  );
}
