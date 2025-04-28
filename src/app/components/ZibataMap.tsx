'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { polygons } from './polygonsZibata';
import Image from 'next/image';

// Modificamos la interfaz para hacer que x,y sean opcionales y agregamos offsetX/offsetY
interface PolygonIcon {
  polygonId: string;     // ID del polígono al que se asocia el icono (para referencia)
  icon: string;          // Ruta de la imagen del icono
  x?: number;            // Coordenada X absoluta (opcional, se calculará automáticamente si no se proporciona)
  y?: number;            // Coordenada Y absoluta (opcional, se calculará automáticamente si no se proporciona)
  offsetX?: number;      // Ajuste horizontal opcional (se aplica incluso con coordenadas automáticas)
  offsetY?: number;      // Ajuste vertical opcional (se aplica incluso con coordenadas automáticas)
  width?: number;        // Ancho opcional del icono
  height?: number;       // Alto opcional del icono
  tooltip?: string;      // Texto descriptivo opcional para mostrar al hacer hover
  isImageIcon?: boolean; // Indica si es una imagen real (no un icono simple)
  backgroundColor?: string; // Color de fondo para imágenes reales
  borderColor?: string;  // Color del borde para imágenes reales
}

interface ZibataMapProps {
  highlightedPolygonId?: string;
  onPolygonClick?: (polygonId: string) => void;
  className?: string;
  height?: string;
  polygonIcons?: PolygonIcon[];
}

const JAMADIMINI = "/assets/icons/jamadi1.png"
const ZAKIIMINI = "/assets/icons/parquesaki.jpg"
const NWL = "/assets/icons/colegionwl.jpg"
const GOLFMINI = "/assets/icons/golfmini.png"
// Agregamos las rutas para los iconos de las plazas
const PLAZA_PASEO_ZIBATA = "/assets/icons/plazapaseo.jpg" 
const PLAZA_XENTRICA = "/assets/icons/plazaxentrica.jpg"
// Agregamos las imágenes para Starbucks y Santander
const STARBUCKS_ICON = "/assets/icons/starbucks.png"
const SANTANDER_ICON = "/assets/icons/santander.png"

// Definimos los iconos con ajustes de posición
const HEB: PolygonIcon = {
  polygonId: "HEB",
  icon: "/assets/icons/HEB_Mexico.png",
  width: 200,
  height: 200,
  offsetX: 0,     // Ajuste horizontal (0 = sin ajuste)
  offsetY: 0,   // Ajuste vertical (-30 = mover 30px hacia arriba)
  tooltip: "HEB Zibata"
}

// Definimos los iconos con ajustes de posición para JAMADI con estilo especial
const JAMADI: PolygonIcon = {
  polygonId: "JAMADI",
  icon: JAMADIMINI,
  width: 80,             // Reducimos el tamaño para mejor integración
  height: 80,
  offsetX: 60,
  offsetY: 30,
  tooltip: "Parque Jamadi",
  isImageIcon: true,     // Marcamos como imagen real
  backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo blanco semi-transparente
  borderColor: "#FFFFFF"  // Borde verde que coincide con el color del parque
}

// Definimos los iconos con ajustes de posición para JAMADI con estilo especial
const PARQUESAKI: PolygonIcon = {
  polygonId: "PARQUESAKI",
  icon: ZAKIIMINI,
  width: 80,             // Reducimos el tamaño para mejor integración
  height: 80,
  offsetX: -20,
  offsetY: 30,
  tooltip: "Parque Jamadi",
  isImageIcon: true,     // Marcamos como imagen real
  backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo blanco semi-transparente
  borderColor: "#FFFFFF"  // Borde verde que coincide con el color del parque
}

// Definimos los iconos con ajustes de posición para JAMADI con estilo especial
const COLEGIONWL: PolygonIcon = {
  polygonId: "UNK49",
  icon: NWL,
  width: 80,             // Reducimos el tamaño para mejor integración
  height: 80,
  offsetX: 0,
  offsetY: 0,
  tooltip: "Parque Jamadi",
  isImageIcon: true,     // Marcamos como imagen real
  backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo blanco semi-transparente
  borderColor: "#FFFFFF"  // Borde verde que coincide con el color del parque
}

