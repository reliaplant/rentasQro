"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getProperty, updateProperty, addProperty, getAllAdvisors, checkIfUserIsAdmin } from '@/app/shared/firebase';
import { PropertyData } from '@/app/shared/interfaces';
import { Timestamp } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// Dynamic imports with no SSR
const PropertyType = dynamic(() => import('../../asesor/crearPropiedad/components/propertyType'), { ssr: false });
const PropertyDetails = dynamic(() => import('../../asesor/crearPropiedad/components/propertyDetails'), { ssr: false });
const PropertyPhotos = dynamic(() => import('../../asesor/crearPropiedad/components/propertyPhotos'), { ssr: false });
const PropertyReview = dynamic(() => import('../../asesor/crearPropiedad/components/propertyReview'), { ssr: false });
const FinishMessage = dynamic(() => import('../../asesor/crearPropiedad/components/finishMessage'), { ssr: false });

// Initial form data - same as in crearPropiedad
const initialFormData: PropertyData = {
  propertyType: 'casa',
  transactionType: 'renta' as const,
  price: 0,
  bathrooms: 1,
  bedrooms: 1,
  furnished: false,
  zone: '',
  condo: '',
  condoName: '',
  propertyCondoNumber: '',
  propertyCondoNumberPhoto: '',
  publicationDate: Timestamp.fromDate(new Date()),
  imageUrls: [],
  constructionYear: null,
  construccionM2: 0,
  terrenoM2: 0, // Add this field with default value
  maintenanceCost: 0,
  maintenanceIncluded: true,
  servicesIncluded: false,
  includesWifi: false,
  includesWater: false,
  includesGas: false,
  includesElectricity: false,
  petsAllowed: false,
  status: 'borrador',
  parkingSpots: 1,
  advisor: '',
  views: 0,
  whatsappClicks: 0,
  descripcion: '',
  cuartoEstudio: false,
  cuartoLavado: false,
  balcon: false,
  jardin: false,
  roofGarden: false,
  bodega: false,
  calentadorAgua: false,
  cocinaEquipada: false,
  contratoMinimo: 12,
  depositoRenta: 1,
  estadoConservacion: 'como_nuevo',
  tipoGas: 'estacionario',
};

// Define steps
const steps = [
  { id: 'type', label: 'Tipo' },
  { id: 'details', label: 'Detalles' },
  { id: 'photos', label: 'Fotos' },
  { id: 'review', label: 'Revisión' },
];

