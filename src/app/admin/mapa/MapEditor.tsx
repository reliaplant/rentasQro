'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { polygons as initialPolygons } from '@/app/components/polygonsZibata';

// Importamos dinámicamente el mapa para evitar problemas de SSR
const ZibataMap = dynamic(() => import('@/app/components/ZibataMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">Cargando mapa...</div>
});

// Tipos para nuestro editor
interface PolygonIcon {
  polygonId: string;
  icon: string;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
  tooltip?: string;
  isImageIcon?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

interface Polygon {
  id: string;
  path: string;
  fill?: string;
  name: string;
  photo?: string;
  slug?: string;
}

export function MapEditor() {
  // Estados para el editor
  const [polygons, setPolygons] = useState<Polygon[]>(initialPolygons);
  const [icons, setIcons] = useState<PolygonIcon[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);
  const [selectedIconIndex, setSelectedIconIndex] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState<'polygons' | 'icons'>('polygons');
  
  // Al iniciar, podemos cargar iconos de alguna API o usar unos predeterminados
  useEffect(() => {
    // Aquí cargaríamos los iconos desde una API
    // Por ahora, usaremos algunos iconos de muestra
    setIcons([
      {
        polygonId: "HEB",
        icon: "/assets/icons/HEB_Mexico.png",
        width: 100,
        height: 100,
        tooltip: "HEB Zibata"
      },
      {
        polygonId: "WALMART",
        icon: "/assets/icons/walmart.svg",
        width: 100,
        height: 100,
        offsetX: 20,
        offsetY: -30,
        tooltip: "Walmart Zibata"
      }
    ]);
  }, []);

  // Manejador para cuando se hace clic en un polígono
  const handlePolygonClick = (polygonId: string) => {
    setSelectedPolygonId(polygonId);
    setSelectedIconIndex(null);
  };

  // Función para actualizar un polígono
  const updatePolygon = (id: string, updates: Partial<Polygon>) => {
    setPolygons(polygons.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  // Función para actualizar un icono
  const updateIcon = (index: number, updates: Partial<PolygonIcon>) => {
    setIcons(icons.map((icon, i) => 
      i === index ? { ...icon, ...updates } : icon
    ));
  };

  // Función para añadir un nuevo icono
  const addIcon = () => {
    const newIcon: PolygonIcon = {
      polygonId: selectedPolygonId || "HEB", // Usar el polígono seleccionado o uno predeterminado
      icon: "/assets/icons/placeholder.png",
      width: 50,
      height: 50,
      tooltip: "Nuevo Icono"
    };
    setIcons([...icons, newIcon]);
    setSelectedIconIndex(icons.length);
  };

  // Función para eliminar un icono
  const deleteIcon = (index: number) => {
    setIcons(icons.filter((_, i) => i !== index));
    setSelectedIconIndex(null);
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      // Aquí enviaríamos los datos a una API
      alert("Guardado exitosamente (simulado)");
      console.log("Polígonos:", polygons);
      console.log("Iconos:", icons);
      
      // En un caso real, enviaríamos los datos al servidor:
      // await fetch('/api/map', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ polygons, icons })
      // });
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar cambios");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Mapa - ocupa 2/3 del espacio en pantallas grandes */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[600px] relative">
          <ZibataMap 
            height="600px"
            highlightedPolygonId={selectedPolygonId || undefined}
            polygonIcons={icons}
            onPolygonClick={handlePolygonClick}
          />
        </div>
      </div>

      {/* Panel de edición - ocupa 1/3 del espacio en pantallas grandes */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="mb-4">
          <div className="flex border-b">
            <button 
              className={`px-4 py-2 ${currentTab === 'polygons' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setCurrentTab('polygons')}
            >
              Polígonos
            </button>
            <button 
              className={`px-4 py-2 ${currentTab === 'icons' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setCurrentTab('icons')}
            >
              Iconos
            </button>
          </div>
        </div>

        {currentTab === 'polygons' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Editar Polígono</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Seleccionar Polígono</label>
              <select 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                value={selectedPolygonId || ''}
                onChange={(e) => setSelectedPolygonId(e.target.value)}
              >
                <option value="">Selecciona un polígono...</option>
                {polygons.map(polygon => (
                  <option key={polygon.id} value={polygon.id}>{polygon.name}</option>
                ))}
              </select>
            </div>

            {selectedPolygonId && (
              <div className="space-y-4">
                {polygons.filter(p => p.id === selectedPolygonId).map(polygon => (
                  <div key={polygon.id}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input 
                        type="text" 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={polygon.name}
                        onChange={(e) => updatePolygon(polygon.id, { name: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Slug</label>
                      <input 
                        type="text" 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={polygon.slug || ''}
                        onChange={(e) => updatePolygon(polygon.id, { slug: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Color de relleno</label>
                      <input 
                        type="color" 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={polygon.fill || '#D3D3D3'}
                        onChange={(e) => updatePolygon(polygon.id, { fill: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">URL de la foto</label>
                      <input 
                        type="text" 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={polygon.photo || ''}
                        onChange={(e) => updatePolygon(polygon.id, { photo: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Path SVG</label>
                      <textarea 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md h-20"
                        value={polygon.path}
                        onChange={(e) => updatePolygon(polygon.id, { path: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'icons' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Editar Iconos</h2>
            
            <div className="mb-4">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={addIcon}
              >
                Añadir icono
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Seleccionar Icono</label>
              <select 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                value={selectedIconIndex !== null ? selectedIconIndex : ''}
                onChange={(e) => setSelectedIconIndex(Number(e.target.value))}
              >
                <option value="">Selecciona un icono...</option>
                {icons.map((icon, index) => (
                  <option key={index} value={index}>
                    {icon.tooltip || `Icono ${index + 1} (${icon.polygonId})`}
                  </option>
                ))}
              </select>
            </div>

            {selectedIconIndex !== null && selectedIconIndex >= 0 && selectedIconIndex < icons.length && (
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">ID del Polígono</label>
                  <select 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    value={icons[selectedIconIndex].polygonId}
                    onChange={(e) => updateIcon(selectedIconIndex, { polygonId: e.target.value })}
                  >
                    {polygons.map(polygon => (
                      <option key={polygon.id} value={polygon.id}>{polygon.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">URL del icono</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    value={icons[selectedIconIndex].icon}
                    onChange={(e) => updateIcon(selectedIconIndex, { icon: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ancho</label>
                    <input 
                      type="number" 
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      value={icons[selectedIconIndex].width || 30}
                      onChange={(e) => updateIcon(selectedIconIndex, { width: Number(e.target.value) })}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Alto</label>
                    <input 
                      type="number" 
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      value={icons[selectedIconIndex].height || 30}
                      onChange={(e) => updateIcon(selectedIconIndex, { height: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Offset X</label>
                    <input 
                      type="number" 
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      value={icons[selectedIconIndex].offsetX || 0}
                      onChange={(e) => updateIcon(selectedIconIndex, { offsetX: Number(e.target.value) })}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Offset Y</label>
                    <input 
                      type="number" 
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                      value={icons[selectedIconIndex].offsetY || 0}
                      onChange={(e) => updateIcon(selectedIconIndex, { offsetY: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tooltip</label>
                  <input 
                    type="text" 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    value={icons[selectedIconIndex].tooltip || ''}
                    onChange={(e) => updateIcon(selectedIconIndex, { tooltip: e.target.value })}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={icons[selectedIconIndex].isImageIcon || false}
                      onChange={(e) => updateIcon(selectedIconIndex, { isImageIcon: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Es una imagen real</span>
                  </label>
                </div>
                
                {icons[selectedIconIndex].isImageIcon && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Color de fondo</label>
                      <input 
                        type="color" 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={icons[selectedIconIndex].backgroundColor || '#FFFFFF'}
                        onChange={(e) => updateIcon(selectedIconIndex, { backgroundColor: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Color del borde</label>
                      <input 
                        type="color" 
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={icons[selectedIconIndex].borderColor || '#4B5563'}
                        onChange={(e) => updateIcon(selectedIconIndex, { borderColor: e.target.value })}
                      />
                    </div>
                  </>
                )}
                
                <div className="mb-4">
                  <button 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => deleteIcon(selectedIconIndex)}
                  >
                    Eliminar icono
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <button 
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={saveChanges}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
