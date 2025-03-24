import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { getZones, getCondosByZone } from '@/app/services/firebase';
import { ZoneData, CondoData } from '@/app/interfaces';
import EditZone from './editZone';
import EditCondo from '@/app/editCondo/[id]/page';
import { useRouter } from 'next/navigation';

export default function Zones() {
  const router = useRouter();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [condos, setCondos] = useState<{[key: string]: CondoData[]}>({});
  const [expandedZones, setExpandedZones] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [selectedZone, setSelectedZone] = useState<ZoneData | undefined>();
  const [selectedCondo, setSelectedCondo] = useState<CondoData | undefined>();
  const [isEditZoneOpen, setIsEditZoneOpen] = useState(false);
  const [isEditCondoOpen, setIsEditCondoOpen] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondo = (zoneId: string) => {
    router.push(`/admin/editCondo/new?zoneId=${zoneId}`);
  };

  const handleEditCondo = (condo: CondoData) => {
    router.push(`/admin/editCondo/${condo.id}?zoneId=${condo.zoneId}`);
  };

  const handleEditZone = (zone: ZoneData) => {
    setSelectedZone(zone);
    setIsEditZoneOpen(true);
  };

  const handleSaveCondo = () => {
    fetchZones();
    setIsEditCondoOpen(false);
  };

  return (
    <div className="p-6">
      {/* ...existing zone header... */}

      <div className="grid gap-6">
        {zones.map(zone => (
          <div key={zone.id} className="bg-white rounded-lg shadow">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <button onClick={() => setExpandedZones(prev => ({ ...prev, [zone.id!]: !prev[zone.id!] }))}>
                  {expandedZones[zone.id!] ? (
                    <ChevronDown className="text-gray-400" />
                  ) : (
                    <ChevronRight className="text-gray-400" />
                  )}
                </button>
                <div>
                  <h3 className="font-medium">{zone.name}</h3>
                  <p className="text-sm text-gray-500">
                    {condos[zone.id!]?.length || 0} condominios
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditZone(zone)}>
                  <Edit2 size={18} className="text-gray-500" />
                </button>
              </div>
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
                  {condos[zone.id!]?.map(condo => (
                    <div key={condo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{condo.name}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditCondo(condo)}
                          className="p-1.5 hover:bg-gray-200 rounded-full"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {isEditZoneOpen && (
        <EditZone
          zone={selectedZone}
          onClose={() => setIsEditZoneOpen(false)}
          onSave={fetchZones}
        />
      )}

      {/* {isEditCondoOpen && selectedZone && (
        <EditCondo
          zoneId={selectedZone.id!}
          condo={selectedCondo}
          onClose={() => setIsEditCondoOpen(false)}
          onSave={handleSaveCondo}
        />
      )} */}
    </div>
  );
}