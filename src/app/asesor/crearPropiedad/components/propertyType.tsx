"use client";

import { useState, useEffect } from 'react';
import { PropertyData } from '@/app/shared/interfaces';
import { motion } from 'framer-motion';
import { getZones, getCondosByZone } from '@/app/shared/firebase';
import { ZoneData, CondoData } from '@/app/shared/interfaces';

interface PropertyTypeProps {
  data: PropertyData;
  onChange: (newData: Partial<PropertyData>) => void;
  onError?: (error: string | null) => void; // Add this prop
}

interface ValidationErrors {
  price?: string;
  zone?: string;
  condo?: string;
  maintenance?: string;
  services?: string;
}

export default function PropertyType({ data, onChange, onError }: PropertyTypeProps) {
  // Add helper function for boolean values
  const getBooleanValue = (value: boolean | undefined): boolean => {
    return value ?? false;
  };

  // State for zones and condos
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [condos, setCondos] = useState<CondoData[]>([]);
  const [loading, setLoading] = useState({
    zones: true,
    condos: false
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Define property types with images
  const propertyTypes = [
    { id: 'casa', label: 'Casa', icon: '🏠' },
    { id: 'departamento', label: 'Departamento', icon: '🏢' },
    // { id: 'terreno', label: 'Terreno', icon: '🏞️' },
    // { id: 'local', label: 'Local Comercial', icon: '🏪' },
    // { id: 'oficina', label: 'Oficina', icon: '🏢' },
    // { id: 'bodega', label: 'Bodega', icon: '🏭' },
  ];

  // Transaction types with explicit type for type safety
  const transactionTypes: {id: 'renta' | 'venta' | 'ventaRenta', label: string, icon: string}[] = [
    { id: 'renta', label: 'Renta', icon: '🔑' },
    { id: 'venta', label: 'Venta', icon: '💰' },
    { id: 'ventaRenta', label: 'Venta y Renta', icon: '💰🔑' },
  ];

  // Fetch zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(prev => ({ ...prev, zones: true }));
        const fetchedZones = await getZones();
        setZones(fetchedZones);
        setError(null);
      } catch (err) {
        console.error('Error fetching zones:', err);
        setError('No se pudieron cargar las zonas. Por favor intenta de nuevo.');
      } finally {
        setLoading(prev => ({ ...prev, zones: false }));
      }
    };

    fetchZones();
  }, []);

  // Fetch condos when zone changes
  useEffect(() => {
    const fetchCondos = async () => {
      if (!data.zone) {
        setCondos([]);
        return;
      }
      
      try {
        setLoading(prev => ({ ...prev, condos: true }));
        const fetchedCondos = await getCondosByZone(data.zone);
        setCondos(fetchedCondos);
        setError(null);
      } catch (err) {
        console.error('Error fetching condominiums:', err);
        setError('No se pudieron cargar los condominios. Por favor intenta de nuevo.');
      } finally {
        setLoading(prev => ({ ...prev, condos: false }));
      }
    };

    fetchCondos();
  }, [data.zone]);

  // Handle zone change and reset condo selection
  const handleZoneChange = (zoneId: string) => {
    onChange({ 
      zone: zoneId,
      condo: '' // Reset condo when zone changes
    });
  };

  // Create type-safe onChange handler for transactionType
  const handleTransactionTypeChange = (type: 'renta' | 'venta' | 'ventaRenta') => {
    const updates: Partial<PropertyData> = { 
      transactionType: type 
    };
    
    // If switching from rental to sale, reset rental-specific fields
    if (type === 'venta') {
      updates.furnished = false;
      updates.petsAllowed = false;
      updates.servicesIncluded = false;
      updates.includesWifi = false;
      updates.includesWater = false;
      updates.includesGas = false;
      updates.includesElectricity = false;
      updates.maintenanceIncluded = false;
      updates.maintenanceCost = 0;
      updates.depositoRenta = 0;
      updates.contratoMinimo = 0;
    }
    
    // If switching to rental type, set default values
    if (type === 'renta' || type === 'ventaRenta') {
      updates.furnished = false;
      updates.petsAllowed = false;
      updates.servicesIncluded = false;
      updates.depositoRenta = 1;
      updates.contratoMinimo = 12;
    }
    
    onChange(updates);
  };

  const validateRentalRequirements = (): boolean => {
    // Check maintenance cost if maintenance is not included
    if (!data.maintenanceIncluded && (!data.maintenanceCost || data.maintenanceCost <= 0)) {
      onError?.('Si el mantenimiento no está incluido, debe especificar un costo mayor a cero');
      return false;
    }

    // Check if at least one service is selected when services are included
    if (data.servicesIncluded && 
        !data.includesWater && 
        !data.includesElectricity && 
        !data.includesGas && 
        !data.includesWifi) {
      onError?.('Si los servicios están incluidos, debe seleccionar al menos uno');
      return false;
    }

    onError?.(null);
    return true;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Price validation
    if (!data.price || data.price === 0) {
      errors.price = 'El precio es requerido';
    } else if (data.price < 1000) {
      errors.price = 'El precio debe ser mayor a $1,000';
    }

    // Location validation
    if (!data.zone) {
      errors.zone = 'La zona es requerida';
    }
    if (!data.condo && data.zone) {
      errors.condo = 'El condominio es requerido';
    }

    // Rental specific validations
    if (data.transactionType === 'renta' || data.transactionType === 'ventaRenta') {
      if (!data.maintenanceIncluded && (!data.maintenanceCost || data.maintenanceCost <= 0)) {
        errors.maintenance = 'Debe especificar un costo de mantenimiento mayor a 0';
      }

      if (data.servicesIncluded && 
          !data.includesWater && 
          !data.includesElectricity && 
          !data.includesGas && 
          !data.includesWifi) {
        errors.services = 'Debe seleccionar al menos un servicio incluido';
      }
    }

    setValidationErrors(errors);
    const errorMessages = Object.values(errors);
    onError?.(errorMessages.length > 0 ? errorMessages[0] : null);
    return errorMessages.length === 0;
  };

  // Add validation on mount and data changes
  useEffect(() => {
    validateForm();
  }, [data]); // This will run when the component mounts and when data changes

  // Add validation on field change
  useEffect(() => {
    validateField('price');
  }, [data.price]);

  useEffect(() => {
    validateField('zone');
  }, [data.zone]);

  useEffect(() => {
    validateField('condo');
  }, [data.condo]);

  useEffect(() => {
    if (data.transactionType === 'renta' || data.transactionType === 'ventaRenta') {
      if (!data.maintenanceIncluded) {
        validateField('maintenance');
      }
      if (data.servicesIncluded) {
        validateField('services');
      }
    }
  }, [
    data.maintenanceIncluded,
    data.maintenanceCost,
    data.servicesIncluded,
    data.includesWater,
    data.includesElectricity,
    data.includesGas,
    data.includesWifi,
    data.transactionType
  ]);

  // Modifica la función validateField para no enviar errores globales al componente padre
  const validateField = (field: keyof ValidationErrors) => {
    const errors = { ...validationErrors };

    switch (field) {
      case 'price':
        if (!data.price || data.price === 0) {
          errors.price = 'El precio es requerido';
        } else if (data.price < 1000) {
          errors.price = 'El precio debe ser mayor a $1,000';
        } else {
          delete errors.price;
        }
        break;

      case 'zone':
        if (!data.zone) {
          errors.zone = 'La zona es requerida';
        } else {
          delete errors.zone;
        }
        break;

      case 'condo':
        if (!data.condo && data.zone) {
          errors.condo = 'El condominio es requerido';
        } else {
          delete errors.condo;
        }
        break;

      case 'maintenance':
        if (!data.maintenanceIncluded && (!data.maintenanceCost || data.maintenanceCost <= 0)) {
          errors.maintenance = 'Debe especificar un costo de mantenimiento mayor a 0';
        } else {
          delete errors.maintenance;
        }
        break;

      case 'services':
        if (data.servicesIncluded && 
            !data.includesWater && 
            !data.includesElectricity && 
            !data.includesGas && 
            !data.includesWifi) {
          errors.services = 'Debe seleccionar al menos un servicio incluido';
        } else {
          delete errors.services;
        }
        break;
    }

    setValidationErrors(errors);
    
    // En lugar de enviar un mensaje de error global al componente padre,
    // solo informamos si hay errores (para deshabilitar el botón)
    const hasErrors = Object.keys(errors).length > 0;
    onError?.(hasErrors ? 'has-errors' : null);
    
    return !hasErrors;
  };

  // Mejora la validación para evitar mensajes globales
  useEffect(() => {
    const timer = setTimeout(() => {
      const errors: ValidationErrors = {};

      // Validate all fields...
      
      setValidationErrors(errors);
      
      // Solo enviamos un indicador de que hay errores, no un mensaje específico
      const hasErrors = Object.keys(errors).length > 0;
      onError?.(hasErrors ? 'has-errors' : null);
      
    }, 300);

    return () => clearTimeout(timer);
  }, [data, onError]);

  // Modify the handlers to validate immediately
  const handlePriceChange = (value: number) => {
    onChange({ price: value });
    validateField('price');
  };

  const handleMaintenanceChange = (isIncluded: boolean) => {
    onChange({ maintenanceIncluded: isIncluded });
    if (!isIncluded) {
      validateField('maintenance');
    }
  };

  const handleMaintenanceCostChange = (value: number) => {
    onChange({ maintenanceCost: value });
    validateField('maintenance');
  };

  const handleServicesChange = (isIncluded: boolean) => {
    onChange({ 
      servicesIncluded: isIncluded,
      // Reset services if disabling
      ...(isIncluded ? {} : {
        includesWater: false,
        includesElectricity: false,
        includesGas: false,
        includesWifi: false
      })
    });
    if (isIncluded) {
      validateField('services');
    }
  };

  const handleCondoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCondo = condos.find(condo => condo.id === e.target.value);
    onChange({ 
      condo: e.target.value,
      condoName: selectedCondo?.name || ''
    });
    setValidationErrors({ ...validationErrors, condo: undefined });
  };

  // Improve validation on mount and data changes
  useEffect(() => {
    // Add a small delay to avoid premature validation when component first mounts
    const timer = setTimeout(() => {
      const errors: ValidationErrors = {};

      // Price validation
      if (!data.price || data.price === 0) {
        errors.price = 'El precio es requerido';
      } else if (data.price < 1000) {
        errors.price = 'El precio debe ser mayor a $1,000';
      }

      // Location validation
      if (!data.zone) {
        errors.zone = 'La zona es requerida';
      }
      
      // Only validate condo if zone is selected
      if (!data.condo && data.zone) {
        errors.condo = 'El condominio es requerido';
      }

      // Rental specific validations
      if (data.transactionType === 'renta' || data.transactionType === 'ventaRenta') {
        if (!data.maintenanceIncluded && (!data.maintenanceCost || data.maintenanceCost <= 0)) {
          errors.maintenance = 'Debe especificar un costo de mantenimiento mayor a 0';
        }

        if (data.servicesIncluded && 
            !data.includesWater && 
            !data.includesElectricity && 
            !data.includesGas && 
            !data.includesWifi) {
          errors.services = 'Debe seleccionar al menos un servicio incluido';
        }
      }

      setValidationErrors(errors);
      const errorMessages = Object.values(errors);
      
      // Only send error to parent if we have errors and this isn't initial load
      if (errorMessages.length > 0) {
        onError?.(errorMessages[0]);
      } else {
        onError?.(null); // Clear error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [data, onError]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium">¿Qué tipo de propiedad deseas publicar?</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Property Type Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Tipo de propiedad</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {propertyTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`cursor-pointer p-4 rounded-lg border-2 ${
                data.propertyType === type.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => onChange({ propertyType: type.id })}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-4xl">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Transaction Type Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Operación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transactionTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`cursor-pointer p-4 rounded-lg border-2 ${
                data.transactionType === type.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleTransactionTypeChange(type.id)}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-4xl">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Price Input */}
      <div>
        <h3 className="text-lg font-medium mb-4">Precio</h3>
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              value={data.price || ''}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className={`py-3 pl-8 pr-12 block w-full rounded-lg border ${
                validationErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-violet-500 focus:border-violet-500'
              }`}
              placeholder="Ingresa el precio"
              min="1000"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500">MXN</span>
            </div>
          </div>
          {validationErrors.price && (
            <p className="text-sm text-red-600">{validationErrors.price}</p>
          )}
        </div>
      </div>
      
      {/* Location Basic Info */}
      <div>
        <h3 className="text-lg font-medium mb-4">Ubicación</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona
            </label>
            <div className="relative">
              <select
                value={data.zone || ''}
                onChange={(e) => {
                  handleZoneChange(e.target.value);
                  setValidationErrors({ ...validationErrors, zone: undefined });
                }}
                className={`py-3 px-4 block w-full rounded-lg border ${
                  validationErrors.zone ? 'border-red-500' : 'border-gray-300'
                } focus:ring-violet-500 focus:border-violet-500 pr-10`}
                disabled={loading.zones}
              >
                <option value="">Selecciona una zona</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
              {validationErrors.zone && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.zone}</p>
              )}
              {loading.zones && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fraccionamiento o Conjunto
            </label>
            <div className="relative">
              <select
                value={data.condo || ''}
                onChange={handleCondoChange}
                className={`py-3 px-4 block w-full rounded-lg border ${
                  validationErrors.condo ? 'border-red-500' : 'border-gray-300'
                } focus:ring-violet-500 focus:border-violet-500 pr-10`}
                disabled={!data.zone || loading.condos}
              >
                <option value="">Selecciona un fraccionamiento</option>
                {condos.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.name}
                  </option>
                ))}
              </select>
              {validationErrors.condo && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.condo}</p>
              )}
              {loading.condos && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {!data.zone ? 'Primero selecciona una zona' : ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Rental Requirements Section */}
      {(data.transactionType === 'renta' || data.transactionType === 'ventaRenta') && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-4">Requisitos de Renta</h3>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Maintenance */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  id="maintenanceIncluded"
                  type="checkbox"
                  checked={getBooleanValue(data.maintenanceIncluded)}
                  onChange={(e) => handleMaintenanceChange(e.target.checked)}
                  className="h-4 w-4 text-violet-600 rounded"
                />
                <label htmlFor="maintenanceIncluded" className="ml-2 text-sm text-gray-700">
                  Mantenimiento incluido
                </label>
              </div>
              
              {!data.maintenanceIncluded && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de mantenimiento (mensual)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={data.maintenanceCost || 0}
                      onChange={(e) => handleMaintenanceCostChange(parseInt(e.target.value) || 0)}
                      className="pl-8 py-3 px-4 block w-full rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Services Included */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  id="servicesIncluded"
                  type="checkbox"
                  checked={getBooleanValue(data.servicesIncluded)}
                  onChange={(e) => handleServicesChange(e.target.checked)}
                  className="h-4 w-4 text-violet-600 rounded"
                />
                <label htmlFor="servicesIncluded" className="ml-2 text-sm text-gray-700">
                  Servicios incluidos en el precio
                </label>
              </div>
              
              {getBooleanValue(data.servicesIncluded) && (
                <div className="mt-3 ml-6 grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      id="includesWifi"
                      type="checkbox"
                      checked={getBooleanValue(data.includesWifi)}
                      onChange={(e) => onChange({ includesWifi: e.target.checked })}
                      className="h-4 w-4 text-violet-600 rounded"
                    />
                    <label htmlFor="includesWifi" className="ml-2 text-sm text-gray-700">
                      Internet/WiFi
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="includesWater"
                      type="checkbox"
                      checked={getBooleanValue(data.includesWater)}
                      onChange={(e) => onChange({ includesWater: e.target.checked })}
                      className="h-4 w-4 text-violet-600 rounded"
                    />
                    <label htmlFor="includesWater" className="ml-2 text-sm text-gray-700">
                      Agua
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="includesGas"
                      type="checkbox"
                      checked={getBooleanValue(data.includesGas)}
                      onChange={(e) => onChange({ includesGas: e.target.checked })}
                      className="h-4 w-4 text-violet-600 rounded"
                    />
                    <label htmlFor="includesGas" className="ml-2 text-sm text-gray-700">
                      Gas
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="includesElectricity"
                      type="checkbox"
                      checked={getBooleanValue(data.includesElectricity)}
                      onChange={(e) => onChange({ includesElectricity: e.target.checked })}
                      className="h-4 w-4 text-violet-600 rounded"
                    />
                    <label htmlFor="includesElectricity" className="ml-2 text-sm text-gray-700">
                      Electricidad
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Deposit and Contract */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depósito (número de mensualidades)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={data.depositoRenta || 1}
                  onChange={(e) => onChange({ depositoRenta: parseFloat(e.target.value) || 1 })}
                  className="py-3 px-4 block w-full rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrato mínimo (meses)
                </label>
                <input
                  type="number"
                  min="1"
                  value={data.contratoMinimo || 12}
                  onChange={(e) => onChange({ contratoMinimo: parseInt(e.target.value) || 12 })}
                  className="py-3 px-4 block w-full rounded-lg border border-gray-300 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            {/* Error messages */}
            {(validationErrors.maintenance || validationErrors.services) && (
              <div className="space-y-2">
                {validationErrors.maintenance && (
                  <p className="text-sm text-red-600">{validationErrors.maintenance}</p>
                )}
                {validationErrors.services && (
                  <p className="text-sm text-red-600">{validationErrors.services}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}