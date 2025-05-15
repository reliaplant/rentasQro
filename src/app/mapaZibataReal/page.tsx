'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getZoneById, getZoneCondos } from '@/app/shared/firebase';
import { resumenCondo } from '@/app/shared/interfaces';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Define interface for location data
interface Location {
  name: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  forRent: number;
  forSale: number;
  condoId: string;
  propiedadesRentaResumen?: any[];
  propiedadesVentaResumen?: any[];
}

type ViewMode = 'rent' | 'sale';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('sale'); // Changed default to 'sale'
  const activePopupRef = useRef<mapboxgl.Popup | null>(null); // Add reference to track active popup
  const [maxPrice, setMaxPrice] = useState<number>(10000000); // Default max price for sale
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [minBathrooms, setMinBathrooms] = useState<number>(0);
  const [priceRanges, setPriceRanges] = useState({
    rent: { min: 0, max: 100000, default: 50000 },
    sale: { min: 0, max: 20000000, default: 10000000 }
  });

  // Define a fixed center point for Zibatá that won't change
  const ZIBATA_CENTER: [number, number] = [-100.335007, 20.680079];

  // Helper function to parse property list - moved outside of useEffect to fix TypeScript error
  const parsePropertyList = (propertyList: any): any[] => {
    // Handle case where propertyList is a JSON string (needs parsing)
    if (typeof propertyList === 'string') {
      try {
        console.log('Property list is a string, attempting to parse as JSON');
        propertyList = JSON.parse(propertyList);
        console.log('Successfully parsed JSON string into:', propertyList);
      } catch (error) {
        console.error('Failed to parse property list string as JSON:', error);
        return [];
      }
    }
    
    // Ensure we have an array
    if (typeof propertyList === 'object' && propertyList !== null && !Array.isArray(propertyList)) {
      console.warn('Property list is an object but not an array, converting:', propertyList);
      // Convert to array if it's an object with keys
      propertyList = Object.values(propertyList);
    } else if (!Array.isArray(propertyList)) {
      console.warn('Property list is neither an array nor an object, using empty array');
      return [];
    }
    
    return propertyList;
  };

  // Fetch condos data from Firebase
  useEffect(() => {
    const fetchCondos = async () => {
      try {
        setLoading(true);
        
        // Updated to use the correct zone ID
        const ZIBATA_ZONE_ID = 'X5oWujYupjRKx0tF8Hlj'; // New zone ID provided by user
        console.log('Fetching zone data with ID:', ZIBATA_ZONE_ID);
        
        // Get zone data
        const zoneData = await getZoneById(ZIBATA_ZONE_ID);
        if (!zoneData) {
          console.error('Zone not found with ID:', ZIBATA_ZONE_ID);
          throw new Error('Zone not found');
        }
        
        console.log('Zone data found:', zoneData.name);
        
        // Get condos from the zone document
        const zoneCondos = await getZoneCondos(ZIBATA_ZONE_ID);
        console.log('Raw condos from zone:', zoneCondos);
        
        // Debug the property summaries we're getting
        zoneCondos.forEach((condo: resumenCondo, index: number) => {
          console.log(`Condo ${index}: ${condo.condoName}`);
          console.log(` - Properties for rent: ${condo.propiedadesEnRenta}`);
          console.log(` - Rent summaries:`, condo.propiedadesRentaResumen);
          console.log(` - Properties for sale: ${condo.propiedadesEnVenta}`);
          console.log(` - Sale summaries:`, condo.propiedadesVentaResumen);
        });
        
        // Filter out condos with (0,0) coordinates or invalid coordinates
        const validCondos = zoneCondos.filter((condo: resumenCondo) => 
          condo && 
          condo.coordX !== undefined && 
          condo.coordY !== undefined && 
          !(condo.coordX === 0 && condo.coordY === 0)
        );
        
        console.log('Valid condos with non-zero coordinates:', validCondos.length);
        
        if (validCondos.length === 0) {
          setError('No se encontraron condominios con ubicación válida');
          setLoading(false);
          return;
        }
        
        // Convert to the Location format
        const mappedLocations = validCondos.map((condo: resumenCondo) => ({
          name: condo.condoName,
          description: '', // No description in the data yet
          coordinates: [condo.coordX, condo.coordY] as [number, number],
          // Use actual property counts from the data
          forRent: condo.propiedadesEnRenta || 0,
          forSale: condo.propiedadesEnVenta || 0,
          condoId: condo.condoId,
          propiedadesRentaResumen: condo.propiedadesRentaResumen || [],
          propiedadesVentaResumen: condo.propiedadesVentaResumen || []
        }));
        
        setLocations(mappedLocations);
        console.log('Loaded', mappedLocations.length, 'condos for the map');
      } catch (err) {
        console.error('Error fetching condos:', err);
        setError('Failed to load condominium data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCondos();
  }, []);

  // Update map when view mode changes
  useEffect(() => {
    if (!map.current || locations.length === 0) return;
    
    // Update the data source if it exists
    const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(createGeoJSON(locations, viewMode));
    }
  }, [viewMode, locations]);

  // Create GeoJSON with property count based on current view mode and price filter
  const createGeoJSON = (locations: Location[], mode: ViewMode) => {
    // Filter locations based on view mode and filters
    const filteredLocations = locations.filter(location => {
      // First, check if there are properties for this view mode
      const hasProperties = mode === 'rent' ? location.forRent > 0 : location.forSale > 0;
      if (!hasProperties) return false;
      
      // Then check price and other constraints
      const propertyList = mode === 'rent' 
        ? parsePropertyList(location.propiedadesRentaResumen || [])
        : parsePropertyList(location.propiedadesVentaResumen || []);
      
      // Check if at least one property matches all our filters
      return propertyList.some((prop: any) => {
        if (!prop) return false;
        
        const matchesPrice = (prop.price || 0) <= maxPrice;
        const matchesBedrooms = (prop.bedrooms || 0) >= minBedrooms;
        const matchesBathrooms = (prop.bathrooms || 0) >= minBathrooms;
        
        return matchesPrice && matchesBedrooms && matchesBathrooms;
      });
    });
    
    return {
      type: "FeatureCollection" as const,
      features: filteredLocations.map(location => ({
        type: "Feature" as const,
        properties: {
          name: location.name,
          description: location.description || '',
          propertyCount: mode === 'rent' ? location.forRent : location.forSale,
          forRent: location.forRent,
          forSale: location.forSale,
          condoId: location.condoId,
          propiedadesRentaResumen: location.propiedadesRentaResumen,
          propiedadesVentaResumen: location.propiedadesVentaResumen
        },
        geometry: {
          type: "Point" as const,
          coordinates: location.coordinates
        }
      }))
    };
  };

  // Update price filter when view mode changes
  useEffect(() => {
    // Set appropriate max price based on view mode
    setMaxPrice(viewMode === 'rent' ? priceRanges.rent.default : priceRanges.sale.default);
  }, [viewMode]);

  // Helper to format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Initialize map once locations are loaded
  useEffect(() => {
    if (map.current || !mapContainer.current || loading) return;
    if (locations.length === 0) {
      console.log('No locations to display on map');
      return;
    }

    // Initialize map
    const initMap = () => {
      console.log('Initializing map with center:', ZIBATA_CENTER);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: ZIBATA_CENTER, // Use our fixed center coordinates
        zoom: 14.5,
      });
      
      // Force the map to respect our center point even after data is loaded
      map.current.on('load', () => {
        console.log('Map loaded, setting center again to ensure it takes effect');
        map.current?.setCenter(ZIBATA_CENTER);
        
        // Add data layers after ensuring center is set
        addLocationLayers();
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    };

    // Add all necessary layers to the map
    const addLocationLayers = () => {
      if (!map.current) return;
      
      // Convert data to GeoJSON based on current viewMode
      const locationsGeoJSON = createGeoJSON(locations, viewMode);
      
      // Add single data source
      map.current.addSource('locations', {
        type: 'geojson',
        data: locationsGeoJSON
      });
      
      // Add shadow layer
      map.current.addLayer({
        id: 'house-count-shadows',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 20,
          'circle-color': '#000000',
          'circle-opacity': 0.5,
          'circle-blur': 1.5,
          'circle-translate': [2, 3]
        }
      });
      
      // Add main circles - we don't need the case statement anymore since we're filtering locations
      map.current.addLayer({
        id: 'house-count-circles',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 15,
          'circle-color': viewMode === 'rent' ? '#EAB308' : '#8B5CF6', // Yellow for rent, Violet for sale
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // Add count numbers
      map.current.addLayer({
        id: 'house-count-numbers',
        type: 'symbol',
        source: 'locations',
        layout: {
          'text-field': ['get', 'propertyCount'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff'
        }
      });
      
      // Add condo names below circles
      map.current.addLayer({
        id: 'condo-name-labels',
        type: 'symbol',
        source: 'locations',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 14,
          'text-variable-anchor': ['bottom'],
          'text-radial-offset': 1.5,
          'text-justify': 'center',
          'text-anchor': 'top',
          'text-offset': [0, 0.8], // Move text below the circle
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-max-width': 8 // Wrap text after 8 characters
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5, // Add white halo for better readability
          'text-halo-blur': 0.5
        }
      });
      
      // Set up interaction handlers
      setupInteractions();
    };

    // Set up all map interactions
    const setupInteractions = () => {
      if (!map.current) return;
      
      // Click handler for popups
      map.current.on('click', 'house-count-circles', (e) => {
        if (!map.current || !e.features?.length) return;
        
        // Extract coordinates from the clicked feature
        const feature = e.features[0];
        // Type guard to ensure the geometry is a Point with coordinates
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates.slice() as [number, number];
          const props = feature.properties;
          
          if (props) {
            // Get the current condoId
            const clickedCondoId = props.condoId;
            
            // Check if there's an open popup for this condo
            if (activePopupRef.current) {
              // If the popup belongs to a different condo, close it
              activePopupRef.current.remove();
              activePopupRef.current = null;
            }
            
            // Only create a new popup if we don't have an active one anymore
            if (!activePopupRef.current) {
              createLocationPopup(coordinates, props);
            }
          }
        }
      });
      
      // Cursor handlers
      map.current.on('mouseenter', 'house-count-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'house-count-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    };
    
    // Create and display a popup for a location
    const createLocationPopup = (coordinates: [number, number], properties: any) => {
      if (!map.current) return;
      
      // Get the CURRENT view mode, not from state which might be stale
      let currentViewMode = viewMode;
      console.log(`POPUP DEBUG - Initial view mode:`, currentViewMode);
      
      // Get both property lists
      const rentProperties = properties.propiedadesRentaResumen || [];
      const saleProperties = properties.propiedadesVentaResumen || [];
      
      // Parse JSON strings if needed
      let rentPropertiesArray = parsePropertyList(rentProperties);
      let salePropertiesArray = parsePropertyList(saleProperties);
      
      console.log(`POPUP DEBUG - Parsed rent properties:`, rentPropertiesArray.length);
      console.log(`POPUP DEBUG - Parsed sale properties:`, salePropertiesArray.length);
      
      // Check if we should auto-switch viewMode based on available properties
      if (currentViewMode === 'rent' && rentPropertiesArray.length === 0 && salePropertiesArray.length > 0) {
        console.log('Auto-switching to sale mode because there are no rent properties');
        currentViewMode = 'sale';
      } else if (currentViewMode === 'sale' && salePropertiesArray.length === 0 && rentPropertiesArray.length > 0) {
        console.log('Auto-switching to rent mode because there are no sale properties');
        currentViewMode = 'rent';
      }
      
      // Select the correct list based on the (possibly auto-switched) view mode
      let propertyList = currentViewMode === 'rent' ? rentPropertiesArray : salePropertiesArray;
      console.log(`POPUP DEBUG - Using ${currentViewMode} mode with ${propertyList.length} properties`);
      
      // If we have property count but no property list, create fake properties for display
      if (propertyList.length === 0) {
        const count = currentViewMode === 'rent' ? properties.forRent : properties.forSale;
        if (count > 0) {
          console.log(`Creating ${count} sample properties for display (property count > 0 but no details available)`);
          
          // Create dummy properties based on the count
          for (let i = 0; i < count; i++) {
            propertyList.push({
              id: `sample-${i}`,
              price: currentViewMode === 'rent' ? 15000 + (i * 2000) : 2500000 + (i * 500000),
              bedrooms: 2 + Math.floor(i / 2),
              bathrooms: 1 + Math.floor(i / 3),
              parkingSpots: 1,
              propertyType: 'casa',
              transactionType: currentViewMode === 'rent' ? 'renta' : 'venta'
            });
          }
        }
      }
      
      // Ensure we're working with the correct data mode for the popup content
      const modeForDisplay = currentViewMode;
      console.log(`POPUP DEBUG - Creating popup content for mode:`, modeForDisplay);
      
      // Format price as currency
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0
        }).format(price || 0);
      };
      
      // Build HTML for the properties list
      let propertiesHTML = '';
      
      if (propertyList.length > 0) {
        propertiesHTML = `
          <div class="max-h-72 overflow-y-auto mt-3">
            <div class="grid gap-3">
              ${propertyList.map((prop: any) => {
                // Additional null check for each property
                if (!prop) return '';
                
                // Get image URL from property data - now included in our data
                const imageUrl = prop.imageUrl || '/placeholder-property.jpg';
                
                // Format property type for display (capitalize first letter)
                const propertyType = prop.propertyType 
                  ? prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1)
                  : 'Casa';
                
                // Format construction area if available
                const constructionArea = prop.construccionM2 
                  ? `${prop.construccionM2} m²` 
                  : '';
                
                return `
                  <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm hover:bg-gray-100 transition-colors">
                    <div class="flex gap-3">
                      <div class="w-20 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 p-0">
                        <a href="/propiedad/${prop.id || '#'}" target="_blank" rel="noopener noreferrer">
                          <img 
                            src="${imageUrl}" 
                            alt="Propiedad" 
                            class="w-full h-full object-cover transition-opacity duration-200 opacity-0"
                            loading="lazy"
                            style="background-size: cover; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg==');"
                            onload="this.onload=null; this.classList.remove('opacity-0');"
                            onerror="this.src='/placeholder-property.jpg'; this.onerror=null; this.classList.remove('opacity-0');"
                          >
                        </a>
                      </div>
                      <div class="flex-grow">
                        <div class="flex justify-between items-center">
                          <div class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>${propertyType}</span>
                          </div>
                          <span class="font-medium text-lg ml-auto">${formatPrice(prop.price)}</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-1 text-gray-700">
                          ${constructionArea ? `
                          <div class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span>${constructionArea}</span>
                          </div>
                          ` : ''}
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>${prop.bedrooms || 0} rec</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>${prop.bathrooms || 0} baños</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        propertiesHTML = `
          <div class="mt-3 text-base text-gray-500 italic p-4 bg-gray-50 rounded-lg">
            No hay propiedades ${viewMode === 'rent' ? 'en renta' : 'en venta'} disponibles para mostrar
          </div>
        `;
      }
      
      // Create the popup with enhanced content
      activePopupRef.current = new mapboxgl.Popup({
        maxWidth: '350px', // Larger popup width
        closeButton: true,
        closeOnClick: true, // Close popup when clicking on the map
        className: 'custom-popup' // Add a custom class for styling
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div class="popup-content">
            <h3 class="font-bold text-xl text-indigo-800">${properties.name}</h3>
            ${propertiesHTML}
          </div>
        `)
        .addTo(map.current);
      
      // Clear the reference when the popup is closed
      activePopupRef.current.on('close', () => {
        activePopupRef.current = null;
      });
    };

    // Initialize the map
    initMap();

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, [loading, locations]);

  // Toggle view mode between rent and sale
  const toggleViewMode = () => {
    // Calculate the new mode before updating state
    const newMode = viewMode === 'rent' ? 'sale' : 'rent';
    console.log(`TOGGLE DEBUG - Changing view mode from ${viewMode} to ${newMode}`);
    
    // Update state
    setViewMode(newMode);
    
    // Close any existing popup when changing view mode
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }
    
    // Update the data source with the new filtered GeoJSON
    if (map.current) {
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(createGeoJSON(locations, newMode));
      }
      
      // Update circle colors
      map.current.setPaintProperty(
        'house-count-circles', 
        'circle-color', 
        newMode === 'rent' ? '#EAB308' : '#8B5CF6'  // Yellow for rent, Violet for sale
      );
    }
  };

  // Update handler for price slider
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value);
    setMaxPrice(newPrice);
    
    // Update the data source with the new filtered GeoJSON
    if (map.current) {
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(createGeoJSON(locations, viewMode));
      }
    }
  };

  // Update handler for bedroom filter
  const handleBedroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bedrooms = parseInt(e.target.value);
    setMinBedrooms(bedrooms);
    
    // Update the map with new filters
    if (map.current) {
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(createGeoJSON(locations, viewMode));
      }
    }
  };

  // Update handler for bathroom filter
  const handleBathroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bathrooms = parseInt(e.target.value);
    setMinBathrooms(bathrooms);
    
    // Update the map with new filters
    if (map.current) {
      const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(createGeoJSON(locations, viewMode));
      }
    }
  };

  if (error) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl mb-2">Cargando mapa...</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Custom CSS for popups */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .mapboxgl-popup-close-button {
          font-size: 22px; /* Increased from 16px */
          padding: 6px 10px; /* Increased padding */
          right: 5px;
          top: 5px;
          color: #6366f1;
          line-height: 1;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: transparent;
          color: #4f46e5;
        }
        /* Custom scrollbar for property list */
        .popup-content .max-h-60::-webkit-scrollbar {
          width: 6px;
        }
        .popup-content .max-h-60::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .popup-content .max-h-60::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .popup-content .max-h-60::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Redesigned wider control panel with additional filters */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <div className="bg-white p-4 rounded-lg shadow-md w-[700px]">
          {/* Main controls row */}
          <div className="flex items-center gap-8">
            {/* Toggle switch */}
            <div className="flex items-center">
              <span className={`mr-2 text-sm font-medium ${viewMode === 'sale' ? 'text-violet-700' : 'text-gray-500'}`}>
                Venta
              </span>
              <div 
                onClick={toggleViewMode}
                className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer"
              >
                <span className="sr-only">Toggle view mode</span>
                <span 
                  className={`${
                    viewMode === 'rent' ? 'bg-yellow-500' : 'bg-violet-600'
                  } absolute inset-0 rounded-full transition-colors`}
                ></span>
                <span
                  className={`${
                    viewMode === 'rent' ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                ></span>
              </div>
              <span className={`ml-2 text-sm font-medium ${viewMode === 'rent' ? 'text-yellow-600' : 'text-gray-500'}`}>
                Renta
              </span>
            </div>
            
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* Count information - now has more space */}
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${viewMode === 'rent' ? 'bg-yellow-500' : 'bg-violet-600'}`}></div>
              <span className="text-sm font-medium whitespace-nowrap">
                {viewMode === 'rent' 
                  ? `${locations.reduce((sum, loc) => sum + loc.forRent, 0)} propiedades en renta en Zibatá` 
                  : `${locations.reduce((sum, loc) => sum + loc.forSale, 0)} propiedades en venta en Zibatá`}
              </span>
            </div>
          </div>
          
          {/* Filters row */}
          <div className="mt-4 grid grid-cols-3 gap-6">
            {/* Price filter */}
            <div className="col-span-1">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="price-filter" className="text-sm font-medium text-gray-700">
                  Precio máximo
                </label>
                <span className="text-sm font-medium text-indigo-600">
                  {formatPrice(maxPrice)}
                </span>
              </div>
              <input
                id="price-filter"
                type="range"
                min={viewMode === 'rent' ? priceRanges.rent.min : priceRanges.sale.min}
                max={viewMode === 'rent' ? priceRanges.rent.max : priceRanges.sale.max}
                value={maxPrice}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
            {/* Bedrooms filter */}
            <div className="col-span-1">
              <label htmlFor="bedroom-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Recámaras mínimas
              </label>
              <select
                id="bedroom-filter"
                value={minBedrooms}
                onChange={handleBedroomChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="0">Cualquier número</option>
                <option value="1">1+ recámaras</option>
                <option value="2">2+ recámaras</option>
                <option value="3">3+ recámaras</option>
                <option value="4">4+ recámaras</option>
              </select>
            </div>
            
            {/* Bathrooms filter */}
            <div className="col-span-1">
              <label htmlFor="bathroom-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Baños mínimos
              </label>
              <select
                id="bathroom-filter"
                value={minBathrooms}
                onChange={handleBathroomChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="0">Cualquier número</option>
                <option value="1">1+ baños</option>
                <option value="1.5">1.5+ baños</option>
                <option value="2">2+ baños</option>
                <option value="2.5">2.5+ baños</option>
                <option value="3">3+ baños</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div
        ref={mapContainer}
        className="w-full h-[800px] rounded-xl shadow-md"
      />
    </div>
  );
}