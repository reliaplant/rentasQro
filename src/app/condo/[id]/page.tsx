"use client";

import { useState, useEffect } from 'react';
import { negocio } from '@/app/shared/interfaces';
import { getNegocios } from '@/app/shared/firebase';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp directly from firebase/firestore
import Filters from './components.tsx/filter';
import KPIs from './components.tsx/kpis';
import Pipeline from './components.tsx/pipeline';
import FieldEditor from './components.tsx/fieldEditor';
import SelectedGoogleReviews from '../components/SelectedGoogleReviews';

export default function CRMPage() {
  const [negocios, setNegocios] = useState<negocio[]>([]);
  const [filteredNegocios, setFilteredNegocios] = useState<negocio[]>([]); // New state for filtered results
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    transactionType: 'all', // 'all', 'renta', 'venta', 'ventaRenta'
    showDormant: false, // whether to show dormant leads
    asesor: 'all', // filter by advisor
    searchTerm: '' // New search term filter
  });
  const [isCreatingNegocio, setIsCreatingNegocio] = useState(false);
  const [showKpis, setShowKpis] = useState(false); // Changed default to false - KPIs hidden by default

  useEffect(() => {
    fetchNegocios();
  }, [filters.transactionType, filters.showDormant, filters.asesor]); // Don't include searchTerm here

  // New effect for filtering by search term (client-side filtering)
  useEffect(() => {
    if (!filters.searchTerm.trim()) {
      // If no search term, use all negocios
      setFilteredNegocios(negocios);
      return;
    }
    
    const searchTermLower = filters.searchTerm.toLowerCase();
    
    // Filter negocios by search term
    const filtered = negocios.filter(negocio => {
      // Search in multiple fields
      return (
        (negocio.nombreCompleto && negocio.nombreCompleto.toLowerCase().includes(searchTermLower)) ||
        (negocio.telefono && negocio.telefono.toLowerCase().includes(searchTermLower)) ||
        (negocio.correo && negocio.correo.toLowerCase().includes(searchTermLower)) ||
        (negocio.condoName && negocio.condoName.toLowerCase().includes(searchTermLower)) ||
        (negocio.origenTexto && negocio.origenTexto.toLowerCase().includes(searchTermLower)) ||
        (negocio.notas && negocio.notas.toLowerCase().includes(searchTermLower))
      );
    });
    
    setFilteredNegocios(filtered);
  }, [filters.searchTerm, negocios]);

  const fetchNegocios = async () => {
    setLoading(true);
    try {
      // Use the new getNegocios function with filters
      const negociosData = await getNegocios({
        transactionType: filters.transactionType === 'all' ? undefined : filters.transactionType,
        showDormant: filters.showDormant,
        asesor: filters.asesor === 'all' ? undefined : filters.asesor
      });
      
      setNegocios(negociosData);
      // Initialize filtered negocios with all negocios
      setFilteredNegocios(negociosData);
    } catch (error) {
      console.error("Error fetching negocios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleNegocioUpdate = async () => {
    await fetchNegocios();
  };

  // Empty negocio template for creating a new lead - updated with client information fields
  const emptyNegocio: negocio = {
    propiedadId: '',
    propertyType: 'casa',
    condoName: '',
    transactionType: 'venta',
    price: 0,
    comision: 5,
    estatus: 'propuesta',
    fechaCreacion: Timestamp.now(),
    origenTexto: '',
    origenUrl: '',
    asesor: typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '',
    porcentajePizo: 50,
    dormido: false,
    // Añadir los campos de cliente con valores por defecto
    nombreCompleto: '',
    telefono: '',
    correo: ''
  };

  const handleCreateNegocio = () => {
    console.log("Creating new lead");
    setIsCreatingNegocio(true);
  };

  const handleCloseCreateForm = () => {
    setIsCreatingNegocio(false);
    fetchNegocios(); // Refresh data after creating a lead
  };

  const handleToggleKpis = () => {
    setShowKpis(prevState => !prevState);
  };

  // Helper function to remove accents and normalize text for CSV export
  const removeAccents = (text: string): string => {
    return text
      .normalize("NFD") // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
      .replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII characters
  };

  // Function to download leads as CSV file
  const downloadLeadsAsCSV = () => {
    try {
      // Create CSV content
      const header = [
        'ID',
        'Tipo de Propiedad',
        'Condominio',
        'Tipo de Transaccion', // Removed accent
        'Precio',
        'Comision (%)', // Removed accent
        'Asesor Aliado',
        'Porcentaje Pizo (%)',
        'Estatus',
        'Fecha Creacion', // Removed accent
        'Fecha Cierre',
        'Dormido',
        'Dormido Hasta',
        'Notas',
        'Origen Texto',
        'Origen URL',
        'Asesor',
        'Nombre Cliente',
        'Telefono Cliente', // Removed accent
        'Correo Cliente'
      ].join(',');
      
      const rows = negocios.map(lead => {
        // Format data and escape commas and quotes for CSV
        const escapeCSV = (value: any) => {
          if (value === null || value === undefined) return '';
          // Remove accents and normalize text before escaping
          const str = removeAccents(String(value)).replace(/"/g, '""');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str}"`;
          }
          return str;
        };
        
        // Map transaction type to unaccented version
        const getTransactionType = (type: string) => {
          if (type === 'renta') return 'renta';
          if (type === 'venta') return 'venta';
          if (type === 'ventaRenta') return 'ventaRenta';
          return type;
        };
        
        // Map status to unaccented version
        const getStatus = (status: string) => {
          if (status === 'evaluación') return 'evaluacion';
          if (status === 'comercialización') return 'comercializacion';
          return status;
        };
        
        return [
          escapeCSV(lead.id),
          escapeCSV(lead.propertyType),
          escapeCSV(lead.condoName),
          escapeCSV(getTransactionType(lead.transactionType)),
          escapeCSV(lead.price),
          escapeCSV(lead.comision),
          escapeCSV(lead.asesorAliado),
          escapeCSV(lead.porcentajePizo),
          escapeCSV(getStatus(lead.estatus)),
          escapeCSV(lead.fechaCreacion ? new Date(lead.fechaCreacion.seconds * 1000).toLocaleDateString() : ''),
          escapeCSV(lead.fechaCierre ? new Date(lead.fechaCierre.seconds * 1000).toLocaleDateString() : ''),
          escapeCSV(lead.dormido ? 'Si' : 'No'), // Changed "Sí" to "Si"
          escapeCSV(lead.dormidoHasta ? new Date(lead.dormidoHasta.seconds * 1000).toLocaleDateString() : ''),
          escapeCSV(lead.notas),
          escapeCSV(lead.origenTexto),
          escapeCSV(lead.origenUrl),
          escapeCSV(lead.asesor),
          escapeCSV(lead.nombreCompleto),
          escapeCSV(lead.telefono),
          escapeCSV(lead.correo)
        ].join(',');
      });
      
      const csvContent = [header, ...rows].join('\n');
      
      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Leads_CRM_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting leads to CSV:", error);
      alert("Error al exportar leads a CSV");
    }
  };

  return (
    <div className="min-h-screen bg-white">
    
      
      {/* Filters at the top with create button and KPI toggle */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Filters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onCreateClick={handleCreateNegocio}
            showKpis={showKpis}
            onToggleKpis={handleToggleKpis}
            onExportCSV={downloadLeadsAsCSV} // Pass the function to Filters
          />
        </div>
      </div>
      
      {/* Content area with conditional KPIs rendering */}
      <div className="flex flex-col md:flex-row">
        {/* Pipeline (Kanban board) - Responsive sizing based on KPI visibility */}
        <div className={`w-full ${showKpis ? 'md:w-3/4' : 'md:w-full'} transition-all duration-300`}>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <Pipeline 
              negocios={filteredNegocios} 
              onNegocioUpdate={handleNegocioUpdate} 
            />
          )}
        </div>
        
        {/* KPIs section on the right - conditionally rendered */}
        {showKpis && (
          <div className="w-full md:w-1/4 border-l border-gray-200 p-4 transition-all duration-300">
            <KPIs negocios={negocios} />
          </div>
        )}
      </div>
      
      {/* Create Negocio Modal */}
      {isCreatingNegocio && (
        <FieldEditor 
          negocio={emptyNegocio} 
          onClose={handleCloseCreateForm} 
          isCreating={true}
        />
      )}
      
      {/* Display selected Google reviews if available */}
      {negocios.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Opiniones destacadas</h3>
          <SelectedGoogleReviews 
            reviews={negocios[0].cachedReviews} 
            selectedReviewIds={negocios[0].selectedGoogleReviews} 
          />
        </div>
      )}
    </div>
  );
}