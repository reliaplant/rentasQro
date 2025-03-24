import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Add } from '@carbon/icons-react';

interface GaleriaPropiedadProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  propertyType?: string;
  initialIndex?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export default function GaleriaPropiedad({ 
  isOpen, 
  onClose, 
  images, 
  propertyType,
  initialIndex = 0
}: GaleriaPropiedadProps) {
  const [imageDimensions, setImageDimensions] = useState<Record<string, ImageDimensions>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    // Pre-load images to get dimensions
    images.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.onload = () => {
        setImageDimensions(prev => ({
          ...prev,
          [url]: {
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          }
        }));
      };
    });
  }, [images]);

  const getImageLayout = (url: string) => {
    const dims = imageDimensions[url];
    if (!dims) return 'square';
    
    if (dims.aspectRatio > 1.5) return 'horizontal';
    if (dims.aspectRatio < 0.67) return 'vertical';
    return 'square';
  };

  const handleImageClick = (url: string) => {
    setCurrentIndex(images.indexOf(url));
    setSelectedImage(url);
  };

  const ImageModal = () => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev + 1) % images.length);
        if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        if (e.key === 'Escape') setSelectedImage(null);
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!selectedImage) return null;

    return (
      <div className="fixed inset-0 bg-gray-100/98 z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <button 
            onClick={() => setSelectedImage(null)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative w-full max-w-4xl max-h-[70vh]">
            <Image
              src={images[currentIndex]}
              alt={`Imagen ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Thumbnails */}
        <div className="p-4 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-thin scrollbar-thumb-gray-300">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                    ${i === currentIndex ? 'ring-2 ring-black' : 'opacity-40 hover:opacity-70'}
                    transition-opacity`}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 bg-[rgb(255,253,250)]/80 backdrop-blur-md z-50 flex flex-col">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-[rgb(255,251,245)]/90 to-[rgb(255,248,240)]/95 backdrop-blur-md" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-[rgb(255,251,245)]/40 to-[rgb(255,248,240)]/60" />
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />
        </div>
        {/* Header */}
        <div className="p-4 flex justify-between items-center ">
            <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-50 hover:cursor-pointer"
            >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            </button>
            <span className="text font-medium text-gray-600 z-50 mr-4">
            {currentIndex + 1} / {images.length}
            </span>
        </div>

        {/* Main Image with Navigation Controls */}
        <div className="flex-1 flex items-center justify-center p-8 z-50 relative group">
            {/* Left Arrow */}
            <button 
                onClick={() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)}
                className="absolute left-12 p-3 
                        opacity-20 group-hover:opacity-100 transition-opacity duration-100
                        hover:cursor-pointer"
            >
                <svg 
                className="w-16 h-16 text-[#D2B48C] hover:text-gray-600 transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7"/>
                </svg>
            </button>

            <img
                src={images[currentIndex]}
                alt={`Imagen ${currentIndex + 1}`}
                className="max-w-4xl max-h-[70vh] object-contain rounded"
            />

            {/* Right Arrow */}
            <button 
                onClick={() => setCurrentIndex(prev => (prev + 1) % images.length)}
                className="absolute right-12 p-3
                        opacity-20 group-hover:opacity-100 transition-opacity duration-100
                        hover:cursor-pointer"
            >
                <svg 
                className="w-16 h-16 text-[#D2B48C] hover:text-[#BC8F8F] transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
        {/* Thumbnails */}
        <div className="p-4 ">
            <div className="max-w-8xl mx-auto flex flex-col items-center">
            <div className="flex gap-2 overflow-x-auto pb-2 px-4">
                {images.map((url, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded border border-[#D2B48C] hover:cursor-pointer overflow-hidden
                    ${i === currentIndex ? 'ring-2 ring-white' : 'opacity-40 hover:opacity-70'}
                    transition-opacity`}
                >
                    <img
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    />
                </button>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
    }