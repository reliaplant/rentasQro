"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { CondoData } from '@/app/interfaces';
import { addCondo, updateCondo, getCondoById } from '@/app/services/firebase';
import CondoBasicInfo from '../components/condoInfo';
import CondoImages from '../components/condoImages';
import CondoGoogleData from '../components/condoGoogleData';

const steps = [
  { id: 'info', label: 'Información básica' },
  { id: 'images', label: 'Imágenes' },
  { id: 'google', label: 'Datos de Google' },
];

export default function EditCondoPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout>();
  
  // Condo data state
  const [formData, setFormData] = useState<Partial<CondoData>>({
    name: '',
    description: '',
    shortDescription: '',
    amenities: [],
    status: 'active',
    imageUrls: []
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Load condo data when editing
  useEffect(() => {
    const fetchCondo = async () => {
      if (id !== 'new') {
        try {
          const condoData = await getCondoById(id as string);
          if (condoData) {
            setFormData(condoData);
            setPreviewUrls(condoData.imageUrls || []);
            if (condoData.logoUrl) {
              setLogoPreview(condoData.logoUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching condo:', error);
          setError('Error al cargar el condominio');
        }
      }
      setLoading(false);
    };
    fetchCondo();
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && id !== 'new') {
      clearTimeout(autoSaveTimer);
      const timer = setTimeout(() => handleSave(true), 3000);
      setAutoSaveTimer(timer);
    }
    return () => clearTimeout(autoSaveTimer);
  }, [formData, isDirty, id]);

  const handleFormChange = useCallback((newData: Partial<CondoData>) => {
    setFormData(newData);
    setIsDirty(true);
    setError(null);
  }, []);

  const removeImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleImagesChange = (files: File[]) => {
    setImageFiles(prev => [...prev, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setIsDirty(true);
  };

  const handleReorder = (newOrder: string[]) => {
    setPreviewUrls(newOrder);
    setIsDirty(true);
  };

  const handleSave = async (autosave = false) => {
    try {
      setSaving(true);
      
      if (!autosave) {
        // Add slight delay for smooth animation
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (id !== 'new') {
        await updateCondo(id as string, formData, imageFiles, logoFile);
      } else {
        await addCondo(formData as CondoData, imageFiles, logoFile);
      }
      
      setIsDirty(false);
      
      if (!autosave) {
        router.push('/admin?tab=zones');
      }
    } catch (error) {
      console.error('Error saving condo:', error);
      setError(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        return Boolean(
          formData.name && 
          formData.shortDescription && 
          formData.zoneId
        );
      case 1: // Images
        return true; // Always can proceed
      case 2: // Google Data
        return true; // Always can proceed
      default:
        return false;
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CondoBasicInfo
            formData={formData}
            onFormDataChange={handleFormChange}
            logoFile={logoFile}
            onLogoFileChange={setLogoFile}
            logoPreview={logoPreview}
            onLogoPreviewChange={setLogoPreview}
          />
        );
      case 1:
        return (
          <CondoImages
            previewUrls={previewUrls}
            onImagesChange={handleImagesChange}
            onRemoveImage={removeImage}
            onReorderImages={handleReorder}
            formData={formData}
            onFormDataChange={handleFormChange}
          />
        );
      case 2:
        return (
          <CondoGoogleData
            id={id as string}
            formData={formData}
            onFormDataChange={handleFormChange}
          />
        );
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
      <header className="h-16 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin?tab=zones')}
              className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-medium text-gray-900">
              {id === 'new' ? 'Nuevo Condominio' : 'Editar Condominio'}
            </h1>
          </div>

          {/* Center: Steps */}
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`text-sm font-medium px-6 h-16 flex items-center relative
                  ${index === currentStep 
                    ? 'text-blue-600' 
                    : index < currentStep 
                      ? 'text-gray-700' 
                      : 'text-gray-400'
                  }`}
              >
                {step.label}
                {index === currentStep && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </div>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer ${
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
              disabled={!canProceedFromStep(currentStep) || saving}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {currentStep === steps.length - 1 ? (saving ? 'Guardando...' : 'Guardar') : 'Siguiente'}
            </button>

            {isDirty && (
              <span className="text-sm text-gray-500">
                {saving ? 'Guardando...' : 'Sin guardar'}
              </span>
            )}
            
            <button
              onClick={() => router.push('/admin?tab=zones')}
              className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}