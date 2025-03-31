import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';

// Añadir estos estilos globales después de los imports
const styles = `
  .mapboxgl-control-container,
  .mapboxgl-compact,
  .mapboxgl-ctrl-logo,
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-bottom-left {
    display: none !important;
  }
  .mapboxgl-canvas {
    outline: none !important;
    background: transparent !important;
  }

  .mapboxgl-popup {
    z-index: 10;
  }
  
  .mapboxgl-popup-content {
    background: white !important;
    color: #333 !important;
    border-radius: 12px !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  }

  .property-marker {
    z-index: 5;
  }
`;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Verificación del token
if (!MAPBOX_TOKEN) {
  console.error('🚨 MAPBOX_TOKEN no encontrado en variables de entorno');
} else {
  console.log('✅ MAPBOX_TOKEN encontrado');
}

mapboxgl.accessToken = MAPBOX_TOKEN || '';

// Lista de propiedades de ejemplo para mostrar en rotación
const featuredProperties = [
  {
    id: 'prop1',
    title: 'Casa en Residencial del Parque',
    price: '$3,850,000',
    bedrooms: 3,
    bathrooms: 2,
    area: '180m²',
    image: '/assets/propiedades/casa1.jpg' // Asegúrate de tener estas imágenes o usa URL placeholder
  },
  {
    id: 'prop2',
    title: 'Departamento en Centro Sur',
    price: '$2,250,000',
    bedrooms: 2,
    bathrooms: 1,
    area: '95m²',
    image: '/assets/propiedades/depa1.jpg'
  },
  {
    id: 'prop3',
    title: 'Casa en Juriquilla',
    price: '$5,600,000',
    bedrooms: 4,
    bathrooms: 3.5,
    area: '320m²',
    image: '/assets/propiedades/casa2.jpg'
  },
  {
    id: 'prop4',
    title: 'Loft en Milenio III',
    price: '$1,950,000',
    bedrooms: 1,
    bathrooms: 1,
    area: '65m²',
    image: '/assets/propiedades/loft1.jpg'
  }
];

