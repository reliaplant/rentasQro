'use client';
import { useState } from 'react';

export default function ZibataPage() {
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null);

  // Simulación de dato que vendría de Firebase
  const DESTACADO = "AZHALA";

  // Datos de los polígonos con sus propiedades
  const polygons = [
    {
      id: "poly100",
      path: "M1740.5 1265.5L1688 1272L1644.5 1289L1641.5 1295.5L1650.5 1304L1732 1344.5L1799.5 1368L1902.5 1388.5L1910 1373L1902.5 1341.5L1884.5 1307L1815.5 1283L1779 1274.5L1740.5 1265.5Z",
      fill: "#62BD4F",
      name: "Zona 10000"
    },
    {
      id: "poly2",
      path: "M2500 1282.5L2504 1319.5L2520 1331.5L2547.5 1319.5L2600.5 1290L2656 1282.5L2670.5 1276.5L2704.5 1265L2685.5 1246L2670.5 1241.5L2645.5 1246L2606.5 1255.5H2578.5L2541.5 1246L2509.5 1260.5L2500 1282.5Z",
      fill: "#E7E7E7",
      name: "Zona 2"
    },
    {
      id: "poly3",
      path: "M2895.5 1080L2961.5 1127L2979 1096L2966 1082V1061.5L2926.5 1034L2895.5 1080Z",
      fill: "#E7E7E7",
      name: "Zona 3"
    },
    {
      id: "Vector_381",
      path: "M428.5 299L406.5 423.5L586 387.5V375.5L609.5 352L644.5 249.5L609.5 256L548 266L428.5 299Z",
      fill: "#E7E7E7",
      name: "Vector 381"
    },
    {
      id: "Vector_125",
      path: "M1018 607L822 790L854.5 816L900 838L942 849L949 842.5L959.5 840L971.5 842.5L1018 808.5L1035.5 794L1054 787.5L1185 634.5L1146.5 555L1100 585L1054 602L1018 607Z",
      fill: "#E7E7E7",
      name: "Vector 125"
    },
    {
      id: "Vector_130",
      path: "M824 1236L789 1247.5L776.5 1169L753.5 1179L710.5 1169L653 1173.5L641 1164H626.5L561.5 1196.5L475 1104L641 1008.5L667 979.5L704 1005L761.5 1041.5L781 1051L799.5 1054.5L824 1236Z",
      fill: "#E7E7E7",
      name: "Vector 130"
    },
    {
      id: "AUREAIIOLITA",
      path: "M588 1038L474 1103L428.5 1052L418.5 773L445.5 766.5L468 762L512 744.5L588 1038Z",
      fill: "#E7E7E7",
      name: "AUREAIIOLITA"
    },
    {
      id: "AZHALA2",
      path: "M251.5 1025.5L291.5 774L309 777V779.5L328 793.5H341.5L355.5 779.5H386L416.5 774L426 1051L355.5 1047.5L309 1043L251.5 1025.5Z",
      fill: "#E7E7E7",
      name: "AZHALA2"
    }
  ];

  return (
    <div className="w-screen h-screen bg-gray-200 p-8">
      <div className="relative w-full h-full">
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
                  fill: #FF69B4 !important;
                  stroke: #FF1493;
                  animation: highlightPulse 1.5s infinite ease-in-out;
                  filter: drop-shadow(0 0 10px rgba(255, 105, 180, 0.6));
                }
              `}
            </style>
          </defs>
          
          {/* Renderiza los polígonos no seleccionados */}
          {polygons
            .filter(poly => poly.id !== hoveredPolygonId)
            .map(polygon => (
              <path
                key={polygon.id}
                d={polygon.path}
                fill={polygon.id === DESTACADO ? "#FF69B4" : polygon.fill}
                stroke={polygon.id === DESTACADO ? "#FF1493" : "black"}
                strokeWidth={polygon.id === DESTACADO ? 5 : 4}
                className={polygon.id === DESTACADO ? "destacado" : ""}
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  opacity: polygon.id === DESTACADO ? 1 : 0.85
                }}
                onMouseEnter={() => setHoveredPolygonId(polygon.id)}
              />
            ))
          }

          {/* Renderiza el polígono seleccionado */}
          {hoveredPolygonId && (
            <path
              d={polygons.find(p => p.id === hoveredPolygonId)?.path}
              fill={hoveredPolygonId === DESTACADO ? "#FF69B4" : polygons.find(p => p.id === hoveredPolygonId)?.fill}
              stroke={hoveredPolygonId === DESTACADO ? "#FF1493" : "black"}
              strokeWidth={6}
              className={hoveredPolygonId === DESTACADO ? "destacado" : ""}
              style={{
                transition: "all 0.3s ease",
                cursor: "pointer",
                opacity: 1,
                transform: "scale(1.03)",
                transformOrigin: "center",
                transformBox: "fill-box",
                filter: hoveredPolygonId === DESTACADO 
                  ? "drop-shadow(0 0 10px rgba(255, 105, 180, 0.6))" 
                  : "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))"
              }}
              onMouseLeave={() => setHoveredPolygonId(null)}
            />
          )}
        </svg>

        {/* Panel de información */}
        {hoveredPolygonId && (
          <div className={`absolute top-4 right-4 p-4 rounded-lg shadow-lg ${
            hoveredPolygonId === DESTACADO ? 'bg-pink-100 border-2 border-pink-500' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold ${hoveredPolygonId === DESTACADO ? 'text-pink-600' : ''}`}>
              {polygons.find(p => p.id === hoveredPolygonId)?.name}
            </h2>
            {hoveredPolygonId === DESTACADO && (
              <div className="mt-2 text-sm text-pink-700">
                ¡Polígono destacado!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
