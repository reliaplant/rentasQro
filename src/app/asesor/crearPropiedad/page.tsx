"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getProperty, updateProperty, addProperty } from '@/app/shared/firebase';
import { PropertyData } from '@/app/shared/interfaces';
import { Timestamp } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// Dynamic imports with no SSR
const PropertyType = dynamic(() => import('./components/propertyType'), { ssr: false });
const PropertyDetails = dynamic(() => import('./components/propertyDetails'), { ssr: false });
const PropertyPhotos = dynamic(() => import('./components/propertyPhotos'), { ssr: false });
const PropertyReview = dynamic(() => import('./components/propertyReview'), { ssr: false });
const FinishMessage = dynamic(() => import('./components/finishMessage'), { ssr: false });

// Safely import Firebase services
const useFirebaseServices = () => {
  const [services, setServices] = useState<any>(null);
  
  useEffect(() => {
    const loadServices = async () => {
      const module = await import('@/app/shared/firebase');
      setServices(module);
    };
    
    loadServices();
  }, []);
  
  return services;
};

// Keep the steps definition and initialFormData the same
const steps = [
  { id: 'type', label: 'Tipo' },
  { id: 'details', label: 'Detalles' },
  { id: 'photos', label: 'Fotos' },
  { id: 'review', label: 'Revisión' },
];

// Default property data with all required fields
const initialFormData: PropertyData = {
  propertyType: 'casa',
  transactionType: 'renta' as const, // Use 'as const' to ensure type safety
  price: 0,
  bathrooms: 1,
  bedrooms: 1,
  furnished: false,
  zone: '',
  condo: '',
  condoName: '',
  publicationDate: Timestamp.fromDate(new Date()),
  imageUrls: [],
  constructionYear: null, // Initialize as null instead of current year
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

export default function CreatePropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get('id') || null;
  const services = useFirebaseServices();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PropertyData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize everything inside useEffect to ensure client-side only execution
  useEffect(() => {
    if (!services) return;
    
    const initialize = async () => {
      try {
        setLoading(true);
        // Authentication check
        const user = await services.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // If we have a propertyId, load the existing property
        if (propertyId) {
          const existingProperty = await services.getProperty(propertyId);
          if (existingProperty) {
            console.log('Loaded existing property:', existingProperty);
            setFormData(existingProperty);
          } else {
            setError('Propiedad no encontrada');
            setFormData({
              ...initialFormData,
              advisor: user.uid,
            });
          }
        } else {
          // Initialize new property
          setFormData({
            ...initialFormData,
            advisor: user.uid,
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
  }, [services, router, propertyId]);

  // Modificar esta función para no mostrar un error global
  useEffect(() => {
    // Elimina la validación inicial que muestra el mensaje
    if (formData && currentStep === 0 && !propertyId) {
      // En lugar de mostrar un mensaje, solo validamos
      // pero no establecemos ningún mensaje de error global
    }
  }, [formData, currentStep, propertyId]);

  if (loading || !services || !formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        <p className="ml-3">Cargando...</p>
      </div>
    );
  }

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
    setFormData({...formData, ...newData});
  };

  // Update the handleSubmit function to handle both create and update
  const handleSubmit = async () => {
    if (!formData || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formData, status: 'publicada' };
      
      if (propertyId) {
        // Update existing property
        await services.updateProperty(propertyId, dataToSubmit);
      } else {
        // Add new property
        await services.addProperty(dataToSubmit);
      }
      
      setIsComplete(true);
      setTimeout(() => {
        router.push('/asesor'); // Cambiar esta línea
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting property:', error);
      setError('Hubo un error al guardar la propiedad. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 min-h-screen">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Eliminar el mensaje de validación global */}
      
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
                  data={formData} 
                  onChange={handleFormChange} 
                  onError={setValidationError}
                />
              )}
              {currentStep === 1 && (
                <PropertyDetails 
                  data={formData} 
                  onChange={handleFormChange} 
                  onError={setValidationError} // Add this prop
                />
              )}
              {currentStep === 2 && (
                <PropertyPhotos 
                  data={formData} 
                  onChange={handleFormChange} 
                  onError={setValidationError} // Add this line
                />
              )}
              {currentStep === 3 && (
                <PropertyReview 
                  data={formData} 
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
                disabled={isSubmitting}
                className={`px-6 py-2 bg-green-600 text-white rounded-md ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-green-700'}`}
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
