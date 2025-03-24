"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getProperty, updateProperty, addProperty } from '@/app/services/firebase';
import { PropertyData } from '@/app/interfaces';
import { Timestamp } from 'firebase/firestore';
import PropertyType from '@/app/crearPropiedad/components/propertyType';
import PropertyDetails from '@/app/crearPropiedad/components/propertyDetails';
import PropertyPhotos from '@/app/crearPropiedad/components/propertyPhotos';
import PropertyReview from '@/app/crearPropiedad/components/propertyReview';
import FinishMessage from '@/app/crearPropiedad/components/finishMessage';

const steps = [
  { id: 'type', label: 'Tipo' },
  { id: 'details', label: 'Detalles' },
  { id: 'photos', label: 'Fotos' },
  { id: 'review', label: 'Revisión' },
];

const initialFormData: PropertyData = {
  propertyType: '',
  transactionTypes: [],
  price: 0,
  bathrooms: 1,
  bedrooms: 1,
  furnished: false,
  zone: '',
  privateComplex: '',
  publicationDate: Timestamp.fromDate(new Date()),
  imageUrls: [],
  constructionYear: new Date().getFullYear(),
  maintenanceCost: 0,
  maintenanceIncluded: true,
  petsAllowed: false,
  status: 'publicada',
  dealType: 'asesor',
  parkingSpots: 1,
  includesWifi: false,
  includesUtilities: false,
  includedUtilities: [],
  amenities: [],
  advisor: '',
  views: 0,
  whatsappClicks: 0
};

export default function PropertyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  
  const [formData, setFormData] = useState<PropertyData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        if (propertyId) {
          const property = await getProperty(propertyId);
          setFormData(property);
        } else {
          setFormData(prev => ({ ...prev, advisor: user.uid }));
        }
      } catch (error) {
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, router]);

  useEffect(() => {
    if (isDirty && propertyId) {
      clearTimeout(autoSaveTimer);
      const timer = setTimeout(() => handleSave(true), 3000);
      setAutoSaveTimer(timer);
    }
    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, propertyId]);

  const handleChange = useCallback((field: keyof PropertyData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setError(null);
  }, []);

  const handleSave = async (autosave = false) => {
    try {
      if (!autosave && currentStep === steps.length - 1) {
        setIsFinishing(true);
        setSaving(true);
        
        console.log('Saving with files:', imageFiles.length);
        
        // Add slight delay to ensure animation feels smooth
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (propertyId) {
          await updateProperty(propertyId, formData, imageFiles);
        } else {
          await addProperty(formData, imageFiles);
        }
        
        setIsDirty(false);
        // Don't redirect immediately, let the finish animation play out
      } else if (autosave && propertyId) {
        setSaving(true);
        await updateProperty(propertyId, formData);
        setIsDirty(false);
        setSaving(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Error al guardar los cambios');
      setIsFinishing(false);
      setSaving(false);
    }
  };

  const handleUploadImages = async (files: File[]) => {
    try {
      // Create data URLs for preview
      const dataUrls = await Promise.all(
        files.map(file => 
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to read file'));
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        )
      );
      
      console.log('Adding files:', files.length); // Debug logging
      
      // Update both states
      setImageFiles(prev => [...prev, ...files]);
      handleChange('imageUrls', [...formData.imageUrls, ...dataUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error al procesar las imágenes');
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);
    
    const newImageUrls = [...formData.imageUrls];
    newImageUrls.splice(index, 1);
    handleChange('imageUrls', newImageUrls);
  };

  const handleReorderImages = (newOrder: string[]) => {
    // Get the mapping from old to new positions
    const oldToNewMap = new Map();
    newOrder.forEach((url, newIndex) => {
      const oldIndex = formData.imageUrls.indexOf(url);
      oldToNewMap.set(oldIndex, newIndex);
    });
    
    // Reorder the actual files based on the mapping
    const newFiles: File[] = [];
    oldToNewMap.forEach((newIndex, oldIndex) => {
      newFiles[newIndex] = imageFiles[oldIndex];
    });
    
    // Update state
    setImageFiles(newFiles.filter(Boolean));
    handleChange('imageUrls', newOrder);
  };

  const canProceedFromStep = (step: number, data: PropertyData): boolean => {
    switch (step) {
      case 0: // Type
        return Boolean(
          data.propertyType && 
          data.transactionTypes?.length > 0 &&
          data.price > 0
        );

      case 1: // Details
        const baseValidation = 
          data.bedrooms >= 1 && 
          data.bathrooms >= 1 && 
          data.parkingSpots >= 0;

        if (data.transactionTypes?.includes('renta')) {
          return baseValidation;  // Remove unnecessary boolean checks
        }
        return baseValidation;
        
      case 2: // Photos
        return data.imageUrls.length > 0;
        
      case 3: // Review
        return true;

      default:
        return false;
    }
  };

  const getStepError = (step: number, data: PropertyData): string | null => {
    switch (step) {
      case 1:
        if (data.bedrooms < 1) {
          return 'Debes especificar al menos 1 recámara';
        }
        if (data.bathrooms < 1) {
          return 'Debes especificar al menos 1 baño';
        }
        if (data.parkingSpots < 0) {
          return 'El número de estacionamientos debe ser válido';
        }
        return null;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isFinishing) {
      return <FinishMessage propertyId={propertyId} />;
    }

    switch (currentStep) {
      case 0:
        return <PropertyType data={formData} onChange={handleChange} error={error} />;
      case 1:
        return <PropertyDetails data={formData} onChange={handleChange} error={error} />;
      case 2:
        return (
          <PropertyPhotos 
            data={formData} 
            onChange={handleChange} 
            onUploadImages={handleUploadImages}
            onDeleteImage={handleDeleteImage}
            onReorderImages={handleReorderImages}
            error={error} 
          />
        );
      case 3:
        return <PropertyReview data={formData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <header className="py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side - Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/misObras')}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-medium text-gray-900">
                {propertyId ? 'Editar Propiedad' : 'Nueva Propiedad'}
              </h1>
            </div>
            
            {/* Center - Steps */}
            <div className="flex items-center space-x-6">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`text-sm font-medium py-1 ${
                    index === currentStep
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : index < currentStep
                        ? 'text-gray-700'
                        : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </div>
              ))}
            </div>
            
            {/* Right side - Save indicator */}
            <div className="flex items-center space-x-2">
              {isDirty && (
                <span className="text-sm text-gray-500">
                  {saving ? 'Guardando...' : 'Sin guardar'}
                </span>
              )}
              <button
                onClick={() => router.push('/misObras')}
                className="ml-2 text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {!isFinishing && (
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => {
                  if (currentStep === steps.length - 1) {
                    handleSave();
                  } else {
                    setCurrentStep(prev => prev + 1);
                  }
                }}
                disabled={!canProceedFromStep(currentStep, formData) || saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === steps.length - 1 ? 'Guardar' : 'Siguiente'}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
