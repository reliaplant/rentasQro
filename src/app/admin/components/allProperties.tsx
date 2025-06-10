import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, MessageSquare, ChevronDown, ChevronUp, UserCheck, PlusCircle, Percent, UserPlus, RefreshCw, Download, Star, X } from 'lucide-react';
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
  const [updatingFeatured, setUpdatingFeatured] = useState<string | null>(null);
  const [editingPizo, setEditingPizo] = useState<string | null>(null);
  const [pizoValue, setPizoValue] = useState<number>(0);
  const [savingPizo, setSavingPizo] = useState<string | null>(null);

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

  // Function to download properties with metrics
  const downloadPropertiesMetrics = async () => {
    try {
      // Fetch all properties with metrics
      const properties = await getProperties();
      
      // Convert to CSV
      const csvRows = [];
      
      // Add header row
      csvRows.push([
        'ID', 
        'Título', 
        'Tipo de Propiedad', 
        'Tipo de Transacción', 
        'Precio', 
        'Ubicación', 
        'Vistas', 
        'Clicks WhatsApp', 
        'Estado',
        'Fecha de Publicación'
      ].join(','));
      
      // Add data rows
      for (const property of properties) {
        const row = [
          property.id || '',
          `"${(property.title || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
          property.propertyType || '',
          property.transactionType || '',
          property.price || 0,
          `"${(property.condoName || '').replace(/"/g, '""')}"`,
          property.views || 0,
          property.whatsappClicks || 0,
          property.status || '',
          property.publicationDate ? new Date(property.publicationDate.seconds * 1000).toLocaleDateString() : ''
        ];
        
        csvRows.push(row.join(','));
      }
      
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `propiedades-metricas-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading properties:', error);
      alert('Error al descargar las propiedades');
    }
  };

  // Function to toggle featured status
  const toggleFeaturedStatus = async (propertyId: string | undefined, currentStatus: boolean | undefined) => {
    if (!propertyId) return;
    
    setUpdatingFeatured(propertyId);
    try {
      const newStatus = !currentStatus;
      await updateProperty(propertyId, { featured: newStatus });
      
      // Update local state
      setProperties(prevProps => 
        prevProps.map(p => 
          p.id === propertyId ? { ...p, featured: newStatus } : p
        )
      );
      
      // Show brief success message
      setUpdateMessage({
        type: 'success',
        text: `Propiedad ${newStatus ? 'destacada' : 'no destacada'} actualizada`
      });
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Error updating featured status:', error);
      setUpdateMessage({
        type: 'error',
        text: 'Error al actualizar estado destacado'
      });
    } finally {
      setUpdatingFeatured(null);
    }
  };

  // Add function to handle porcentaje pizo updates
  const updatePorcentajePizo = async (propertyId: string | undefined, newValue: number) => {
    if (!propertyId) return;
    
    setSavingPizo(propertyId);
    try {
      await updateProperty(propertyId, { porcentajePizo: newValue });
      
      // Update local state
      setProperties(prevProps => 
        prevProps.map(p => 
          p.id === propertyId ? { ...p, porcentajePizo: newValue } : p
        )
      );
      
      setUpdateMessage({
        type: 'success',
        text: 'Porcentaje Pizo actualizado correctamente'
      });
      
      // Clear message after 2 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating porcentaje pizo:', error);
      setUpdateMessage({
        type: 'error',
        text: 'Error al actualizar porcentaje Pizo'
      });
    } finally {
      setSavingPizo(null);
      setEditingPizo(null);
    }
  };
  
  const startEditingPizo = (property: PropertyData) => {
    setEditingPizo(property.id || null);
    setPizoValue(property.porcentajePizo !== undefined ? property.porcentajePizo : 0);
  };
  
  const cancelEditPizo = () => {
    setEditingPizo(null);
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
            onClick={downloadPropertiesMetrics}
            className="inline-flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Métricas</span>
          </button>
          
          <button
            onClick={handleUpdatePropertyCounts}
            disabled={updatingCounts}
            className={`inline-flex items-center gap-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              updatingCounts ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${updatingCounts ? 'animate-spin' : ''}`} />
            <span>{updatingCounts ? 'Actualizando...' : 'Actualizar Conteos'}</span>
          </button>
          
          <Link
            href="/admin/editarPropiedad?id=new"
            className="inline-flex items-center gap-2 border border-violet-600 text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
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
              Destacada
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
                      {property.propertyType}, {property.condoName}{property.modelo ? `, ${property.modelo}` : ''}, #{property.propertyCondoNumber}
                    </div>
                    <div className="text-sm text-gray-900">Zibata</div>
                    <div className="text-xs text-gray-500 font-semibold">ID: {(property.id ?? '').slice(0, 5)}</div>
                    
                    {/* Control buttons */}
                    <div className="mt-1 flex gap-2">
                      <a 
                        href={`/admin/editarPropiedad?id=${property.id}`}
                        className="inline-flex items-center px-2 py-1 text-xs text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-md font-medium"
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
                      
                      <a 
                        href={`/propiedad/${property.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md font-medium"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </a>
                    </div>
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
                  <button
                    onClick={() => toggleFeaturedStatus(property.id, property.featured)}
                    disabled={updatingFeatured === property.id}
                    className={`p-2 rounded-full transition-all ${
                      property.featured 
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    } ${updatingFeatured === property.id ? 'opacity-50' : ''}`}
                    title={property.featured ? 'Quitar destacado' : 'Marcar como destacada'}
                  >
                    <Star className={`w-5 h-5 ${property.featured ? 'fill-yellow-500' : ''}`} />
                  </button>
                  
                  <span className={`text-xs ${property.featured ? 'text-yellow-700 font-medium' : 'text-gray-500'}`}>
                    {property.featured ? 'Destacada' : 'No destacada'}
                  </span>
                </div>
              </td>
              
              <td className="px-6 py-4">

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
                  
                  {/* Editable porcentaje pizo */}
                  <div className="flex items-center gap-1">
                    {editingPizo === property.id ? (
                      <div className="flex items-center gap-1">
                        <Percent size={16} className="text-green-500" />
                        <input
                          type="number"
                          value={pizoValue}
                          onChange={(e) => setPizoValue(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-1 ml-1">
                          <button
                            onClick={() => updatePorcentajePizo(property.id, pizoValue)}
                            disabled={savingPizo === property.id}
                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            {savingPizo === property.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={cancelEditPizo}
                            className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {property.porcentajePizo !== undefined ? (
                          <>
                            <Percent size={16} className="text-green-500" />
                            <span className="text-sm">{property.porcentajePizo}%</span>
                            <button
                              onClick={() => startEditingPizo(property)}
                              className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Editar porcentaje Pizo"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEditingPizo(property)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 py-1 px-2 hover:bg-gray-100 rounded-md"
                          >
                            <Percent size={12} />
                            <span>Añadir %</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
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