export default function HomeBanner() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string>('');
  const [activePopupIndex, setActivePopupIndex] = useState<number>(-1);
  const popupRefs = useRef<(mapboxgl.Popup | null)[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      setMapError('No se pudo inicializar el mapa: ' + (!MAPBOX_TOKEN ? 'Token no encontrado' : 'Contenedor no disponible'));
      return;
    }

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/reliaplant/cm8rkwpdg00b801qt20d9725u', // Estilo personalizado
        center: [-100.3899, 20.5889], // Iniciar directamente en Querétaro
        zoom: 1.5, // Zoom inicial
        projection: 'globe',
        antialias: true, // Añadido para mejor renderizado
        attributionControl: false, // Deshabilitar atribuciones
        renderWorldCopies: false,
        bearing: 0,
        pitch: 0,
        padding: { top: 50, bottom: 50 } // Añadido padding
      });

      // Inyectar estilos CSS
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);

      // Eventos de depuración
      newMap.on('load', () => {
        console.log('✅ Mapa cargado completamente');
      });

      newMap.on('render', () => {
        console.log('🎨 Mapa renderizando');
      });

      newMap.on('error', (e) => {
        console.error('❌ Error del mapa:', e);
        setMapError(`Error del mapa: ${e.error?.message || 'Error desconocido'}`);
      });

      // Configurar el mapa después de que el estilo se haya cargado
      newMap.once('style.load', () => {
        if (!newMap) return;

        console.log('✅ Estilo cargado');
        
        // Configuración suave del fog
        newMap.setFog({
          'range': [1, 12],
          'color': 'rgba(64, 156, 255, 0.05)',    // Muy sutil
          'high-color': 'rgba(128, 186, 255, 0.05)', // Apenas visible
          'space-color': 'rgba(0, 0, 25, 0.02)',    // Casi transparente
          'horizon-blend': 0.1,                    // Mezcla muy suave
          'star-intensity': 0                      // Sin estrellas
        });

        // Capa de atmósfera muy sutil
        newMap.addLayer({
          'id': 'atmosphere',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0, 0],
            'sky-atmosphere-sun-intensity': 1,    // Intensidad reducida
            'sky-atmosphere-color': 'rgba(64, 156, 255, 0.05)'
          }
        });

        // Crear popup
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25
        }).setHTML(`
          <div class="flex flex-col gap-2">
            <h3 class="font-bold text-lg">Querétaro</h3>
            <p class="text-sm text-gray-300">Ciudad con mayor crecimiento en México</p>
            <div class="flex gap-2 text-sm">
              <span class="px-2 py-1 bg-blue-500/20 rounded">+200% Anual</span>
              <span class="px-2 py-1 bg-green-500/20 rounded">Top 3 México</span>
            </div>
          </div>
        `);

        // Añadir marcador con eventos
        const marker = new mapboxgl.Marker({
          color: "#FF0000",
          scale: 0.8
        })
          .setLngLat([-100.3899, 20.5889])
          .addTo(newMap);

        // Eventos del marcador
        const markerElement = marker.getElement();
        markerElement.addEventListener('mouseenter', () => {
          popup.setLngLat([-100.3899, 20.5889]).addTo(newMap);
        });
        
        markerElement.addEventListener('mouseleave', () => {
          popup.remove();
        });

        let animationTimer: number;
        // Nueva función de animación dramática
        const dramaticMove = () => {
          const time = Date.now();
          const baseSpeed = time / 5000; // Velocidad base más rápida
          
          // Combinar múltiples movimientos sinusoidales
          const pitch = 15 + Math.sin(baseSpeed * 0.5) * 20;        // Oscila entre -5 y 35 grados
          const bearing = Math.sin(baseSpeed * 0.3) * 45;           // Rotación de -45 a 45 grados
          const zoomVariation = 1.5 + Math.sin(baseSpeed * 0.2) * 0.2; // Zoom oscila entre 1.3 y 1.7
          
          // Movimiento orbital compuesto
          const radius = 3 + Math.sin(baseSpeed * 0.4) * 1;
          const centerLng = -100.3899 + Math.sin(baseSpeed) * radius;
          const centerLat = 20.5889 + Math.cos(baseSpeed * 1.3) * (radius * 0.5);
          
          newMap.easeTo({
            center: [centerLng, centerLat],
            pitch: pitch,
            bearing: bearing,
            zoom: zoomVariation,
            duration: 1000,
            essential: true,
            easing: (t) => t * (2 - t) // Easing suave
          });
          
          animationTimer = requestAnimationFrame(dramaticMove);
        };

        // Iniciar animación dramática
        dramaticMove();

        // Cleanup
        return () => {
          cancelAnimationFrame(animationTimer);
        };
      });

      map.current = newMap;

    } catch (error) {
      console.error('❌ Error de inicialización:', error);
      setMapError(`Error de inicialización: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }

    // Crear popups para cada propiedad
    if (map.current) {
      // Limpiar popups anteriores
      popupRefs.current.forEach(popup => popup?.remove());
      popupRefs.current = featuredProperties.map(() => null);

      // Iniciar rotación de popups
      let currentIndex = 0;
      
      const showNextProperty = () => {
        // Remover TODOS los popups anteriores
        popupRefs.current.forEach(popup => {
          if (popup) {
            popup.remove();
            popup = null;
          }
        });
        
        // Crear nuevo popup con estilo del explorador
        const property = featuredProperties[currentIndex];
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [Math.random() * 80 - 40, -15], // Desplazamiento más controlado
          className: 'property-popup'
        });
        
        // Contenido del popup con estilo similar al explorador
        popup.setHTML(`
          <div class="property-card w-64 bg-white">
            <div class="relative aspect-[16/12] overflow-hidden">
              <img 
                src="${property.image}" 
                alt="${property.title}"
                class="object-cover w-full h-full"
              />
              <div class="absolute top-3 left-3">
                <span class="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  Destacado
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <div class="p-2 rounded-full bg-white/90 backdrop-blur-sm">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-medium text-gray-900 mb-1">${property.title}</h3>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>${property.bedrooms} rec</span>
                <span>•</span>
                <span>${property.bathrooms} baños</span>
                <span>•</span>
                <span>${property.area}</span>
              </div>
              <div class="flex items-baseline gap-1 pt-2">
                <span class="font-semibold">${property.price}</span>
              </div>
            </div>
          </div>
        `);
        
        // Añadir al mapa con posición menos extrema
        const lngOffset = Math.sin(currentIndex * 0.5) * 0.8;
        const latOffset = Math.cos(currentIndex * 0.5) * 0.4;
        popup.setLngLat([-100.3899 + lngOffset, 20.5889 + latOffset]).addTo(map.current!);
        
        // Guardar referencia
        popupRefs.current[currentIndex] = popup;
        setActivePopupIndex(currentIndex);
        
        // Programar la eliminación del popup actual antes de mostrar el siguiente
        setTimeout(() => {
          if (popup) {
            popup.remove();
          }
        }, 3500); // Remover después de 3.5 segundos (antes de que aparezca el siguiente)
        
        // Pasar al siguiente
        currentIndex = (currentIndex + 1) % featuredProperties.length;
        
        // Programar el siguiente popup
        setTimeout(showNextProperty, 4000); // Cada 4 segundos
      };
      
      // Iniciar después de 2 segundos
      setTimeout(showNextProperty, 2000);
    }
    
    return () => {
      // Limpiar estilos y popups al desmontar
      styleElement?.remove();
      popupRefs.current.forEach(popup => popup?.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Añadir estilos para la animación
  const popupStyles = `
    .property-popup .mapboxgl-popup-content {
      width: 280px;
      padding: 0 !important;
      overflow: hidden;
      border-radius: 12px !important;
      background: white !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      transform-origin: bottom center;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;

  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Añadir los estilos de popups */}
      <style>{popupStyles}</style>
      
      {/* Contenedor del mapa absolute que cubre toda la pantalla */}
      <div className="absolute inset-0 lg:left-1/2">
        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            {mapError}
          </div>
        ) : (
          <div 
            ref={mapContainer} 
            className="absolute inset-0"
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute'
            }}
          />
        )}
      </div>

      {/* Contenido superpuesto */}
      <div className="relative h-full">
        <div className="w-full lg:w-1/2 h-full flex items-center p-[5vw]">
          {/* Text Content - más compacto */}
          <div className="text-white space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight !text-blue-100 mb-0">
                Encuentra tu piso en Querétaro
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                La ciudad con mayor crecimiento en México
              </p>
              <div className="flex gap-4 pt-2">
                <button className="cursor-pointer bg-amber-200 text-black px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-800 ">
                  Explorar propiedades
                </button>
              </div>
            </div>

            {/* Stats Section - más compacto */}
            <div className="pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                {/* Stat 1 */}
                <div className="text-left">
                  <div className="text-2xl font-bold text-white mb-1">+120</div>
                  <p className="text-xs text-gray-400 mb-2 min-h-[2.5rem]">
                    Nuevos residentes cada día. Más de 8,000 personas eligen Querétaro mensualmente
                  </p>
                  <div className="invert brightness-150">
                    <Image 
                      src="/assets/logos/queretaroUniversal.png" 
                      alt="El Universal Querétaro" 
                      width={120} 
                      height={20} 
                      className="object-contain "
                    />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="text-left">
                  <div className="text-2xl font-bold text-white mb-1">$1,200M</div>
                  <p className="text-xs text-gray-400 mb-2 min-h-[2.5rem]">
                    USD en inversión industrial. Más de 52 nuevos proyectos durante 2023
                  </p>
                  <div className="invert brightness-150">
                    <Image 
                      src="/assets/logos/theLogisticsWorld.png" 
                      alt="The Logistics World" 
                      width={120} 
                      height={20}
                      className="object-contain "
                    />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="text-left">
                  <div className="text-2xl font-bold text-white mb-1">+7.22%</div>
                  <p className="text-xs text-gray-400 mb-2 min-h-[2.5rem]">
                    Plusvalía anual en 2023. La más alta entre las principales ciudades de México
                  </p>
                  <div className="invert brightness-150">
                    <Image 
                      src="/assets/logos/elEconomista.png" 
                      alt="El Economista" 
                      width={120} 
                      height={20}
                      className="object-contain "
                    />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="text-left">
                  <div className="text-2xl font-bold text-white mb-1">#1</div>
                  <p className="text-xs text-gray-400 mb-2 min-h-[2.5rem]">
                    En Estado de Derecho. Segundo año consecutivo liderando el índice nacional
                  </p>
                  <div className="invert brightness-150">
                    <Image 
                      src="/assets/logos/wordJusticeProject.png" 
                      alt="World Justice Project" 
                      width={120} 
                      height={20}
                      className="object-contain "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