// This component uses useSearchParams and needs to be wrapped in Suspense
function EditPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('id') || null;
  
  const [loading, setLoading] = useState(true);
  const [adminChecked, setAdminChecked] = useState(false);
  const [formData, setFormData] = useState<PropertyData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [advisorsList, setAdvisorsList] = useState<any[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('');

  // Load property data and check admin permissions
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Authentication check
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Admin check
        const isAdmin = await checkIfUserIsAdmin(user.uid);
        if (!isAdmin) {
          setError('Acceso no autorizado. Solo administradores pueden editar propiedades.');
          router.push('/admin');
          return;
        }
        
        setAdminChecked(true);

        // Fetch all advisors
        const advisors = await getAllAdvisors();
        setAdvisorsList(advisors);

        // If we have a propertyId and it's not 'new', load the existing property
        if (propertyId && propertyId !== 'new') {
          const existingProperty = await getProperty(propertyId);
          if (existingProperty) {
            console.log('Loaded existing property:', existingProperty);
            setFormData(existingProperty);
            setSelectedAdvisor(existingProperty.advisor || '');
          } else {
            setError('Propiedad no encontrada');
            setFormData({
              ...initialFormData,
              advisor: '',
            });
          }
        } else {
          // Initialize new property with empty advisor
          console.log('Creating new property from initialFormData');
          setFormData({
            ...initialFormData,
            publicationDate: Timestamp.now(), // Ensure publication date is set for new properties
            advisor: '',
          });
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, [router, propertyId]);

  const handleNextStep = () => {
    if (validationError) return;
    
    // If validation passes, proceed to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormChange = (newData: Partial<PropertyData>) => {
    setFormData({...formData!, ...newData});
  };

  const handleAdvisorChange = (advisorId: string) => {
    setSelectedAdvisor(advisorId);
    if (formData) {
      setFormData({...formData, advisor: advisorId});
    }
  };

  const handleSubmit = async () => {
    if (!formData || isSubmitting) return;
    
    if (!selectedAdvisor) {
      setError('Debe seleccionar un asesor antes de guardar la propiedad');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Ensure the advisor is set in the submitted data
      const dataToSubmit = { 
        ...formData, 
        advisor: selectedAdvisor,
        status: 'publicada' as const,
        publicationDate: formData.publicationDate || Timestamp.now(), // Ensure publication date exists
        createdAt: formData.createdAt || Timestamp.now(), // Set creation date for new properties
        views: formData.views || 0,
        whatsappClicks: formData.whatsappClicks || 0
      };
      
      if (propertyId && propertyId !== 'new') {
        // Update existing property
        await updateProperty(propertyId, dataToSubmit);
        console.log('Property updated successfully');
      } else {
        // Add new property
        await addProperty(dataToSubmit);
        console.log('New property created successfully');
      }
      
      setIsComplete(true);
      setTimeout(() => {
        router.push('/admin');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting property:', error);
      setError(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !adminChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        <p className="ml-3">Cargando...</p>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Volver al Panel de Administración
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 min-h-screen">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          {propertyId ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}
        </h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Volver al Panel
        </button>
      </div>
      
      {/* Advisor selection for admin */}
      <div className="mb-8 p-4 bg-violet-50 rounded-lg border border-violet-200">
        <h2 className="text-lg font-medium mb-3">Asignar Asesor</h2>
        <div className="flex flex-wrap gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asesor asignado:
            </label>
            <select
              value={selectedAdvisor}
              onChange={(e) => handleAdvisorChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Seleccionar asesor</option>
              {advisorsList.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name} ({advisor.email})
                </option>
              ))}
            </select>
            {!selectedAdvisor && (
              <p className="mt-1 text-sm text-red-500">
                Debe seleccionar un asesor antes de publicar la propiedad
              </p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          <p className="ml-3">Cargando...</p>
        </div>
      ) : isComplete ? (
        <FinishMessage />
      ) : (
        <>
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((step, i) => (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center ${i <= currentStep ? 'text-violet-600' : 'text-gray-400'}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${i <= currentStep ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}>
                    {i + 1}
                  </div>
                  <span className="text-sm">{step.label}</span>
                </div>
              ))}
            </div>
            <div className="relative mt-1">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-violet-600 rounded-full transition-all duration-300" 
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <PropertyType 
                  data={formData!} 
                  onChange={handleFormChange} 
                  onError={setValidationError}
                />
              )}
              {currentStep === 1 && (
                <PropertyDetails 
                  data={formData!} 
                  onChange={handleFormChange} 
                  onError={setValidationError}
                />
              )}
              {currentStep === 2 && (
                <PropertyPhotos 
                  data={formData!} 
                  onChange={handleFormChange} 
                  onError={setValidationError}
                />
              )}
              {currentStep === 3 && (
                <PropertyReview 
                  data={formData!} 
                  onChange={handleFormChange} 
                />
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-md ${currentStep === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Anterior
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNextStep}
                disabled={!!validationError}
                className={`px-6 py-2 bg-violet-600 text-white rounded-md ${
                  validationError ? 'opacity-50 cursor-not-allowed' : 'hover:bg-violet-700'
                }`}
              >
                Siguiente
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedAdvisor}
                className={`px-6 py-2 bg-green-600 text-white rounded-md ${
                  isSubmitting || !selectedAdvisor ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Guardando...' : 'Publicar Propiedad'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function AdminEditPropertyPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        <p className="ml-3">Cargando...</p>
      </div>
    }>
      <EditPropertyContent />
    </Suspense>
  );
}