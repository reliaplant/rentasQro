'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { polygons } from './polygonsZibata';

interface ZibataMapProps {
  highlightedPolygonId?: string;
  onPolygonClick?: (polygonId: string) => void;
  className?: string;
  height?: string;
}

export default function ZibataMap({ 
  highlightedPolygonId,
  onPolygonClick,
  className = "w-full h-full", 
  height = "100%"
}: ZibataMapProps) {
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);
  const [isInfoPanelHovered, setIsInfoPanelHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const infoRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={`${className} relative`} style={{ height }}>
      <img 
        src="/assets/zibata/mapaZibataFondo.svg"
        alt="Mapa base de Zibata"
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      <svg 
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
      </svg>

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