const WALMART: PolygonIcon = {
  polygonId: "WALMART",
  icon: "/assets/icons/walmart.svg",
  width: 200,
  height: 200,
  offsetX: 60,    // Ajuste horizontal (20 = mover 20px a la derecha)
  offsetY: -60,    // Ajuste vertical (10 = mover 10px hacia abajo)
  tooltip: "Walmart Zibata"
}

const ANAHUAC: PolygonIcon = {
  polygonId: "WALMART",
  icon: "/assets/icons/anahuac.png",
  width: 300,
  height: 300,
  offsetX: 300,    // Ajuste horizontal (20 = mover 20px a la derecha)
  offsetY: 40,    // Ajuste vertical (10 = mover 10px hacia abajo)
  tooltip: "Anahuac Querétaro"
}

// Actualizamos el ícono del campo de golf para que use el nuevo polígono
const GOLF_COURSE: PolygonIcon = {
  polygonId: "CAMPO_GOLF", // Ahora usamos el ID del nuevo polígono que creamos
  icon: GOLFMINI,
  width: 120,              // Aumentamos un poco el tamaño para mejor visibilidad
  height: 120,
  x: 1550,                // Asignamos coordenadas fijas en lugar de calculadas
  y: 800,                 // Estas coordenadas deben coincidir con el centro del círculo
  offsetX: 60,             // Mantenemos sin offset adicional
  offsetY: -20,
  tooltip: "Campo de Golf Zibata",
  isImageIcon: true,     // Lo marcamos como imagen real para un mejor estilo visual
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderColor: "#ffffff"  // Color verde medio mar para el borde (temática de golf)
}

// Definimos el icono para Plaza Paseo Zibata
const PLAZA_PASEO_ZIBATA_ICON: PolygonIcon = {
  polygonId: "PLAZAPASEOZIBATA",
  icon: PLAZA_PASEO_ZIBATA,
  width: 100,
  height: 100,
  offsetX: -150,
  offsetY: -20,
  tooltip: "Plaza Paseo Zibata",
  isImageIcon: true,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderColor: "#ECE2CA" // Color que coincide con el color de la plaza en el mapa
}

// Definimos el icono para Plaza Xentrica Anahuac
const PLAZA_XENTRICA_ANAHUAC_ICON: PolygonIcon = {
  polygonId: "PLAZAXENTRICANAHUAC",
  icon: PLAZA_XENTRICA,
  width: 100,
  height: 100,
  offsetX:-150,
  offsetY: 40,
  tooltip: "Plaza Xentrica Anahuac",
  isImageIcon: true,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderColor: "#ECE2CA" // Color que coincide con el color de la plaza en el mapa
}

// Definimos el icono para Starbucks en UNK77
const STARBUCKS: PolygonIcon = {
  polygonId: "UNK77",
  icon: STARBUCKS_ICON,
  width: 150,
  height: 150,
  offsetX: -90,  // Colocamos un poco hacia la izquierda dentro de UNK77
  offsetY: 0,   // Ligeramente hacia abajo
  tooltip: "Starbucks Zibata",
  isImageIcon: false,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderColor: "#006241"  // Color verde Starbucks
}

// Definimos el icono para Banco Santander en UNK77
const SANTANDER: PolygonIcon = {
  polygonId: "UNK77",
  icon: SANTANDER_ICON,
  width: 200,
  height: 200,
  offsetX: 0,   // Colocamos un poco hacia la derecha dentro de UNK77
  offsetY: -100,   // Ligeramente hacia abajo
  tooltip: "Banco Santander",
  isImageIcon: false,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderColor: "#EC0000"  // Color rojo Santander
}

