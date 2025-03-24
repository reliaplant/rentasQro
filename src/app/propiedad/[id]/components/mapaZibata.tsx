// "use client";

// import { useEffect, useRef, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

// // Set your Mapbox access token
// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

// const pointsOfInterest = [
//   {
//     name: "Plaza Condesa Zibatá",
//     category: "shopping",
//     coordinates: [-100.3842, 20.6781]
//   },
//   {
//     name: "Universidad Anáhuac",
//     category: "education",
//     coordinates: [-100.3863, 20.6721]
//   },
//   {
//     name: "Campo de Golf Zibatá",
//     category: "recreation",
//     coordinates: [-100.3897, 20.6735]
//   },
//   {
//     name: "Plaza Zielo",
//     category: "shopping",
//     coordinates: [-100.3822, 20.6762]
//   },
//   {
//     name: "Parque Jamadi",
//     category: "park",
//     coordinates: [-100.3879, 20.6799]
//   }
// ];

// interface MapaZibataProps {
//   propertyLocation?: [number, number]; // Optional property coordinates [lng, lat]
//   height?: string;
// }

// export default function MapaZibata({ propertyLocation, height = '500px' }: MapaZibataProps) {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<mapboxgl.Map | null>(null);
//   const [mapLoaded, setMapLoaded] = useState(false);

//   // Default location for Zibata center
//   const zibataCenter: [number, number] = [-100.386, 20.675];

//   useEffect(() => {
//     // Initialize map only once
//     if (map.current) return;
    
//     // Create map instance
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current!,
//       style: 'mapbox://styles/mapbox/streets-v12',
//       center: zibataCenter,
//       zoom: 14
//     });

//     // Add navigation controls
//     map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

//     // Set map load event
//     map.current.on('load', () => {
//       setMapLoaded(true);
      
//       // Add Zibata area polygon
//       map.current!.addSource('zibata-area', {
//         type: 'geojson',
//         data: {
//           type: 'Feature',
//           geometry: {
//             type: 'Polygon',
//             coordinates: [
//               [
//                 [-100.3980, 20.6820],
//                 [-100.3780, 20.6820],
//                 [-100.3780, 20.6680],
//                 [-100.3980, 20.6680],
//                 [-100.3980, 20.6820]
//               ]
//             ]
//           },
//           properties: {}
//         }
//       });

//       map.current!.addLayer({
//         id: 'zibata-fill',
//         type: 'fill',
//         source: 'zibata-area',
//         layout: {},
//         paint: {
//           'fill-color': '#0080ff',
//           'fill-opacity': 0.1
//         }
//       });

//       map.current!.addLayer({
//         id: 'zibata-outline',
//         type: 'line',
//         source: 'zibata-area',
//         layout: {},
//         paint: {
//           'line-color': '#0080ff',
//           'line-width': 2
//         }
//       });
//     });

//     return () => {
//       if (map.current) {
//         map.current.remove();
//         map.current = null;
//       }
//     };
//   }, []);

//   // Add points of interest when map is loaded
//   useEffect(() => {
//     if (!mapLoaded || !map.current) return;

//     // Add markers for points of interest
//     pointsOfInterest.forEach(poi => {
//       // Create a DOM element for the marker
//       const el = document.createElement('div');
//       el.className = 'marker';
//       el.style.width = '24px';
//       el.style.height = '24px';
//       el.style.borderRadius = '50%';
//       el.style.backgroundColor = getCategoryColor(poi.category);
//       el.style.border = '2px solid white';
//       el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
//       // Add popup
//       const popup = new mapboxgl.Popup({ offset: 25 })
//         .setHTML(`<strong>${poi.name}</strong><p>${capitalizeFirstLetter(poi.category)}</p>`);
      
//       // Add marker
//       new mapboxgl.Marker(el)
//         .setLngLat(poi.coordinates)
//         .setPopup(popup)
//         .addTo(map.current!);
//     });
    
//     // Add property marker if provided
//     if (propertyLocation) {
//       const propertyMarker = document.createElement('div');
//       propertyMarker.className = 'property-marker';
//       propertyMarker.style.width = '30px';
//       propertyMarker.style.height = '30px';
//       propertyMarker.style.borderRadius = '50%';
//       propertyMarker.style.backgroundColor = '#ff4d4d';
//       propertyMarker.style.border = '3px solid white';
//       propertyMarker.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
      
//       const popup = new mapboxgl.Popup({ offset: 30 })
//         .setHTML('<strong>Tu propiedad</strong>');
      
//       new mapboxgl.Marker(propertyMarker)
//         .setLngLat(propertyLocation)
//         .setPopup(popup)
//         .addTo(map.current!);
        
//       // Center on property
//       map.current.flyTo({
//         center: propertyLocation,
//         zoom: 15,
//         essential: true
//       });
//     }
//   }, [mapLoaded, propertyLocation]);

//   function getCategoryColor(category: string): string {
//     switch (category) {
//       case 'shopping':
//         return '#ff9933';
//       case 'education':
//         return '#3366ff';
//       case 'recreation':
//         return '#33cc33';
//       case 'park':
//         return '#00cc99';
//       default:
//         return '#808080';
//     }
//   }

//   function capitalizeFirstLetter(string: string): string {
//     return string.charAt(0).toUpperCase() + string.slice(1);
//   }

//   return (
//     <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
//       <div ref={mapContainer} style={{ height, width: '100%' }} />
//       <div className="py-3 px-4 bg-white border-t border-gray-100">
//         <div className="flex flex-wrap gap-3 text-sm">
//           <div className="flex items-center gap-1">
//             <span className="inline-block w-3 h-3 rounded-full bg-[#ff9933]"></span>
//             <span>Comercios</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <span className="inline-block w-3 h-3 rounded-full bg-[#3366ff]"></span>
//             <span>Educación</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <span className="inline-block w-3 h-3 rounded-full bg-[#33cc33]"></span>
//             <span>Recreación</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <span className="inline-block w-3 h-3 rounded-full bg-[#00cc99]"></span>
//             <span>Parques</span>
//           </div>
//           {propertyLocation && (
//             <div className="flex items-center gap-1">
//               <span className="inline-block w-3 h-3 rounded-full bg-[#ff4d4d]"></span>
//               <span>Tu propiedad</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }