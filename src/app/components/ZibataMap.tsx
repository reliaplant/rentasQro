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
  offsetX: 0,
  offsetY: 0,
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
  offsetX: -60,
  offsetY: -60,
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
  offsetX: 80,
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
  offsetX: 0,    // Ajuste horizontal (20 = mover 20px a la derecha)
  offsetY: 0,    // Ajuste vertical (10 = mover 10px hacia abajo)
  tooltip: "Walmart Zibata"
}

// const ANAHUAC: PolygonIcon = {
//   polygonId: "WALMART",
//   icon: "/assets/icons/anahuac.png",
//   width: 300,
//   height: 300,
//   offsetX: 0,    // Ajuste horizontal (20 = mover 20px a la derecha)
//   offsetY: 0,    // Ajuste vertical (10 = mover 10px hacia abajo)
//   tooltip: "Anahuac Querétaro"
// }

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
  offsetX: 0,
  offsetY: 0,
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
  offsetX:0,
  offsetY: 0,
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
  offsetX: 0,  // Colocamos un poco hacia la izquierda dentro de UNK77
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
  offsetX: 80,   // Colocamos un poco hacia la derecha dentro de UNK77
  offsetY: -40,   // Ligeramente hacia abajo
  tooltip: "Banco Santander",
  isImageIcon: false,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderColor: "#EC0000"  // Color rojo Santander
}

// Función utilitaria mejorada para calcular el centro de un polígono a partir de su path
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
  
  // Expresión regular mejorada para capturar todos los tipos de comandos en SVG path
  const coordsRegex = /([MLHVCSQTA])\s*([^MLHVCSQTA]+)/gi;
  let points: {x: number, y: number}[] = [];
  let match;
  
  // Estado actual (para comandos relativos)
  let currentX = 0, currentY = 0;
  
  // Extraemos todos los comandos y coordenadas
  while ((match = coordsRegex.exec(path)) !== null) {
    const command = match[1].toUpperCase();
    const params = match[2].trim().split(/[\s,]+/).map(parseFloat);
    
    // Procesamos según el tipo de comando SVG
    switch (command) {
      case 'M': // Moveto absoluto
      case 'L': // Lineto absoluto
        for (let i = 0; i < params.length; i += 2) {
          if (i + 1 < params.length) {
            points.push({x: params[i], y: params[i+1]});
            currentX = params[i];
            currentY = params[i+1];
          }
        }
        break;
      // Se pueden agregar más casos para otros comandos SVG si es necesario
    }
  }
  
  // Si no pudimos extraer puntos, usamos el método anterior como fallback
  if (points.length === 0) {
    const simpleCoords = path.match(/[ML]?\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/g);
    if (!simpleCoords) return null;

    simpleCoords.forEach(coord => {
      const [_, x, y] = coord.match(/[ML]?\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/) || [];
      if (x && y) {
        points.push({x: parseFloat(x), y: parseFloat(y)});
      }
    });
  }
  
  // Si aún no tenemos puntos, no podemos calcular el centro
  if (points.length === 0) return null;
  
  // Calculamos el centroide (promedio de todos los puntos)
  const totalPoints = points.length;
  const sum = points.reduce((acc, point) => ({x: acc.x + point.x, y: acc.y + point.y}), {x: 0, y: 0});
  
  return {
    x: sum.x / totalPoints,
    y: sum.y / totalPoints
  };
}

// Función mejorada para aplicar correcciones manuales a la posición de los iconos
const applyManualCorrections = (icon: PolygonIcon, x: number, y: number): {x: number, y: number} => {
  // Correcciones específicas para ciertos polígonos - ajustadas con valores más precisos
  const corrections: Record<string, {xOffset: number, yOffset: number}> = {
    "HEB": { xOffset: -40, yOffset: 0 }, // Ajuste significativo para HEB (moverlo a la izquierda)
    "WALMART": { xOffset: -200, yOffset: -20 },
    "JAMADI": { xOffset: 0, yOffset: -10 }, // Parque Jamadi está bien centrado
    "PARQUESAKI": { xOffset: 0, yOffset: -15 },
    "PLAZAPASEOZIBATA": { xOffset: -200, yOffset: -5 },
    "PLAZAXENTRICANAHUAC": { xOffset: -240, yOffset: 10 },
    "UNK77": { xOffset: 0, yOffset: 0 },
    "CAMPO_GOLF": { xOffset: -40, yOffset: 20 }, // Campo de golf tiene coordenadas fijas
    "ARIETTA": { xOffset: -40, yOffset: 0 },
    "CARDON": { xOffset: -20, yOffset: 0 },
    "YAVIA": { xOffset: -25, yOffset: 0 },
    "BELVERDE": { xOffset: -30, yOffset: 0 },
    "PARQUEZIELO": { xOffset: -20, yOffset: 0 },
    "CONDESA": { xOffset: -30, yOffset: -10 }
  };
  
  const correction = corrections[icon.polygonId] || { xOffset: 0, yOffset: 0 };
  
  return {
    x: x + (correction.xOffset || 0) + (icon.offsetX || 0),
    y: y + (correction.yOffset || 0) + (icon.offsetY || 0)
  };
}