// Función utilitaria para calcular el centro de un polígono a partir de su path
const calculatePolygonCenter = (path: string): { x: number, y: number } | null => {
  // Si es un path circular (como el del Campo de Golf), extraemos las coordenadas del centro directamente
  if (path.includes('m-70,0a70,70')) {
    // El formato es "M{x} {y}m-70,0a70,70 0 1,0 140,0a70,70 0 1,0 -140,0"
    const match = path.match(/M(\d+\.?\d*)\s+(\d+\.?\d*)/);
    if (match && match.length >= 3) {
      return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      };
    }
  }
  
  // Extraemos los puntos del path SVG
  const coords = path.match(/[ML]?\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g);
  if (!coords) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  coords.forEach(coord => {
    const [_, x, y] = coord.match(/[ML]?\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/) || [];
    if (x && y) {
      const numX = parseFloat(x);
      const numY = parseFloat(y);
      minX = Math.min(minX, numX);
      minY = Math.min(minY, numY);
      maxX = Math.max(maxX, numX);
      maxY = Math.max(maxY, numY);
    }
  });

  // Calculamos el centro
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };
}

export default function ZibataMap({
  highlightedPolygonId,
  onPolygonClick,
  className = "w-full h-full",
  height = "100%",
  polygonIcons = [
    HEB, 
    WALMART, 
    ANAHUAC, 
    JAMADI, 
    PARQUESAKI, 
    COLEGIONWL, 
    GOLF_COURSE,
    PLAZA_PASEO_ZIBATA_ICON,
    PLAZA_XENTRICA_ANAHUAC_ICON,
    STARBUCKS,        // Agregamos Starbucks
    SANTANDER         // Agregamos Santander
  ] 
}: ZibataMapProps) {
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [isInfoPanelHovered, setIsInfoPanelHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const infoRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Use passed highlightedPolygonId instead of hardcoded value
  const DESTACADO = highlightedPolygonId || null;

  // Detect if user is on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mobileQuery.matches);
    };
    
    // Check immediately
    checkIfMobile();
    
    // Set up listener for screen size changes
    const mediaQueryList = window.matchMedia('(max-width: 768px)');
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    // Add the listener (with compatibility handling)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // For older browsers
      mediaQueryList.addListener(listener);
    }
    
    // Clean up
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        // For older browsers
        mediaQueryList.removeListener(listener);
      }
    };
  }, []);

  // This effect adds a small delay before hiding the info panel
  // to prevent flickering and improve user experience
  useEffect(() => {
    // Skip on mobile devices
    if (isMobile) return;

    function handleMouseMove(e: MouseEvent) {
      // If we're hovering over a polygon and the info panel exists
      if (hoveredPolygonId && infoRef.current) {
        // Check if the mouse is over the info panel
        const rect = infoRef.current.getBoundingClientRect();
        const isOverInfoPanel =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        setIsInfoPanelHovered(isOverInfoPanel);
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredPolygonId, isMobile]);

  const handlePolygonHover = (polygonId: string | null) => {
    // Do nothing on mobile
    if (isMobile) return;

    // Only update state if we're not hovering the info panel
    if (!isInfoPanelHovered) {
      setHoveredPolygonId(polygonId);
    }
  };

  const handlePolygonClick = (polygonId: string) => {
    // Do nothing on mobile
    if (isMobile) return;

    // Call the callback if provided (for any custom handling)
    if (onPolygonClick) {
      onPolygonClick(polygonId);
    } else {
      // Default behavior - navigate to the condo page
      const polygon = polygons.find(p => p.id === polygonId);
      if (polygon && polygon.slug) {
        router.push(`/qro/zibata/${polygon.slug}`);
      }
    }
  };

  // First, sort polygons so the highlighted one comes last (will be rendered on top)
  const sortedPolygons = [...polygons].sort((a, b) => {
    if (a.id === DESTACADO) return 1; // Highlighted polygon goes to end of array
    if (b.id === DESTACADO) return -1; // Highlighted polygon goes to end of array
    return 0;
  });

  // Determine which polygon info to show - either the hovered one or the highlighted one if hovered
  const displayPolygonId = hoveredPolygonId || null;

  // Preparamos los iconos, calculando las coordenadas si no están definidas
  const preparedIcons = polygonIcons.map(icon => {
    // Si ya tiene coordenadas x,y, las usamos pero aún aplicamos los offsets
    if (icon.x !== undefined && icon.y !== undefined) {
      return {
        ...icon,
        x: icon.x + (icon.offsetX || 0),
        y: icon.y + (icon.offsetY || 0)
      };
    }
    
    // Buscamos el polígono correspondiente
    const polygon = polygons.find(p => p.id === icon.polygonId);
    if (!polygon) {
      console.warn(`Polígono con ID ${icon.polygonId} no encontrado`);
      return null; // Devolvemos null si no encontramos el polígono
    }
    
    // Calculamos el centro
    const center = calculatePolygonCenter(polygon.path);
    if (!center) {
      console.warn(`No se pudieron calcular las coordenadas del centro para el polígono ${icon.polygonId}`);
      return null;
    }
    
    // Devolvemos el icono con las coordenadas calculadas y aplicamos los offsets
    return {
      ...icon,
      x: center.x + (icon.offsetX || 0),
      y: center.y + (icon.offsetY || 0)
    };
  }).filter(Boolean) as PolygonIcon[]; // Eliminamos los valores null

  return (
    <div className={`${className} relative`} style={{ height }}>
      <img
        src="/assets/zibata/mapaZibataFondo.svg"
        alt="Mapa base de Zibata"
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 3307 2108"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
          @keyframes highlightPulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
          .destacado {
            fill: #BD72F0 !important;
            stroke: #FF1493;
            animation: highlightPulse 1.5s infinite ease-in-out;
            filter: drop-shadow(0 0 15px rgba(255, 105, 180, 0.8));
            z-index: 50 !important;
            transform: scale(1);
            transform-origin: center;
            transform-box: fill-box;
          }
        `}
          </style>
        </defs>

        {/* Render regular polygons (not highlighted and not hovered) */}
        {sortedPolygons
          .filter(poly => poly.id !== hoveredPolygonId && poly.id !== DESTACADO)
          .map(polygon => (
            <path
              key={polygon.id}
              d={polygon.path}
              fill="#D3D3D3"  // Light gray
              stroke="#ffffff" // White
              strokeWidth={4}
              style={{
                transition: "all 0.3s ease",
                cursor: isMobile ? "default" : "pointer",
                opacity: 0.85,
                zIndex: 10
              }}
              onMouseEnter={isMobile ? undefined : () => handlePolygonHover(polygon.id)}
              onMouseLeave={isMobile ? undefined : () => handlePolygonHover(null)}
              onClick={isMobile ? undefined : () => handlePolygonClick(polygon.id)}
            />
          ))
        }

        {/* Render the hovered polygon (if it's not the highlighted one) - Only on desktop */}
        {!isMobile && hoveredPolygonId && hoveredPolygonId !== DESTACADO && (
          <path
            d={polygons.find(p => p.id === hoveredPolygonId)?.path}
            fill="#8A2BE2" // Purple when hovered
            stroke="#4B0082" // Darker purple
            strokeWidth={6}
            style={{
              cursor: "pointer",
              opacity: 1,
              filter: "drop-shadow(0 0 5px rgba(138, 43, 226, 1))",
              zIndex: 20 // Higher than normal polygons
            }}
            onMouseEnter={() => handlePolygonHover(hoveredPolygonId)}
            onMouseLeave={() => handlePolygonHover(null)}
            onClick={() => handlePolygonClick(hoveredPolygonId)}
          />
        )}

        {/* Always render the highlighted polygon last (on top) with the highest z-index */}
        {DESTACADO && (
          <path
            d={polygons.find(p => p.id === DESTACADO)?.path}
            fill="#FF69B4" // Pink for highlighted
            stroke="#FF1493" // Hot pink
            strokeWidth={5}
            className="destacado"
            style={{
              transition: "all 0.3s ease",
              cursor: isMobile ? "default" : "pointer",
              opacity: 1,
              zIndex: 30, // Highest z-index
              position: "relative" // Needed for z-index to work properly in SVG
            }}
            onMouseEnter={isMobile ? undefined : () => handlePolygonHover(DESTACADO)}
            onMouseLeave={isMobile ? undefined : () => handlePolygonHover(null)}
            onClick={isMobile ? undefined : () => handlePolygonClick(DESTACADO)}
          />
        )}

        {/* If the highlighted polygon is also hovered, show it with enhanced styles - Only on desktop */}
        {!isMobile && hoveredPolygonId && hoveredPolygonId === DESTACADO && (
          <path
            d={polygons.find(p => p.id === hoveredPolygonId)?.path}
            fill="#BD72F0" // Brighter color when highlighted and hovered
            stroke="#FF1493" // Hot pink
            strokeWidth={6}
            className="destacado"
            style={{
              cursor: "pointer",
              opacity: 1,
              filter: "drop-shadow(0 0 15px rgba(255, 105, 180, 0.8))",
              zIndex: 40, // Even higher z-index when highlighted and hovered
              position: "relative"
            }}
            onMouseEnter={() => handlePolygonHover(hoveredPolygonId)}
            onMouseLeave={() => handlePolygonHover(null)}
            onClick={() => handlePolygonClick(hoveredPolygonId)}
          />
        )}
        
        {/* Colocamos los iconos normales (no isImageIcon) directamente dentro del SVG */}
        {preparedIcons.filter(icon => !icon.isImageIcon).map((icon, index) => (
          <g
            key={`icon-${index}-${icon.polygonId}`}
            transform={`translate(${icon.x}, ${icon.y})`}
            style={{ 
              cursor: 'pointer',
              pointerEvents: 'none'
            }}
          >
            <image
              href={icon.icon}
              x={-(icon.width || 30) / 2}
              y={-(icon.height || 30) / 2}
              width={icon.width || 30}
              height={icon.height || 30}
              style={{
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                transition: "transform 0.2s ease",
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.5)";
                
                if (icon.tooltip) {
                  e.currentTarget.setAttribute("title", icon.tooltip);
                }
                
                if (!isMobile) {
                  handlePolygonHover(icon.polygonId);
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePolygonClick(icon.polygonId);
              }}
            />
          </g>
        ))}
      </svg>

      {/* Renderizamos solo los iconos especiales (isImageIcon) en un div separado */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {preparedIcons.filter(icon => icon.isImageIcon).map((icon, index) => {
          if (icon.x === undefined || icon.y === undefined) return null;
          
          return (
            <div
              key={`special-icon-${index}-${icon.polygonId}`}
              className="absolute rounded overflow-hidden"
              style={{ 
                left: `${(icon.x / 3307) * 100}%`, 
                top: `${(icon.y / 2108) * 100}%`,
                width: `${icon.width || 80}px`,
                // height: `${icon.height || 60}px`,
                background: icon.backgroundColor || "white",
                border: `3px solid ${icon.borderColor || "#4B5563"}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                pointerEvents: 'auto',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                transformOrigin: 'center center'
              }}
              title={icon.tooltip || ''}
              onMouseEnter={(e) => {
                // Importante: solo cambiamos la escala manteniendo la misma traducción
                e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.5)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
                
                if (!isMobile) {
                  handlePolygonHover(icon.polygonId);
                }
              }}
              onMouseLeave={(e) => {
                // Restauramos al estado original
                e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
              }}
              onClick={() => handlePolygonClick(icon.polygonId)}
            >
              <img
                src={icon.icon}
                alt={`Imagen para ${icon.polygonId}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* Panel de información - Only shown on desktop */}
      {!isMobile && (displayPolygonId || isInfoPanelHovered) && (
        <div
          ref={infoRef}
          className={`absolute top-4 right-4 p-4 rounded-lg shadow-lg ${
            displayPolygonId === DESTACADO ? 'bg-pink-100 border-2 border-pink-500' : 'bg-white'
          }`}
          style={{ zIndex: 100 }}
          onMouseEnter={() => setIsInfoPanelHovered(true)}
          onMouseLeave={() => setIsInfoPanelHovered(false)}
        >
          <h2 className={`text-xl font-bold ${displayPolygonId === DESTACADO ? 'text-pink-600' : ''}`}>
            {polygons.find(p => p.id === displayPolygonId)?.name || ''}
          </h2>
          <img
            src={polygons.find(p => p.id === displayPolygonId)?.photo || ''}
            alt={`Foto de ${polygons.find(p => p.id === displayPolygonId)?.name || ''}`}
            className="mt-2 w-48 h-32 object-cover rounded-md"
          />
          {displayPolygonId === DESTACADO && (
            <div className="mt-2 text-sm text-pink-700">
              ¡Polígono destacado!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
