import { useState, useRef, useEffect } from 'react';
import { negocio } from '@/app/shared/interfaces';
import { updateNegocio, deleteNegocio } from '@/app/shared/firebase';
import { Timestamp } from 'firebase/firestore';
import FieldEditor from './fieldEditor';

// Define column types with their display names
const columns = [
  { id: 'form', name: 'Formulario' },  // New first stage
  { id: 'propuesta', name: 'Propuesta' },
  { id: 'evaluación', name: 'Evaluación' },
  { id: 'comercialización', name: 'Comercialización' },
  { id: 'congeladora', name: 'Congeladora' },
  { id: 'cerrada', name: 'Cerrada' },
  { id: 'cancelada', name: 'Cancelada' }
] as const;

// Define dormant periods
const dormantPeriods = [
  { label: "1 día", value: 1 },
  { label: "2 días", value: 2 },
  { label: "3 días", value: 3 },
  { label: "5 días", value: 5 },
  { label: "7 días", value: 7 },
  { label: "2 semanas", value: 14 },
  { label: "1 mes", value: 30 },
  { label: "2 meses", value: 60 },
  { label: "6 meses", value: 180 }
];

type ColumnType = typeof columns[number]['id'];

interface PipelineProps {
  negocios: negocio[];
  onNegocioUpdate: () => void;
}

