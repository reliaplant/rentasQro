import { useState, useEffect } from 'react';
import { Plus, Edit2, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { getZones, getCondosByZone, updateCondoQualityLevel } from '@/app/shared/firebase';
import { ZoneData, CondoData } from '@/app/shared/interfaces';
import EditZone from '@/app/admin/components/zones/editZone';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Zones() {
  const router = useRouter();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [condos, setCondos] = useState<{[key: string]: CondoData[]}>({});
  const [expandedZones, setExpandedZones] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [selectedZone, setSelectedZone] = useState<ZoneData | undefined>();
  const [isEditZoneOpen, setIsEditZoneOpen] = useState(false);
    const [qualityMenuOpen, setQualityMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchZones();
  }, []);

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Comprueba si el clic fue en un elemento con la clase 'quality-indicator'
      const target = e.target as HTMLElement;
      if (!target.closest('.quality-menu') && !target.closest('.quality-indicator')) {
        setQualityMenuOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchZones = async () => {
    try {
      const zonesData = await getZones();
      setZones(zonesData);
      
      const condosData: {[key: string]: CondoData[]} = {};
      for (const zone of zonesData) {
        if (zone.id) {
          // Obtenemos los condominios y los ordenamos alfabéticamente por nombre
          const zoneCondos = await getCondosByZone(zone.id);
          condosData[zone.id] = zoneCondos.sort((a, b) => 
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
        }
      }
      setCondos(condosData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las zonas y condominios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondo = (zoneId: string) => {
    router.push(`/admin/editCondo/new?zoneId=${zoneId}`);
  };

  const handleEditCondo = (condo: CondoData) => {
    router.push(`/admin/editCondo/${condo.id}`);
  };

  const handleEditZone = (zone: ZoneData) => {
    setSelectedZone(zone);
    setIsEditZoneOpen(true);
  };

  const handleAddZone = () => {
    setSelectedZone(undefined);
    setIsEditZoneOpen(true);
  };

  // Modificación para asegurar que el toggleQualityMenu funcione correctamente
  const toggleQualityMenu = (e: React.MouseEvent, condoId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Toggle quality menu for condo:", condoId); // Añadir log para depuración
    setQualityMenuOpen(prevState => {
      console.log("Current menu state:", prevState, "Setting to:", prevState === condoId ? null : condoId);
      return prevState === condoId ? null : condoId;
    });
  };

  const updateQualityLevel = async (e: React.MouseEvent, condo: CondoData, level: 'high' | 'medium' | 'low') => {
    e.stopPropagation();
    try {
      // Actualizar en Firebase
      if (condo.id) {
        await updateCondoQualityLevel(condo.id, level);
      }
      
      toast.success(`Nivel de calidad actualizado`);
      
      // Update local state 
      const updatedCondos = {...condos};
      if (condo.id && condo.zoneId) {
        updatedCondos[condo.zoneId] = updatedCondos[condo.zoneId].map(c => 
          c.id === condo.id ? {...c, qualityLevel: level} : c
        );
        setCondos(updatedCondos);
      }
    } catch (error) {
      console.error('Error updating quality level:', error);
      toast.error('Error al actualizar el nivel de calidad');
    } finally {
      setQualityMenuOpen(null);
    }
  };

  const getQualityColor = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center px-4 py-2 border-b border-b-gray-300">
        <h2 className="text-lg font-semibold text-gray-800">Zonas y Condominios</h2>
        <button
          onClick={handleAddZone}
          className="px-4 py-1.5 bg-black text-white font-medium text-sm rounded-lg flex items-center gap-2 hover:opacity-90 border-2 border-[#6981d3] hover:border-[#1856e7] transition-colors cursor-pointer"
        >
          <Plus size={18} className="text-white" />
          <span className="font-medium">Nueva Zona</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D2B48C]"></div>
        </div>
      ) : (
        <div className="grid border-b border-gray-200">
          {zones.length > 0 ? (
            zones.map(zone => (
              <div key={zone.id} className="bg-white shadow border-b border-gray-200">
                <div 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedZones(prev => ({ ...prev, [zone.id!]: !prev[zone.id!] }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">
                      {expandedZones[zone.id!] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-medium">{zone.name}</h3>
                      <p className="text-sm text-gray-500">
                        {condos[zone.id!]?.length || 0} condominios
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditZone(zone);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Edit2 size={18} className="text-gray-500" />
                  </button>
                </div>

                {expandedZones[zone.id!] && (
                  <div className="border-t border-gray-100 p-10 bg-gray-100">
                    <div className="flex items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Condominios</h4>
                            <button
                            onClick={() => handleAddCondo(zone.id!)}
                            className="ml-4 px-2 py-1 text-[#1856e7] text-sm rounded flex items-center gap-1 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                            <Plus size={14} />
                            <span>Agregar</span>
                            </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {condos[zone.id!]?.length > 0 ? (
                      condos[zone.id!].map(condo => (
                        <div 
                        key={condo.id} 
                        className="flex items-center justify-between p-5 bg-white rounded-lg hover:outline-2 hover:outline-blue-700 hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleEditCondo(condo)}
                        >
                        <span>{condo.name}</span>
                        <div className='flex flex-row gap-2'>
                        <Edit2 size={16} className="text-gray-500 hover:text-blue-500 " />
                        <Eye size={16} className="text-gray-500 hover:text-blue-500 " />
                        <div className="relative" style={{ position: 'relative' }}>
                          <button 
                            className={`w-4 h-4 rounded-full ${getQualityColor(condo.qualityLevel)} cursor-pointer quality-indicator`}
                            onClick={(e) => toggleQualityMenu(e, condo.id!)}
                          ></button>
                          {qualityMenuOpen === condo.id && (
                            <div 
                              className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-1 quality-menu"
                              style={{ 
                                minWidth: '80px', 
                                zIndex: 9999,
                                position: 'absolute',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                                transform: 'translateZ(0)'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div 
                                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => updateQualityLevel(e, condo, 'high')}
                              >
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs">Alto</span>
                              </div>
                              <div 
                                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => updateQualityLevel(e, condo, 'medium')}
                              >
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-xs">Medio</span>
                              </div>
                              <div 
                                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => updateQualityLevel(e, condo, 'low')}
                              >
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs">Bajo</span>
                              </div>
                            </div>
                          )}
                        </div>
                        </div>
                        </div>
                      ))
                      ) : (
                      <p className="text-sm text-gray-500 italic">No hay condominios en esta zona</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay zonas registradas. Crea una nueva zona para comenzar.
            </div>
          )}
        </div>
      )}

      {/* Modal de edición de zona */}
      {isEditZoneOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <EditZone
            zone={selectedZone}
            onClose={() => setIsEditZoneOpen(false)}
            onSave={() => {
              fetchZones();
              setIsEditZoneOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}