"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, CircleDot, Home, Bath, BedDouble, CheckCircle2, ArrowUpRight } from 'lucide-react';

// Define the model interface
export interface HousingModel {
  name: string;
  price: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  available: boolean;
  image?: string;
}

interface ModelGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: HousingModel | null;
}

export default function ModelGalleryModal({ isOpen, onClose, model }: ModelGalleryModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Sample gallery images
  const galleryImages = [
    "/assets/preventa/ziqua/cadaziquadentro1.png",
    "/assets/preventa/ziqua/cadaziquadentro2.png",
    "/assets/preventa/ziqua/cadaziquadentro3.png",
    "/assets/preventa/ziqua/modelocasa2.png"
  ];
  
  if (!isOpen || !model) return null;
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded w-full max-w-4xl max-h-[calc(100vh-40px)] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-semibold">{model.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {/* Content - made scrollable */}
        <div className="flex-1 overflow-auto">
          {/* Gallery with fixed 16:9 ratio and dark gray background */}
          <div className="relative w-full aspect-[16/9] bg-black/90 flex items-center justify-center">
            <Image
              src={galleryImages[currentImageIndex]}
              alt={`${model.name} - Imagen ${currentImageIndex + 1}`}
              className="object-contain max-h-full max-w-full h-auto w-auto"
              width={1600}
              height={900}
              sizes="100vw"
            />
            
            {/* Image navigation controls */}
            <button 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-gray-800 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-gray-800 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
          
          {/* Details */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-base mb-2">Detalles</h4>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Home size={16} className="text-neutral-500" />
                  <span>{model.area} m² de construcción</span>
                </li>
                <li className="flex items-center gap-2">
                  <BedDouble size={16} className="text-neutral-500" />
                  <span>{model.bedrooms} Recámaras</span>
                </li>
                <li className="flex items-center gap-2">
                  <Bath size={16} className="text-neutral-500" />
                  <span>{model.bathrooms} Baños</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-neutral-500" />
                  <span>Entrega inmediata</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-base mb-2">Características</h4>
              <ul className="space-y-1.5">
                {model.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CircleDot size={14} className="text-violet-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4">
                <p className="text-xl font-semibold text-neutral-900">{model.price}</p>
                <p className="text-xs text-neutral-500">Precio de preventa</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with CTA - always visible */}
        <div className="border-t border-gray-100 p-4 flex-shrink-0">
          <Link 
            href="/contacto"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-800 to-violet-700 text-white px-4 py-2.5 rounded-lg hover:opacity-90 transition-colors text-sm"
          >
            Agendar visita
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
