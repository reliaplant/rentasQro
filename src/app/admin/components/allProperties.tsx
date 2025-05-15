import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, MessageSquare, ChevronDown, ChevronUp, UserCheck, PlusCircle, Percent, UserPlus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { 
  getProperties, 
  getAdvisorData, 
  getAllAdvisors, 
  updateProperty, 
  updatePropertyCountsForAllZones
} from '@/app/shared/firebase';
import { PropertyData } from '@/app/shared/interfaces';

export default function AllProperties() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [advisors, setAdvisors] = useState<{[key: string]: any}>({});
  const [allAdvisorsList, setAllAdvisorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof PropertyData>('publicationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [updatingAdvisor, setUpdatingAdvisor] = useState<string | null>(null);
  const [updatingCounts, setUpdatingCounts] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getProperties();
        setProperties(data);
        
        // Get unique advisor IDs
        const advisorIds = [...new Set(data.map(prop => prop.advisor).filter(Boolean))];
        
        // Fetch advisor data for each unique ID
        const advisorData: {[key: string]: any} = {};
        for (const id of advisorIds) {
          if (id) {
            console.log(`Fetching data for advisor ${id}`);
            const advisor = await getAdvisorData(id);
            if (advisor) {
              console.log(`Found advisor data:`, advisor);
              advisorData[id] = advisor;
            } else {
              console.log(`No data found for advisor ${id}`);
            }
          }
        }
        
        console.log("Advisors data:", advisorData);
        setAdvisors(advisorData);
        
        // Fetch all advisors for dropdown
        const advisorsList = await getAllAdvisors();
        console.log("All advisors:", advisorsList);
        setAllAdvisorsList(advisorsList);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Get advisor name from advisors object
  const getAdvisorName = (advisorId: string | undefined) => {
    if (!advisorId) return 'No asignado';
    console.log(`Getting name for advisor ${advisorId}, data:`, advisors[advisorId]);
    return advisors[advisorId]?.name || 'Asesor desconocido';
  };

  // Handle advisor change
  const handleAdvisorChange = async (propertyId: string | undefined, advisorId: string) => {
    if (!propertyId) return;
    
    setUpdatingAdvisor(propertyId);
    try {
      await updateProperty(propertyId, { advisor: advisorId });
      
      // Update local state
      setProperties(prevProps => 
        prevProps.map(p => 
          p.id === propertyId ? { ...p, advisor: advisorId } : p
        )
      );
      
      // If this is a new advisor we don't have data for, fetch it
      if (advisorId && !advisors[advisorId]) {
        const advisor = await getAdvisorData(advisorId);
        if (advisor) {
          setAdvisors(prev => ({ ...prev, [advisorId]: advisor }));
        }
      }
    } catch (error) {
      console.error('Error updating advisor:', error);
      alert('Error al asignar asesor');
    } finally {
      setUpdatingAdvisor(null);
    }
  };

  const sortProperties = (a: PropertyData, b: PropertyData) => {
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  };

  const toggleSort = (field: keyof PropertyData) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof PropertyData }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Add a function to update property counts
  const handleUpdatePropertyCounts = async () => {
    if (updatingCounts) return;
    
    try {
      setUpdatingCounts(true);
      setUpdateMessage(null);
      
      await updatePropertyCountsForAllZones();
      
      setUpdateMessage({
        type: 'success',
        text: 'Conteo de propiedades actualizado correctamente'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating property counts:', error);
      setUpdateMessage({
        type: 'error',
        text: 'Error al actualizar conteo de propiedades'
      });
    } finally {
      setUpdatingCounts(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Administrar Propiedades</h2>
          
          {updateMessage && (
            <div className={`text-sm px-3 py-1 rounded-md ${
              updateMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {updateMessage.text}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdatePropertyCounts}
            disabled={updatingCounts}
            className={`inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              updatingCounts ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${updatingCounts ? 'animate-spin' : ''}`} />
            <span>{updatingCounts ? 'Actualizando...' : 'Actualizar Conteos'}</span>
          </button>
          
          <Link
            href="/admin/editarPropiedad?id=new"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-[18px] h-[18px]" />
            <span>Crear Nueva Propiedad</span>
          </Link>
        </div>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => toggleSort('propertyType')}>
              <div className="flex items-center gap-2">
                Propiedad
                <SortIcon field="propertyType" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => toggleSort('price')}>
              <div className="flex items-center gap-2">
                Precio
                <SortIcon field="price" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Métricas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asesor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asesor Aliado / Pizo
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {properties.sort(sortProperties).map((property) => (
            <tr key={property.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0">
                    {property.imageUrls && property.imageUrls[0] ? (
                      <Image
                        src={property.imageUrls[0]}
                        alt={`Imagen de ${property.propertyType}`}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {property.propertyType}, {property.condoName}, #{property.propertyCondoNumber}
                    </div>
                    <div className="text-sm text-gray-900">Zibata</div>
                    <div className="text-xs text-gray-500 font-semibold">ID: {(property.id ?? '').slice(0, 5)}</div>
                    {/* Add edit button */}
                    <a 
                      href={`/admin/editarPropiedad?id=${property.id}`}
                      className="mt-1 inline-flex items-center px-2 py-1 text-xs text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-md font-medium"
                    >
                      <svg 
                        className="w-3 h-3 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </a>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="text-sm">{property.transactionType}</div>
                <div className="text-sm font-medium">${property.price.toLocaleString()}</div>
              </td>
              
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-sm">{property.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-sm">{property.whatsappClicks}</span>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${property.status === 'publicada' ? 'bg-green-100 text-green-800' :
                    property.status === 'borrador' ? 'bg-gray-100 text-gray-800' :
                      property.status === 'vendida' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                  }`}>
                  {property.status}
                </span>
              </td>
              
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className={property.advisor ? "text-green-500" : "text-gray-400"} />
                  
                  {updatingAdvisor === property.id ? (
                    <span className="text-xs text-blue-500">Actualizando...</span>
                  ) : (
                    <select 
                      className="text-sm border border-gray-200 rounded px-2 py-1 bg-white w-full max-w-[200px]"
                      value={property.advisor || ''}
                      onChange={(e) => handleAdvisorChange(property.id, e.target.value)}
                    >
                      <option value="">Seleccionar asesor</option>
                      {allAdvisorsList.map(advisor => (
                        <option key={advisor.id} value={advisor.id}>
                          {advisor.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {property.advisor && (
                  <div className="text-xs text-gray-500 mt-1">
                    {getAdvisorName(property.advisor)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  {property.asesorAliado && (
                    <div className="flex items-center gap-1">
                      <UserPlus size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">{property.asesorAliado}</span>
                    </div>
                  )}
                  
                  {property.porcentajePizo !== undefined && (
                    <div className="flex items-center gap-1">
                      <Percent size={16} className="text-green-500" />
                      <span className="text-sm">{property.porcentajePizo}%</span>
                    </div>
                  )}
                  
                  {!property.asesorAliado && property.porcentajePizo === undefined && (
                    <span className="text-xs text-gray-500">No especificado</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}