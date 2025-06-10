import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface GaleriaPropiedadProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  preloadedImages?: string[];
}

/**
 * Simplified Gallery Component
 */
export default function GaleriaPropiedad({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex = 0,
  preloadedImages = [] // Provide default empty array
}: GaleriaPropiedadProps) {
  // Simple state just for current image index
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Reset current index when gallery opens with new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  // Utilize preloadedImages if available - MOVED above the early return
  useEffect(() => {
    if (isOpen && preloadedImages.length > 0) {
      console.log('Using preloaded images:', preloadedImages.length);
    }
  }, [isOpen, preloadedImages]);
  
  // No need to render anything if modal is closed
  if (!isOpen) return null;

  // Simple navigation functions
  const nextImage = () => setCurrentIndex((currentIndex + 1) % images.length);
  const prevImage = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[9999] flex flex-col">
      {/* Simple header */}
      <div className="p-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="p-2 bg-white/90 hover:bg-white transition-colors z-10 rounded-full"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
          <span className="text-xl text-white">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex items-center justify-center"
          > 
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Simple navigation buttons */}
        <button 
          onClick={prevImage}
          className="absolute left-4 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <button 
          onClick={nextImage}
          className="absolute right-4 p-3 bg-black/20 hover:bg-black/40 rounded-full text-white"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      
      {/* Simple Thumbnails */}
      <div className="p-4 border-t border-white/10">
        <div className="overflow-x-auto">
          <div className="flex gap-2 p-2">
            {images.map((url, i) => (
              <button
                key={`thumb-${i}`}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 w-16 h-12 ${i === currentIndex ? 'ring-2 ring-white' : 'opacity-50'}`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    loading={i === currentIndex || i === currentIndex - 1 || i === currentIndex + 1 ? "eager" : "lazy"}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Use data URI instead of non-existent file
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23cccccc"/%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}