import { useState, useEffect, useRef } from 'react';
import { negocio, PropertyData } from '@/app/shared/interfaces';
import { doc, updateDoc, Timestamp, addDoc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db, createNegocio, updateNegocio, deleteNegocio } from '@/app/shared/firebase';

interface FieldEditorProps {
  negocio: negocio;
  onClose: () => void;
  isCreating?: boolean;
}

// Reusable form field components with proper TypeScript typing
const FormField = ({ 
  label, 
  children, 
  className = '' 
}: { 
  label: string; 
  children: React.ReactNode; 
  className?: string 
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const ReadOnlyField = ({ 
  label, 
  value 
}: { 
  label: string; 
  value: React.ReactNode 
}) => (
  <div className="block w-full py-2 px-3 bg-gray-100 rounded-md text-gray-700 text-sm border border-gray-300">
    {value}
  </div>
);

export default function FieldEditor({ negocio, onClose, isCreating = false }: FieldEditorProps) {
  const [formData, setFormData] = useState<Partial<negocio>>({
    propiedadId: negocio.propiedadId,
    propertyType: negocio.propertyType,
    condoName: negocio.condoName,
    transactionType: negocio.transactionType,
    price: negocio.price,
    comision: negocio.comision,
    asesorAliado: negocio.asesorAliado || '',
    porcentajePizo: negocio.porcentajePizo || 50,
    estatus: negocio.estatus,
    notas: negocio.notas || '',
    origenTexto: negocio.origenTexto || '',
    origenUrl: negocio.origenUrl || '',
    asesor: negocio.asesor || '',
    nombreCompleto: negocio.nombreCompleto || '',
    telefono: negocio.telefono || '',
    correo: negocio.correo || '',
    dormido: negocio.dormido || false,
    dormidoHasta: negocio.dormidoHasta || null
  });

  // State for property search and related functionality
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const availableAdvisors = ['Guille', 'Andres', 'Adri'];

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch properties for typeahead
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        setProperties(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PropertyData[]);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  // Handle search term changes for property typeahead
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties([]);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredProperties(
      properties.filter(property => 
        property.id?.toLowerCase().includes(lowerSearchTerm) ||
        property.condoName?.toLowerCase().includes(lowerSearchTerm) ||
        property.propertyCondoNumber?.toLowerCase().includes(lowerSearchTerm)
      ).slice(0, 10)
    );
  }, [searchTerm, properties]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch property by ID if needed
  useEffect(() => {
    if (!isCreating && formData.propiedadId && !selectedProperty) {
      const fetchPropertyById = async () => {
        try {
          const propertyDoc = await getDocs(
            query(collection(db, "properties"), where("id", "==", formData.propiedadId))
          );
          
          if (!propertyDoc.empty) {
            setSelectedProperty({ 
              id: propertyDoc.docs[0].id, 
              ...propertyDoc.docs[0].data() 
            } as PropertyData);
          }
        } catch (error) {
          console.error("Error fetching property by ID:", error);
        }
      };
      fetchPropertyById();
    }
  }, [formData.propiedadId, isCreating, selectedProperty]);

  const handleSelectProperty = (property: PropertyData) => {
    setSelectedProperty(property);
    setFormData(prev => ({
      ...prev,
      propiedadId: property.id || '',
      propertyType: property.propertyType,
      condoName: property.condoName,
      transactionType: property.transactionType,
      price: property.price,
      comision: property.comision || prev.comision || 5,
      asesorAliado: property.asesorAliado || prev.asesorAliado || '',
      porcentajePizo: property.porcentajePizo || prev.porcentajePizo || 50 // Ensure a default value
    }));
    setSearchTerm(`${property.condoName} - ${property.propertyType}`);
    setIsDropdownOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' && value !== '' 
          ? Number(value) 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Define a type that properly allows all possible value types, including null
      type CleanedFormDataType = {
        [K in keyof negocio]?: negocio[K] | null;
      };
      
      // Use the correctly typed object for temporary storage
      const tempFormData: CleanedFormDataType = {};
      
      // Copy all non-undefined values to tempFormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          // Use type assertion to bypass TypeScript's type checking
          // This is safe because we're ensuring proper types through our type definition
          tempFormData[key as keyof negocio] = value as any;
        }
      });
      
      // Ensure porcentajePizo has a default value
      if (tempFormData.porcentajePizo === undefined) {
        tempFormData.porcentajePizo = 50;
      }
      
      // For the final data sent to the API, use the correct Partial<negocio> type
      const cleanedFormData: Partial<negocio> = {};
      
      // Copy values from tempFormData to cleanedFormData, handling nulls appropriately
      Object.entries(tempFormData).forEach(([key, value]) => {
        // Skip id if it's null
        if (key === 'id' && value === null) {
          return;
        }
        
        // For other fields, include all values (including null)
        cleanedFormData[key as keyof negocio] = value as any;
      });
      
      if (isCreating) {
        await createNegocio(cleanedFormData);
        console.log("New negocio created successfully");
      } else {
        if (!negocio.id) {
          setError('ID de negocio no encontrado');
          setSaving(false);
          return;
        }
        
        await updateNegocio(negocio.id, cleanedFormData);
      }
      
      onClose();
    } catch (err) {
      setError('Error al guardar los cambios');
      console.error('Error saving negocio:', err);
    } finally {
      setSaving(false);
    }
  };

  // Add a function to handle delete
  const handleDelete = async () => {
    if (!negocio.id) return;
    
    try {
      if (confirm('¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer.')) {
        setSaving(true);
        await deleteNegocio(negocio.id);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting negocio:", error);
      setError('Error al eliminar el lead');
      setSaving(false);
    }
  };

  // Add states for property updating
  const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);
  const [updatePropertyError, setUpdatePropertyError] = useState('');
  const [updatePropertySuccess, setUpdatePropertySuccess] = useState(false);

  // Add a new function to fetch and update property data
  const handleUpdatePropertyData = async () => {
    if (!formData.propiedadId) {
      setUpdatePropertyError('No hay ID de propiedad para actualizar');
      return;
    }

    try {
      setIsUpdatingProperty(true);
      setUpdatePropertyError('');
      setUpdatePropertySuccess(false);

      // Get property from Firestore
      const propertyDoc = await getDoc(doc(db, "properties", formData.propiedadId));
      
      if (!propertyDoc.exists()) {
        setUpdatePropertyError('La propiedad no fue encontrada');
        return;
      }

      const propertyData = propertyDoc.data() as PropertyData;

      // Update form data with property values
      setFormData(prev => ({
        ...prev,
        propertyType: propertyData.propertyType,
        condoName: propertyData.condoName || '',
        transactionType: propertyData.transactionType as 'renta' | 'venta' | 'ventaRenta',
        price: propertyData.price,
        comision: propertyData.comision || prev.comision || 5,
        asesorAliado: propertyData.asesorAliado || prev.asesorAliado || ''
      }));

      // Show success message
      setUpdatePropertySuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdatePropertySuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error fetching property data:', error);
      setUpdatePropertyError('Error al actualizar datos de la propiedad');
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  // Property info renderer - consolidates duplicate property info rendering
  const renderPropertyInfo = () => {
    if (!formData.propiedadId) return null;
    
    interface PropertyField {
      label: string;
      value: string | number | React.ReactNode;
      colSpan?: number;
      isBold?: boolean;
    }
    
    const propertyFields: PropertyField[] = [
      { label: 'ID', value: formData.propiedadId || 'No seleccionado' },
      { label: 'Tipo', value: formData.propertyType || 'No seleccionado' },
      { label: 'Condominio', value: formData.condoName || 'No seleccionado' },
      { label: 'Transacción', value: formData.transactionType === 'renta' ? 'Renta' : 
                              formData.transactionType === 'venta' ? 'Venta' : 
                              formData.transactionType === 'ventaRenta' ? 'Venta y Renta' : 'No seleccionado' },
      { label: 'Precio', value: formData.price ? formatCurrency(formData.price) : 'No seleccionado', colSpan: 2, isBold: true },
      { label: 'Comisión', value: `${formData.comision || 5}%` },
      { label: 'Asesor Aliado', value: formData.asesorAliado || 'No especificado' },
      { label: 'Porcentaje para Pizo', value: `${formData.porcentajePizo || 50}%`, colSpan: 2 }
    ];

    return (
      <div className="mb-4 bg-indigo-50 p-3 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-indigo-700">Propiedad seleccionada:</h3>
          
          {/* Add update button */}
          <button
            type="button"
            onClick={handleUpdatePropertyData}
            disabled={isUpdatingProperty}
            className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
          >
            {isUpdatingProperty ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar datos</span>
              </>
            )}
          </button>
        </div>
        
        {/* Error message for property update */}
        {updatePropertyError && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 p-1 rounded">
            {updatePropertyError}
          </div>
        )}
        
        {/* Success message for property update */}
        {updatePropertySuccess && (
          <div className="mb-2 text-xs text-green-600 bg-green-50 p-1 rounded">
            Datos actualizados correctamente
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          {propertyFields.map((field, index) => (
            <div key={index} className={field.colSpan === 2 ? "col-span-2" : ""}>
              <span className="text-gray-500">{field.label}: </span>
              <span className={`text-gray-800 ${field.isBold ? "font-semibold" : ""}`}>{field.value}</span>
            </div>
          ))}
        </div>
        
        {/* Hidden inputs for form submission */}
        <input type="hidden" name="propiedadId" value={formData.propiedadId || ''} />
        <input type="hidden" name="propertyType" value={formData.propertyType || ''} />
        <input type="hidden" name="condoName" value={formData.condoName || ''} />
        <input type="hidden" name="transactionType" value={formData.transactionType || ''} />
        <input type="hidden" name="price" value={formData.price?.toString() || '0'} />
        <input type="hidden" name="comision" value={formData.comision?.toString() || '5'} />
        <input type="hidden" name="asesorAliado" value={formData.asesorAliado || ''} />
        <input type="hidden" name="porcentajePizo" value={formData.porcentajePizo?.toString() || '50'} />
      </div>
    );
  };

  // Property search dropdown renderer - Modified to always show regardless of edit/create mode
  const renderPropertySearch = () => {
    // Remove the condition that was hiding the search when editing
    // if (selectedProperty && !isCreating) return null;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {selectedProperty ? "Cambiar Propiedad" : "Buscar Propiedad"}
        </label>
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onClick={() => setIsDropdownOpen(true)}
            placeholder="Buscar por ID, nombre de condominio o número"
            className="input1 pr-10"
          />
          
          {isDropdownOpen && filteredProperties.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectProperty(property)}
                >
                  <div>
                    <div className="font-medium">{property.condoName}</div>
                    <div className="text-xs text-gray-500">
                      {property.propertyType} - ID: {property.id}
                    </div>
                  </div>
                  <div className="text-indigo-600 font-medium">
                    {formatCurrency(property.price)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* More compact header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-gray-50">
          <h2 className="text-base font-medium">{isCreating ? "Crear Nuevo Lead" : "Editar Lead"}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          {error && (
            <div className="mb-3 bg-red-50 text-red-600 p-2 rounded-md text-sm">{error}</div>
          )}
          
          {/* Always show property search, regardless of edit/create mode */}
          {renderPropertySearch()}
          
          {/* Show property info if a property is selected */}
          {formData.propiedadId && renderPropertyInfo()}
          
          {/* Datos del cliente section - more compact */}
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">Datos del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Nombre Completo">
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto || ''}
                  onChange={handleChange}
                  className="input1"
                />
              </FormField>
              
              <FormField label="Teléfono">
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono || ''}
                  onChange={handleChange}
                  className="input1"
                />
              </FormField>
              
              <FormField label="Correo Electrónico" className="md:col-span-2">
                <input
                  type="email"
                  name="correo"
                  value={formData.correo || ''}
                  onChange={handleChange}
                  className="input1"
                />
              </FormField>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Estado">
              <select
                name="estatus"
                value={formData.estatus || ''}
                onChange={handleChange}
                className="input1"
              >
                {["form", "propuesta", "evaluación", "comercialización", "congeladora", "cerrada", "cancelada"].map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </FormField>
            
            <FormField label="Asesor">
              <select
                name="asesor"
                value={formData.asesor || ''}
                onChange={handleChange}
                className="input1"
              >
                <option value="">Selecciona un asesor</option>
                {availableAdvisors.map(advisor => (
                  <option key={advisor} value={advisor}>{advisor}</option>
                ))}
              </select>
            </FormField>
          </div>
          
          <div className="mt-3">
            <FormField label="Origen (Texto)">
              <input
                type="text"
                name="origenTexto"
                value={formData.origenTexto || ''}
                onChange={handleChange}
                className="input1"
              />
            </FormField>
          </div>
          
          <FormField label="Notas" className="mt-3">
            <textarea
              name="notas"
              rows={2}
              value={formData.notas || ''}
              onChange={handleChange}
              className="textArea1"
            />
          </FormField>
          
          {/* Compact buttons row at bottom */}
          <div className="mt-3 flex justify-between pt-2">
            {/* Delete button - only show when editing, not when creating */}
            {!isCreating && negocio.id && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-medium"
              >
                Eliminar Lead
              </button>
            )}
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : isCreating ? 'Crear Lead' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
