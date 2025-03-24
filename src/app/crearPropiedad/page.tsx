"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getProperty, updateProperty, addProperty } from '@/app/services/firebase';
import { PropertyData } from '@/app/interfaces';
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
      const module = await import('@/app/services/firebase');
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
  propertyType: '',
  transactionTypes: [],
  // transactionType: 'renta', // Add required field
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
  parkingSpots: 1,
  includesWifi: false,
  advisor: '',
  views: 0,
  whatsappClicks: 0,
  descripcion: '',
  // dealType: 'asesor' // Add required field
};

export default function CreatePropertyPage() {
  const router = useRouter();
  const services = useFirebaseServices();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  
  // Initialize everything inside useEffect to ensure client-side only execution
  useEffect(() => {
    if (!services) return;
    
    const initialize = async () => {
      try {
        // Authentication check
        const user = await services.getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Initialize form data with minimum required fields
        const initialData = {
          propertyType: '',
          transactionTypes: [],
          price: 0,
          bathrooms: 1,
          bedrooms: 1,
          parkingSpots: 1,
          furnished: false,
          zone: '',
          privateComplex: '',
          advisor: user.uid,
          status: 'borrador',
          dealType: 'asesor',
          publicationDate: Timestamp.now(),
          imageUrls: [],
          constructionYear: new Date().getFullYear(),
          views: 0,
          whatsappClicks: 0
        };
        
        setFormData(initialData);
        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
      }
    };
    
    initialize();
  }, [services, router]);
  
  if (loading || !services || !formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Your form content here */}
    </div>
  );
}
