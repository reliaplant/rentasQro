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
  zoneId?: string; // Add this property to fix the type error
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
  
  // Get filters from context instead of using local state
  const { filters, updateFilter } = useFilters();
  
  // Define a fixed center point for Zibatá that won't change
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
        
        // Filter out condos with (0,0) coordinates or invalid coordinates
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

  // Add state to track user interactions with markers
  const [userInteracted, setUserInteracted] = useState(false);
  const [lastPosition, setLastPosition] = useState<{center: mapboxgl.LngLat, zoom: number} | null>(null);
  // Add a ref to store the currently focused condo coordinates
  const focusedMarkerRef = useRef<[number, number] | null>(null);
  // Add this state to track if map interactions are in progress
  const [mapTransitionInProgress, setMapTransitionInProgress] = useState(false);

  // Add a ref to track if we need to skip the next resize
  const skipNextResizeRef = useRef(false);

  // Add a function to detect significant map movement
  const hasMapMovedSignificantly = (oldCenter: mapboxgl.LngLat, newCenter: mapboxgl.LngLat) => {
    // Check if the movement is significant (> 0.001 degrees ~ roughly 100m)
    return Math.abs(oldCenter.lng - newCenter.lng) > 0.001 || 
           Math.abs(oldCenter.lat - newCenter.lat) > 0.001;
  };

  // Create and display markers on the map
  const createMarkers = (shouldRecenter = true) => {
    if (!map.current) return;
    
    // Clear existing markers but keep the map position
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }
    
    // Use the transaction type from filters context
    const isRentView = filters.transactionType === 'renta';
    
    // Filter locations based on current transaction type from filters
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
        console.log(`Filtering for preventa properties in map`);
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
      
      // Create marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(location.coordinates)
        .addTo(map.current!);
      
      // Modify the click handlers to preserve the current position
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent multiple interactions simultaneously
        if (mapTransitionInProgress) return;
        
        console.log(`Marker clicked: allowCondoFilter=${allowCondoFilter}, condo=${location.name}`);
        
        // Set flag to prevent interruptions
        setMapTransitionInProgress(true);
        
        // Save these coordinates as the focused marker
        focusedMarkerRef.current = location.coordinates;
        
        // Store current position before any interaction
        if (map.current) {
          setLastPosition({
            center: map.current.getCenter(),
            zoom: map.current.getZoom()
          });
          setUserInteracted(true);
        }
        
        // For both mobile and desktop: explicitly center on clicked marker with smoother animation
        map.current?.flyTo({
          center: location.coordinates,
          zoom: 16,
          duration: 800,  // Slightly shorter duration
          essential: true // Make this animation essential
        });
        
        // Wait until the animation is complete before handling the rest of the logic
        setTimeout(() => {
          // STRICTLY SEPARATE MOBILE AND DESKTOP BEHAVIOR
          if (!allowCondoFilter) {
            // ---------- MOBILE MODE ONLY ----------
            console.log('Mobile mode marker click - showing properties only');
            
            // Get properties for the current transaction type
            const properties = isRentView 
              ? location.propiedadesRentaResumen || []
              : location.propiedadesVentaResumen || [];
            
            // Transform the properties
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
            
            // Call the callback with the enhanced property data
            onCondoClick(location.condoId, location.name, enhancedProperties);
            
            // CRITICAL: ALWAYS clear any selected markers in mobile mode
            markersRef.current.forEach(marker => {
              marker.getElement().classList.remove('selected-marker');
            });
            
            // CRITICAL: ALWAYS ensure no filter is applied in mobile mode
            if (filters.selectedCondo) {
              console.log('Clearing selectedCondo filter in mobile mode');
              updateFilter('selectedCondo', '');
            }
          } else {
            // ---------- DESKTOP MODE ONLY ----------
            console.log('Desktop mode marker click - filtering');
            
            // Only toggle filter if in desktop mode
            if (filters.selectedCondo === location.condoId) {
              updateFilter('selectedCondo', '');
              
              // Remove selected-marker class from all markers
              markersRef.current.forEach(marker => {
                marker.getElement().classList.remove('selected-marker');
              });
            } else {
              // Otherwise, select this condo
              updateFilter('selectedCondo', location.condoId);
              
              // Remove selected-marker class from all markers first
              markersRef.current.forEach(marker => {
                marker.getElement().classList.remove('selected-marker');
              });
              
              // Add selected-marker class to this marker
              el.classList.add('selected-marker');
            }
          }
          
          // Reset the transition flag
          setMapTransitionInProgress(false);
        }, 850); // Slightly longer than the flyTo duration to ensure animation completes
      });
      
      // Store marker reference
      markersRef.current.push(marker);
    });
    
    // After creating all markers, restore focus if we have a previously clicked marker
    if (map.current && focusedMarkerRef.current && shouldRecenter && !mapTransitionInProgress) {
      // Use a very short timeout to ensure markers are fully rendered
      setTimeout(() => {
        if (map.current && focusedMarkerRef.current) {
          map.current.setCenter(focusedMarkerRef.current);
        }
      }, 50);
    }
  };

  // Initialize map once locations are loaded
  useEffect(() => {
    if (map.current || !mapContainer.current || loading) return;
    if (locations.length === 0) return;

    // Initialize map
    const initMap = () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: ZIBATA_CENTER,
        zoom: 13,
      });
      
      map.current.on('load', () => {
        map.current?.setCenter(ZIBATA_CENTER);
        createMarkers();
        
        // Immediately resize the map to avoid delay
        if (immediateResize) {
          map.current?.resize();
        }
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    };

    initMap();

    return () => {
      // Clean up markers when map unmounts
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
      map.current?.remove();
    };
  }, [loading, locations, immediateResize]);

  // Add an immediate resize effect to fix map when it becomes visible
  useEffect(() => {
    if (immediateResize && map.current) {
      // Resize immediately and then a few more times to ensure proper rendering
      map.current.resize();
      
      // Additional resize attempts with short intervals
      const timers = [50, 100, 200, 300].map(ms => 
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
            map.current.setCenter(ZIBATA_CENTER);
          }
        }, ms)
      );
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [immediateResize, ZIBATA_CENTER]);

  // Add a new effect to resize the map when it becomes visible in mobile view
  useEffect(() => {
    // Check if map exists and container is visible
    if (map.current && mapContainer.current) {
      // Use setTimeout to allow time for the DOM to update and container to be fully visible
      const resizeTimer = setTimeout(() => {
        map.current?.resize();
        // Re-center the map to make sure it's showing the correct location
        map.current?.setCenter(ZIBATA_CENTER);
      }, 300);
      
      return () => clearTimeout(resizeTimer);
    }
  }, []);

  // Listen for parent container visibility changes (for mobile view)
  useEffect(() => {
    if (!map.current) return;
    
    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        // Resize the map whenever the container size changes
        map.current?.resize();
      }
    });
    
    // Start observing the container
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }
    
    return () => {
      // Clean up the observer when component unmounts
      resizeObserver.disconnect();
    };
  }, []);

  // Update markers when filters change (including availability)
  useEffect(() => {
    if (!map.current || locations.length === 0) return;
    
    // If a map transition is in progress, don't recreate markers
    if (mapTransitionInProgress) return;
    
    // Store current position before recreating markers
    let currentPosition = null;
    if (userInteracted && map.current) {
      currentPosition = {
        center: map.current.getCenter(),
        zoom: map.current.getZoom()
      };
    }
    
    // Save the marker elements before clearing them
    const oldMarkerElements = markersRef.current.map(marker => {
      const el = marker.getElement();
      const position = marker.getLngLat();
      const isSelected = el.classList.contains('selected-marker');
      return { position, isSelected, condoId: el.getAttribute('data-condo-id') };
    });
    
    // Create new markers without clearing the view
    let shouldPreservePosition = currentPosition !== null ||
                                focusedMarkerRef.current !== null;
    
    if (shouldPreservePosition) {
      createMarkers(false); // Pass flag to indicate we should preserve position
    } else {
      createMarkers(true); // Default behavior
    }
    
    // Only restore position if needed and not during an animation
    if (shouldPreservePosition && !mapTransitionInProgress) {
      if (focusedMarkerRef.current) {
        // Prioritize the focused marker
        map.current.setCenter(focusedMarkerRef.current);
      } else if (currentPosition) {
        // Fall back to the last interaction position
        map.current.setCenter(currentPosition.center);
        map.current.setZoom(currentPosition.zoom);
      }
    }
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
    filters.preventa,
    locations,
    userInteracted,
    mapTransitionInProgress // Add the new state as a dependency
  ]);

  // Completely rework the resizeTrigger effect to be much more conservative
  useEffect(() => {
    if (resizeTrigger <= 0 || !map.current) return;
    
    // NEVER resize during transitions or if we should skip this resize
    if (mapTransitionInProgress || skipNextResizeRef.current) {
      console.log('Skipping map resize - interaction in progress or skip flag set');
      skipNextResizeRef.current = false;
      return;
    }
    
    console.log(`Map resize #${resizeTrigger} triggered`);
    
    // Store current position before resize
    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();
    
    // ONLY resize the map, don't change the view yet
    map.current.resize();
    
    // Wait for the resize to complete naturally, then check if we need to adjust
    // Use a longer timeout to give the map time to stabilize
    const resizeTimer = setTimeout(() => {
      if (!map.current) return;
      
      // Check if the map moved during resize
      const newCenter = map.current.getCenter();
      const newZoom = map.current.getZoom();
      const mapMoved = hasMapMovedSignificantly(currentCenter, newCenter);
      
      console.log(`Map resize complete. Map moved: ${mapMoved}`);
      
      // If map didn't move significantly, do nothing!
      if (!mapMoved && newZoom === currentZoom) {
        console.log('Position maintained after resize, no adjustment needed');
        return;
      }
      
      // For positions with active user interaction, prioritize maintaining current view
      // instead of jumping to preset positions
      if (userInteracted) {
        console.log('User has interacted - maintaining current position');
        // Quietly restore position with no animation
        map.current.setCenter(currentCenter);
        map.current.setZoom(currentZoom);
        return;
      }
      
      // If we get here and have a focused marker, only use it if necessary
      if (focusedMarkerRef.current) {
        // Skip if the current view is already near the focused marker
        // Convert to proper LngLat object using mapboxgl.LngLat.convert()
        const focusedPos = mapboxgl.LngLat.convert({
          lng: focusedMarkerRef.current[0], 
          lat: focusedMarkerRef.current[1]
        });
        
        if (!hasMapMovedSignificantly(currentCenter, focusedPos)) {
          console.log('Already near focused marker, skipping repositioning');
          return;
        }
        
        // If we need to move to the marker, do it very smoothly
        console.log('Moving to focused marker with smooth transition');
        map.current.flyTo({
          center: focusedMarkerRef.current,
          zoom: currentZoom,
          duration: 1000, // Much longer, smoother animation
          essential: true
        });
        return;
      }
      
      // Last resort - fall back to Zibatá center
      console.log('Default position - no user interaction or focused marker');
      map.current.setCenter(ZIBATA_CENTER);
    }, 200); // Longer timeout to ensure map is stable
    
    return () => clearTimeout(resizeTimer);
  }, [resizeTrigger]); // Minimal dependencies

  // Add effect to handle when flyTo animation completes to prevent multiple recenters
  useEffect(() => {
    if (!map.current) return;
    
    const handleMoveEnd = () => {
      // After a flyTo completes, skip the next resize-triggered movement
      // This prevents "double movements" when both flyTo and resize happen
      skipNextResizeRef.current = true;
      
      // Auto-clear the skip flag after a brief period
      setTimeout(() => {
        skipNextResizeRef.current = false;
      }, 500);
    };
    
    map.current.on('moveend', handleMoveEnd);
    
    return () => {
      map.current?.off('moveend', handleMoveEnd);
    };
  }, [map.current]);

  // Add an effect to ensure selectedCondo is always cleared when entering mobile mode
  useEffect(() => {
    if (!allowCondoFilter && filters.selectedCondo) {
      console.log('Mobile mode detected - clearing any selectedCondo filter');
      updateFilter('selectedCondo', '');
      
      // Also clear any marker selections
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          marker.getElement().classList.remove('selected-marker');
        });
      }
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
        /* Add back selected marker styles */
        .selected-marker .marker-container > div:first-child {
          transform: scale(1.1);
          box-shadow: 0 0 0 2px #8B5CF6;
          transition: all 0.2s ease-in-out;
        }
        /* Ensure the pointer doesn't get the outline or scale effect */
        .selected-marker .marker-pointer {
          transform: translateX(-50%);
          box-shadow: none;
          bottom: -10px;
          transition: all 0.2s ease-in-out;
        }
        
        /* Add styles to ensure map container and mapboxgl-map both fill the container */
        .mapboxgl-map {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100% !important;
          width: 100% !important;
        }

        /* Force map container to fill available space */
        .map-container {
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
      
      {/* Map container - ensure it takes full height and width */}
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
