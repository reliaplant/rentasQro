import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images, Camera, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import GaleriaPropiedad from './galeriaPropiedad';

interface FotosPropiedadProps {
  images: string[];
  propertyType?: string;
}

export default function FotosPropiedad({ images, propertyType }: FotosPropiedadProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  
  // Track loading state for each image
  const [loadingStatus, setLoadingStatus] = useState<Record<number, boolean>>({});
  
  // Prevent stale closures in event handlers
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Determine which images to preload based on current visibility
  useEffect(() => {
    if (!images?.length) return;

    // Always preload the first 5 images (visible in desktop layout)
    const initialBatch = images.slice(0, Math.min(5, images.length));
    setVisibleImages(initialBatch);
    
    // Mark the first 5 images as loading
    const initialLoadingStatus: Record<number, boolean> = {};
    initialBatch.forEach((_, index) => {
      initialLoadingStatus[index] = false;
    });
    setLoadingStatus(initialLoadingStatus);
    
    // Preload the remaining images in the background after a delay
    if (images.length > 5) {
      const timer = setTimeout(() => {
        setVisibleImages(images);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [images]);

  // Handle image load events
  const handleImageLoaded = (index: number) => {
    setLoadingStatus(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Check if all visible images are loaded
    const allLoaded = Object.values(loadingStatus).every(status => status === true);
    if (allLoaded) {
      setImagesLoaded(true);
      setPreloadedImages(visibleImages);
    }
  };

  // Modified drag handler with improved sensitivity
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    const swipeThreshold = Math.min(50, window.innerWidth * 0.15); // 15% of screen width or 50px
    
    if (Math.abs(velocity.x) > 300 || Math.abs(swipe) > swipeThreshold) {
      if (swipe < 0 && currentIndexRef.current < images.length - 1) {
        setDirection(1);
        setCurrentIndex(currentIndexRef.current + 1);
      } else if (swipe > 0 && currentIndexRef.current > 0) {
        setDirection(-1);
        setCurrentIndex(currentIndexRef.current - 1);
      }
    }
  };

  // Navigation functions
  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      
      // Preload next image if it exists
      const nextImageIndex = currentIndex + 2; // Current + 2 because we're moving to current + 1
      if (nextImageIndex < images.length && !visibleImages.includes(images[nextImageIndex])) {
        setVisibleImages(prev => [...prev, images[nextImageIndex]]);
      }
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '30%' : '-30%',
      opacity: 0,
      position: 'absolute', // Add position to all variants for consistency
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'absolute', // Add position to all variants for consistency
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-30%' : '30%',
      opacity: 0,
      position: 'absolute',
    })
  };

  if (!images?.length) return null;

  return (
    <>
      <section className="relative mb-8">
        {/* Desktop Layout (hidden on mobile) */}
        <div className="hidden md:grid grid-cols-12 gap-2">
          {/* Main large image on top */}
          <div 
            className="col-span-12 h-[42vh] relative cursor-pointer overflow-hidden rounded group"
            onClick={() => {setShowAllPhotos(true); setCurrentIndex(0);}}
          >
            {visibleImages[0] && (
              <Image
                src={visibleImages[0]}
                alt={`${propertyType || 'Propiedad'} imagen principal`}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={true}
                onLoad={() => handleImageLoaded(0)}
                onError={() => handleImageLoaded(0)}
                quality={85}
              />
            )}
            {!loadingStatus[0] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/30">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Smaller images below in a row */}
          {visibleImages.slice(1, 5).map((image, index) => {
            const actualIndex = index + 1;
            return (
              <div 
                key={actualIndex}
                className="col-span-3 h-[22vh] relative overflow-hidden rounded group cursor-pointer"
                onClick={() => {setShowAllPhotos(true); setCurrentIndex(actualIndex);}}
              >
                <Image
                  src={image}
                  alt={`${propertyType || 'Propiedad'} imagen ${actualIndex}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={actualIndex === 1} // Only prioritize first additional image
                  onLoad={() => handleImageLoaded(actualIndex)}
                  onError={() => handleImageLoaded(actualIndex)}
                  quality={75}
                />
                {!loadingStatus[actualIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/30">
                    <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Layout (hidden on desktop) - Keep your existing mobile layout */}
        <div className="md:hidden relative h-[40vh] w-full">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="w-full h-full"
            >
              {visibleImages[currentIndex] && (
                <Image
                  src={visibleImages[currentIndex]}
                  alt={`${propertyType || 'Propiedad'} imagen ${currentIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={true}
                  onLoad={() => handleImageLoaded(currentIndex)}
                  onError={() => handleImageLoaded(currentIndex)}
                  quality={80}
                />
              )}
              {/* Loading indicator */}
            </motion.div>
          </AnimatePresence>
          
          {/* Keep existing mobile navigation buttons */}
        </div>

        {/* View all photos button */}
        <button 
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium flex text-gray-800 items-center gap-1 hover:bg-gray-50"
          aria-label="View all photos"
        >
          Ver todas las fotos ({images.length})
        </button>
      </section>

      {/* Gallery Modal */}
      {showAllPhotos && (
        <GaleriaPropiedad 
          isOpen={showAllPhotos}
          images={images}
          onClose={() => setShowAllPhotos(false)}
          initialIndex={currentIndex}
        />
      )}
    </>
  );
}