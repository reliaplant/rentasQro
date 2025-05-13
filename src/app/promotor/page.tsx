"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { getProperties, getCondominiums, getPromotores, Promotor } from '@/app/shared/firebase';

// Simple loading component
const AdvisorLoading = () => (
  <div className="min-h-screen flex items-center justify-center">Cargando...</div>
);

// Main component with Suspense wrapper
export default function AsesorDashboard() {
  return (
    <Suspense fallback={<AdvisorLoading />}>
      <AsesorContent />
    </Suspense>
  );
}

// Actual content component
function AsesorContent() {
  const [properties, setProperties] = useState<any[]>([]);
  const [condos, setCondos] = useState<any[]>([]);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [selectedPromotor, setSelectedPromotor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [transactionType, setTransactionType] = useState<string>('all');
  const [selectedCondo, setSelectedCondo] = useState<string>('all');
  const [copiedPropertyId, setCopiedPropertyId] = useState<string | null>(null);

  // Fetch properties, condos, and promoters
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all properties, condominiums, and promotores
        const [allProperties, allCondos, allPromotores] = await Promise.all([
          getProperties(),
          getCondominiums(),
          getPromotores()
        ]);
        
        setProperties(allProperties);
        setCondos(allCondos);
        setPromotores(allPromotores);
        
        // Check if there's a previously selected promotor in localStorage
        const savedPromotor = localStorage.getItem('selectedPromotor');
        if (savedPromotor) {
          setSelectedPromotor(savedPromotor);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Handle promotor selection
  const handlePromotorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPromotor(value);
    
    // Save selection to localStorage for persistence
    if (value) {
      localStorage.setItem('selectedPromotor', value);
    } else {
      localStorage.removeItem('selectedPromotor');
    }
  };

  // Filter properties based on selected filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Filter by transaction type if not 'all'
      if (transactionType !== 'all' && property.transactionType !== transactionType) {
        return false;
      }
      
      // Filter by condo if not 'all'
      if (selectedCondo !== 'all' && property.condo !== selectedCondo) {
        return false;
      }
      
      return true;
    });
  }, [properties, transactionType, selectedCondo]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Find the selected promotor details
  const promotorDetails = promotores.find(p => p.id === selectedPromotor);

  // Function to copy link with UTM parameters
  const copyPropertyLink = (propertyId: string) => {
    if (!promotorDetails) {
      // Show error or request promotor selection
      alert('Por favor selecciona tu nombre de promotor primero');
      return;
    }
    
    // Create the URL with UTM parameters
    const url = `https://pizo.mx/propiedad/${propertyId}?utm_campaign=${promotorDetails.code}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Show feedback
      setCopiedPropertyId(propertyId);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopiedPropertyId(null);
      }, 2000);
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      alert('No se pudo copiar al portapapeles');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      

      {/* Promotor Selection Section */}
      <div className="bg-indigo-50 p-8 border-b border-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-indigo-900 mb-4">
            Busca tu nombre para promover una propiedad
          </h2>
          <p className="text-indigo-700 mb-6">
            Selecciona tu nombre de la lista para obtener tu código de promotor
          </p>
          
          <div className="max-w-xl mx-auto">
            <select
              value={selectedPromotor}
              onChange={handlePromotorChange}
              className="block w-full p-4 text-lg border-2 border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Selecciona tu nombre --</option>
              {promotores.map((promotor) => (
                <option key={promotor.id} value={promotor.id}>
                  {promotor.name}
                </option>
              ))}
            </select>
            
            {promotorDetails && (
              <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                <p className="font-medium text-gray-700">Tu código de promotor es:</p>
                <div className="mt-2 text-3xl font-bold text-indigo-600 tracking-wider">
                  {promotorDetails.code}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Usa este código al enviar prospectos para recibir comisión por referidos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties List with Filters */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter Panel */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Transaction Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transacción</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setTransactionType('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    transactionType === 'all' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTransactionType('renta')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    transactionType === 'renta' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Renta
                </button>
                <button
                  onClick={() => setTransactionType('venta')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    transactionType === 'venta' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Venta
                </button>
              </div>
            </div>

            {/* Condominium Filter */}
            <div className="ml-auto">
              <label htmlFor="condo-select" className="block text-sm font-medium text-gray-700 mb-1">
                Condominio
              </label>
              <select
                id="condo-select"
                value={selectedCondo}
                onChange={(e) => setSelectedCondo(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">Todos los condominios</option>
                {condos.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lista de Propiedades 
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad' : 'propiedades'})
            </span>
          </h2>
          
          {filteredProperties.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No hay propiedades que coincidan con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={property.imageUrls && property.imageUrls.length > 0 
                            ? property.imageUrls[0] 
                            : '/assets/images/placeholder.jpg'
                          } 
                          alt={property.title || 'Propiedad'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {property.propertyType || 'N/A'} - {property.transactionType || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${property.price?.toLocaleString() || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {property.zoneName || property.condoName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.status === 'publicada' ? 'bg-green-100 text-green-800' : 
                          property.status === 'reservada' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {property.status === 'publicada' ? 'Publicada' : 
                           property.status === 'reservada' ? 'Reservada' : 
                           property.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <a 
                            href={`/propiedad/${property.id}${promotorDetails ? `?promo=${promotorDetails.code}` : ''}`} 
                            className="text-indigo-600 hover:text-indigo-900"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver
                          </a>
                          <button
                            onClick={() => copyPropertyLink(property.id)}
                            className={`${
                              copiedPropertyId === property.id
                                ? 'text-green-600 hover:text-green-800'
                                : 'text-gray-600 hover:text-gray-800'
                            } flex items-center transition-colors duration-200`}
                          >
                            {copiedPropertyId === property.id ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                ¡Copiado!
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