export default function ZibataMap({
  highlightedPolygonId,
  onPolygonClick,
  className = "w-full h-full",
  height = "100%",
  polygonIcons = [
    {
      ...HEB,
      offsetX: -80, // Ajuste específico para HEB
    }, 
    WALMART, 
    JAMADI, 
    PARQUESAKI, 
    COLEGIONWL, 
    GOLF_COURSE,
    PLAZA_PASEO_ZIBATA_ICON,
    PLAZA_XENTRICA_ANAHUAC_ICON,
    STARBUCKS,
    SANTANDER         
  ] 
}: ZibataMapProps) {
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [hoveredPolygonCenter, setHoveredPolygonCenter] = useState<{x: number, y: number} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);

  // Use passed highlightedPolygonId instead of hardcoded value
  const DESTACADO = highlightedPolygonId || null;

  // Agregar console.log para debug
  useEffect(() => {
    if (highlightedPolygonId) {
      console.log("Polígono a destacar:", highlightedPolygonId);
      console.log("¿Existe este polígono?", polygons.some(p => p.id === highlightedPolygonId));
    }
  }, [highlightedPolygonId]);

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

  const handlePolygonHover = (polygonId: string | null, event?: React.MouseEvent) => {
    // Do nothing on mobile
    if (isMobile) return;

    // Update hovered polygon ID
    setHoveredPolygonId(polygonId);
    
    // Si tenemos un polygonId, calculamos su centro para posicionar el tooltip
    if (polygonId) {
      const polygon = polygons.find(p => p.id === polygonId);
      if (polygon) {
        const center = calculatePolygonCenter(polygon.path);
        if (center) {
          setHoveredPolygonCenter(center);
        } else {
          setHoveredPolygonCenter(null);
        }
      }
    } else {
      setHoveredPolygonCenter(null);
    }
  };

  const handlePolygonClick = (polygonId: string) => {
    // Do nothing on mobile
    if (isMobile) return;

    // Find the polygon
    const polygon = polygons.find(p => p.id === polygonId);
    
    // Don't process if non-interactive
    if (polygon?.interactive === false) return;

    // Call the callback if provided (for any custom handling)
    if (onPolygonClick) {
      onPolygonClick(polygonId);
    } else {
      // Default behavior - navigate to the condo page
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

  // Determine which polygon info to show
  const displayPolygonId = hoveredPolygonId || DESTACADO; // También mostrar info del destacado si no hay hover
  const displayPolygon = displayPolygonId ? polygons.find(p => p.id === displayPolygonId) : null;

  // Preparamos los iconos, calculando las coordenadas si no están definidas
  const preparedIcons = polygonIcons.map(icon => {
    // Si ya tiene coordenadas x,y definidas explícitamente, las usamos directamente
    if (icon.x !== undefined && icon.y !== undefined) {
      // Incluso para coordenadas definidas, aplicamos las correcciones manuales
      const { x, y } = applyManualCorrections(icon, icon.x, icon.y);
      return {
        ...icon,
        x,
        y
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
    
    // Aplicamos correcciones manuales específicas para cada polígono
    const { x, y } = applyManualCorrections(icon, center.x, center.y);
    
    // Devolvemos el icono con las coordenadas calculadas y corregidas
    return {
      ...icon,
      x,
      y
    };
  }).filter(Boolean) as PolygonIcon[]; // Eliminamos los valores null

  return (
    <div className={`${className} relative`} style={{ height }}>
      {/* Reemplazar imagen de fondo con componente Image de Next.js */}
      <div className="absolute top-0 left-0 w-full h-full">
        <Image
          src="/assets/zibata/mapaZibataFondo.svg"
          alt="Mapa base de Zibata"
          layout="fill"
          objectFit="contain"
          priority={true}
          quality={90}
        />
      </div>
      
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
          .filter(poly => poly.id !== hoveredPolygonId && poly.id !== DESTACADO && poly.id !== "CAMPO_GOLF") // Excluimos el Campo de Golf
          .map(polygon => (
            <path
              key={polygon.id}
              d={polygon.path}
              fill={polygon.fill || "#D3D3D3"}
              stroke="#ffffff"
              strokeWidth={4}
              style={{
                transition: "all 0.3s ease",
                cursor: polygon.interactive !== false ? (isMobile ? "default" : "pointer") : "default",
                opacity: polygon.interactive !== false ? 0.85 : 0.6,
                zIndex: 10,
                pointerEvents: polygon.interactive !== false ? "auto" : "none"
              }}
              onMouseEnter={(e) => polygon.interactive !== false && !isMobile ? handlePolygonHover(polygon.id, e) : undefined}
              onMouseLeave={polygon.interactive !== false && !isMobile ? () => handlePolygonHover(null) : undefined}
              onClick={polygon.interactive !== false && !isMobile ? () => handlePolygonClick(polygon.id) : undefined}
            />
          ))
        }

        {/* Renderizamos el Campo de Golf con opacidad 0 pero manteniendo su definición para que el icono funcione */}
        {sortedPolygons
          .filter(poly => poly.id === "CAMPO_GOLF")
          .map(polygon => (
            <path
              key={polygon.id}
              d={polygon.path}
              fill="transparent"
              stroke="transparent"
              strokeWidth={0}
              style={{
                opacity: 0,
                pointerEvents: "none" // Completamente no interactivo
              }}
            />
          ))
        }

        {/* Render the hovered polygon (if it's not the highlighted one) - Only on desktop */}
        {!isMobile && hoveredPolygonId && hoveredPolygonId !== DESTACADO && (
          <path
            d={polygons.find(p => p.id === hoveredPolygonId)?.path}
            fill="#8A2BE2" // Purple when hovered
            stroke="transparent" // Eliminar el borde morado
            strokeWidth={0} // Sin grosor de borde
            style={{
              cursor: "pointer",
              opacity: 1,
              filter: "drop-shadow(0 0 8px rgba(138, 43, 226, 0.8))", // Agregar sombra más pronunciada
              zIndex: 20 // Higher than normal polygons
            }}
            onMouseEnter={(e) => handlePolygonHover(hoveredPolygonId, e)}
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
            onMouseEnter={(e) => isMobile ? undefined : handlePolygonHover(DESTACADO, e)}
            onMouseLeave={() => isMobile ? undefined : handlePolygonHover(null)}
            onClick={() => isMobile ? undefined : handlePolygonClick(DESTACADO)}
          />
        )}

        {/* If the highlighted polygon is also hovered, show it with enhanced styles - Only on desktop */}
        {!isMobile && hoveredPolygonId && hoveredPolygonId === DESTACADO && (
          <path
            d={polygons.find(p => p.id === hoveredPolygonId)?.path}
            fill="#BD72F0" // Brighter color when highlighted and hovered
            stroke="transparent" // Mantener el borde rosa para el polígono destacado
            strokeWidth={5}
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
      </svg>

      {/* Ahora colocamos los tooltips fuera del SVG, como elementos DOM independientes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {preparedIcons.map((icon, index) => {
          if (icon.x === undefined || icon.y === undefined) return null;
          
          // Determinar si el icono es uno de los que necesita fondo blanco y ajuste de contener
          const needsWhiteBackground = ["HEB", "WALMART", "UNK77"].includes(icon.polygonId);
          
          return (
            <div
              key={`tooltip-icon-${index}-${icon.polygonId}`}
              className="absolute rounded-full overflow-visible tooltip-container"
              style={{ 
                left: `${(icon.x / 3307) * 100}%`, 
                top: `${(icon.y / 2108) * 100}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: 50
              }}
            >
              {/* Mostramos directamente el icono sin el borde blanco interior */}
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center shadow-md cursor-pointer overflow-hidden"
                style={{ 
                  backgroundColor: icon.borderColor || "#3B82F6",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => {
                  // Solo aplicamos el efecto visual de escalado
                  e.currentTarget.style.transform = "scale(1.2)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
                  
                  // Pasamos el hover al polígono para mostrar su tooltip
                  if (!isMobile) {
                    handlePolygonHover(icon.polygonId);
                  }
                }}
                onMouseLeave={(e) => {
                  // Restaurar tamaño normal
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                  
                  if (!isMobile) {
                    handlePolygonHover(null);
                  }
                }}
                onClick={() => handlePolygonClick(icon.polygonId)}
              >
                {/* Para los iconos específicos, usamos fondo blanco y contain */}
                {needsWhiteBackground ? (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <Image 
                      src={icon.icon} 
                      alt={icon.tooltip || ""} 
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  // Para los demás iconos, mantenemos el comportamiento de cover
                  <Image 
                    src={icon.icon} 
                    alt={icon.tooltip || ""} 
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            </div>
          );
        })}
        
        {/* Tooltip para polígonos: posicionado sobre el centro del polígono, pero no tan arriba */}
        {!isMobile && displayPolygon && hoveredPolygonCenter && (
          <div 
            className="absolute bg-white rounded-lg p-3 shadow-lg flex flex-col items-center z-[100] pointer-events-none"
            style={{
              left: `${(hoveredPolygonCenter.x / 3307) * 100}%`, 
              top: `${(hoveredPolygonCenter.y / 2108) * 100}%`,
              maxWidth: "220px",
              border: displayPolygonId === DESTACADO 
                ? "2px solid #FF1493" 
                : "2px solid #8A2BE2",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
              transform: "translate(-50%, -120%)" // Mantiene la posición ajustada anteriormente
            }}
          >
            <span className={`text-base font-bold mb-1 ${
              displayPolygonId === DESTACADO ? "text-pink-600" : "text-purple-600"
            }`}>
              {displayPolygon.name}
            </span>
            {displayPolygon.photo && (
              <div className="relative w-40 h-28 rounded-md overflow-hidden">
                <Image
                  src={displayPolygon.photo}
                  alt={`Foto de ${displayPolygon.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  loading="eager"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
