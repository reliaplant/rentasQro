import { useState, useEffect } from 'react';
import { Plus, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { getZones, getCondosByZone } from '@/app/services/firebase';
import { ZoneData, CondoData } from '@/app/interfaces';
import EditZone from './editZone';
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

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const zonesData = await getZones();
      setZones(zonesData);
      
      const condosData: {[key: string]: CondoData[]} = {};
      for (const zone of zonesData) {
        if (zone.id) {
          condosData[zone.id] = await getCondosByZone(zone.id);
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
    router.push(`/editCondo/new?zoneId=${zoneId}`);
  };

  const handleEditCondo = (condo: CondoData) => {
    router.push(`/editCondo/${condo.id}`);
  };

  const handleEditZone = (zone: ZoneData) => {
    setSelectedZone(zone);
    setIsEditZoneOpen(true);
  };

  const handleAddZone = () => {
    setSelectedZone(undefined);
    setIsEditZoneOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Zonas y Condominios</h2>
        <button
          onClick={handleAddZone}
          className="px-4 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C0A070] flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Zona
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D2B48C]"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {zones.length > 0 ? (
            zones.map(zone => (
              <div key={zone.id} className="bg-white rounded-lg shadow">
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
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Condominios</h4>
                      <button
                        onClick={() => handleAddCondo(zone.id!)}
                        className="text-sm text-[#D2B48C] hover:text-[#BC8F8F] flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Agregar Condominio
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {condos[zone.id!]?.length > 0 ? (
                        condos[zone.id!].map(condo => (
                          <div 
                            key={condo.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleEditCondo(condo)}
                          >
                            <span>{condo.name}</span>
                            <Edit2 size={16} className="text-gray-500" />
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
        <EditZone
          zone={selectedZone}
          onClose={() => setIsEditZoneOpen(false)}
          onSave={() => {
            fetchZones();
            setIsEditZoneOpen(false);
          }}
        />
      )}
    </div>
  );
}