export default function Pipeline({ negocios, onNegocioUpdate }: PipelineProps) {
  const [editingNegocio, setEditingNegocio] = useState<negocio | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dormantMenuOpen, setDormantMenuOpen] = useState<string | null>(null);
  const dormantMenuRef = useRef<HTMLDivElement>(null);

  // Group negocios by status
  const negociosByColumn = columns.reduce((acc, column) => {
    acc[column.id] = negocios.filter(n => n.estatus === column.id);
    return acc;
  }, {} as Record<ColumnType, negocio[]>);

  // Handler to toggle dormant status
  const handleSetDormant = async (negocioId: string, days: number) => {
    try {
      // If days is 0, we're waking up the lead
      if (days === 0) {
        await updateNegocio(negocioId, {
          dormido: false,
          dormidoHasta: null
        });
      } else {
        // Calculate dormidoHasta date
        const now = new Date();
        const dormantUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        await updateNegocio(negocioId, {
          dormido: true,
          dormidoHasta: Timestamp.fromDate(dormantUntil)
        });
      }
      setDormantMenuOpen(null);
      onNegocioUpdate();
    } catch (error) {
      console.error("Error updating dormant status:", error);
      alert("Error al actualizar el estado dormido");
    }
  };

  // Close dormant menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dormantMenuRef.current && !dormantMenuRef.current.contains(e.target as Node)) {
        setDormantMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (negocioId: string, newStatus: ColumnType, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await updateNegocio(negocioId, {
        estatus: newStatus
      });
      onNegocioUpdate();
    } catch (error) {
      console.error("Error updating negocio status:", error);
    }
  };

  const handleEdit = (negocio: negocio, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingNegocio(negocio);
  };

  const handleDelete = async (negocioId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!negocioId) return;
    
    try {
      if (confirm('¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer.')) {
        await deleteNegocio(negocioId);
        onNegocioUpdate();
      }
    } catch (error) {
      console.error("Error deleting negocio:", error);
      alert("Error al eliminar el lead");
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (negocioId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === negocioId ? null : negocioId);
  };

  const handleEditClose = () => {
    setEditingNegocio(null);
    onNegocioUpdate();
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "$0";
    
    // Format for millions (MDP)
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `$${millions.toFixed(1).replace(/\.0$/, '')} MDP`;
    }
    
    // Format for thousands (K)
    if (amount >= 1000) {
      const thousands = amount / 1000;
      return `$${thousands.toFixed(1).replace(/\.0$/, '')}K`;
    }
    
    // Format for smaller amounts
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date from Timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('es-MX');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Function to format property type for display
  const formatPropertyType = (type: string): string => {
    if (type === 'departamento') return 'Depa.';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Status styling
  const statusColors = {
    form: 'bg-purple-400',       // New color for form stage
    propuesta: 'bg-yellow-400',
    evaluación: 'bg-blue-400',
    comercialización: 'bg-indigo-400',
    congeladora: 'bg-gray-400',
    cerrada: 'bg-green-400',
    cancelada: 'bg-red-400'
  };

  // Add a function to calculate days until dormant status ends
  const getDormantDaysRemaining = (lead: negocio) => {
    if (!lead.dormido || !lead.dormidoHasta) return null;
    
    const now = new Date();
    const dormantUntil = lead.dormidoHasta.toDate();
    
    // If dormant period is in the past, return 0
    if (dormantUntil <= now) return 0;
    
    // Calculate days remaining
    const diffTime = dormantUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format dormant status text
  const formatDormantStatus = (lead: negocio) => {
    const daysRemaining = getDormantDaysRemaining(lead);
    if (daysRemaining === null) return null;
    
    if (daysRemaining === 0) {
      return "Hasta hoy";
    } else if (daysRemaining === 1) {
      return "Hasta mañana";
    } else {
      return `Hasta dentro de ${daysRemaining} días`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex h-full">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[250px] flex flex-col border-r last:border-r-0 border-gray-200 bg-gray-50/80">
            {/* Column header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[column.id]}`}></div>
                  <span className="font-medium text-sm text-gray-900">{column.name}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{negociosByColumn[column.id]?.length || 0}</span>
              </div>
            </div>
            
            {/* Column content */}
            <div className="flex-1 overflow-y-auto p-2">
              {negociosByColumn[column.id]?.map((negocio) => (
                <div 
                  key={negocio.id} 
                  className={`bg-white border border-gray-200 rounded-lg mb-2 cursor-pointer hover:shadow-sm transition-all ${
                    negocio.dormido ? 'border-l-2 border-l-amber-400' : ''
                  }`}
                  onClick={() => setEditingNegocio(negocio)}
                >
                  {/* Ultra-compact card layout */}
                  <div className="p-1.5">
                    {/* Property info - super compact single line */}
                    <div className="flex items-center text-xs">
                      <span className="font-medium text-gray-800 whitespace-nowrap">
                        {formatPropertyType(negocio.propertyType)}
                      </span>
                      <span className="text-gray-500 mx-0.5">•</span>
                      <span className="text-gray-500">
                        {negocio.transactionType === 'renta' ? 'Renta' : 'Venta'}
                      </span>
                      <span className="text-gray-500 mx-0.5">•</span>
                      <span className="text-violet-700 font-semibold">
                        {formatCurrency(negocio.price)}
                      </span>
                      {negocio.condoName && (
                        <>
                          <span className="text-gray-500 mx-0.5">•</span>
                          <span className="text-gray-500 truncate max-w-[80px]" title={negocio.condoName}>
                            {negocio.condoName}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Client data section */}
                    {(negocio.nombreCompleto || negocio.telefono || negocio.correo) && (
                      <div className="bg-blue-50 rounded-md p-1.5 mt-1 text-xs">
                        {negocio.nombreCompleto && (
                          <p className="text-blue-800 font-medium">{negocio.nombreCompleto}</p>
                        )}
                        <div className="flex flex-wrap gap-x-2">
                          {negocio.telefono && (
                            <p className="text-blue-800">{negocio.telefono}</p>
                          )}
                          {negocio.correo && (
                            <p className="text-blue-800 truncate max-w-[140px]">{negocio.correo}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom row with dormant status and actions */}
                    <div className="mt-1 flex justify-between items-center">
                      {/* Dormant status */}
                      <div className="flex items-center">
                        {negocio.dormido && (
                          <span className="text-xs text-amber-600 font-medium">
                            {formatDormantStatus(negocio)}
                          </span>
                        )}
                      </div>
                      
                      {/* Dormant toggle button - UPDATED: smaller, thinner */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // If already dormant, wake up immediately
                            if (negocio.dormido) {
                              handleSetDormant(negocio.id!, 0);
                            } else {
                              // Otherwise open menu to select dormant period
                              // Fix: Ensure we only pass string or null, not undefined
                              setDormantMenuOpen(dormantMenuOpen === negocio.id ? null : negocio.id || null);
                            }
                          }}
                          className={`text-xs px-2 py-0.5 rounded ${
                            negocio.dormido 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } text-[10px] leading-none min-h-[20px]`}
                        >
                          {negocio.dormido ? 'Despertar' : 'Dormir'}
                        </button>
                        
                        {/* Dormant periods dropdown */}
                        {dormantMenuOpen === negocio.id && !negocio.dormido && (
                          <div 
                            ref={dormantMenuRef} 
                            className="absolute right-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1"
                            style={{width: '120px'}}
                          >
                            {dormantPeriods.map((period) => (
                              <button
                                key={period.value}
                                className="w-full text-left text-xs px-3 py-1 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Fix: Ensure negocio.id exists before passing it
                                  if (negocio.id) {
                                    handleSetDormant(negocio.id, period.value);
                                  }
                                }}
                              >
                                {period.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {negociosByColumn[column.id]?.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm italic">
                  No hay leads en esta columna
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Field Editor Modal */}
      {editingNegocio && (
        <FieldEditor 
          negocio={editingNegocio} 
          onClose={handleEditClose} 
        />
      )}
    </div>
  );
}
