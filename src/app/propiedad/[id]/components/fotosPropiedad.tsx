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
        {/* Mobile View */}
        <div className="md:hidden relative h-[60vh] w-full overflow-hidden bg-neutral-900">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-20 z-10" />
          
          <motion.div 
            className="absolute inset-0 bg-neutral-900"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.05}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.25, ease: "easeOut" },
                  opacity: { duration: 0.15 }
                }}
                className="absolute inset-0 bg-neutral-900"
              >
                {/* Only render the current image and show a loading placeholder */}
                <div className="w-full h-full relative">
                  {/* Show a placeholder while loading */}
                  {!loadingStatus[currentIndex] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                      <div className="w-8 h-8 border-4 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <Image
                    src={images[currentIndex]}
                    alt={`Photo ${currentIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={currentIndex === 0}
                    loading={currentIndex <= 2 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoaded(currentIndex)}
                    onError={() => handleImageLoaded(currentIndex)}
                    quality={currentIndex === 0 ? 85 : 75}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation arrows */}
          <button 
            onClick={prevImage}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:bg-white'} transition-all`}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button 
            onClick={nextImage}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg ${currentIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:bg-white'} transition-all`}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Photo indicator */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center gap-2 z-20">
            <Camera className="h-3.5 w-3.5" />
            <span>{currentIndex + 1} / {images.length}</span>
          </div>

          {/* View all photos button */}
          <button 
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2 transition-all z-20"
          >
            <Images className="h-4 w-4" />
            Ver todas
          </button>
        </div>

        {/* Desktop View - 5 Photo Layout with progressive loading */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="grid grid-cols-12 gap-2 h-auto">
            {/* Main large image on top */}
            <div 
              className="col-span-12 h-[42vh] relative cursor-pointer overflow-hidden rounded group"
              onClick={() => {setShowAllPhotos(true); setCurrentIndex(0);}}
            >
              {/* Placeholder while loading */}
              {!loadingStatus[0] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              {visibleImages.length > 0 && (
                <Image
                  src={visibleImages[0]}
                  alt="Principal"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={true}
                  loading="eager"
                  onLoad={() => handleImageLoaded(0)}
                  onError={() => handleImageLoaded(0)}
                  quality={85}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Overlay with view all photos on hover */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <div className="bg-white rounded-full p-1.5 shadow-lg">
                  <ArrowUpRight className="h-4 w-4 text-gray-700" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2 items-center bg-white/90 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                <Images className="h-4 w-4" />
                <span>Ver todas las fotos</span>
              </div>
            </div>
            
            {/* First row of 2 photos - with progressive loading */}
            {[1, 2].map((imageIndex) => (
              <div 
                key={`row1-${imageIndex}`} 
                className="col-span-6 h-[21vh] relative cursor-pointer overflow-hidden rounded group"
                onClick={() => {setShowAllPhotos(true); setCurrentIndex(imageIndex);}}
              >
                {/* Placeholder while loading */}
                {!loadingStatus[imageIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-3 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                  </div>
                )}
                
                {visibleImages.length > imageIndex && (
                  <Image
                    src={visibleImages[imageIndex]}
                    alt={`Foto ${imageIndex + 1}`}
                    fill
                    sizes="50vw"
                    className="object-cover"
                    priority={imageIndex === 1} 
                    loading="eager"
                    onLoad={() => handleImageLoaded(imageIndex)}
                    onError={() => handleImageLoaded(imageIndex)}
                    quality={80}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  <div className="bg-white rounded-full p-1.5 shadow-lg">
                    <ArrowUpRight className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Second row of 2 photos */}
            {[3, 4].map((imageIndex) => (
              <div 
                key={`row2-${imageIndex}`} 
                className="col-span-6 h-[21vh] relative cursor-pointer overflow-hidden rounded group"
                onClick={() => {setShowAllPhotos(true); setCurrentIndex(imageIndex);}}
              >
                {/* Placeholder while loading */}
                {!loadingStatus[imageIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-3 border-gray-300 border-t-violet-500 rounded-full animate-spin"></div>
                  </div>
                )}
                
                {visibleImages.length > imageIndex && (
                  <Image
                    src={visibleImages[imageIndex]}
                    alt={`Foto ${imageIndex + 1}`}
                    fill
                    sizes="50vw"
                    className="object-cover"
                    loading={imageIndex === 3 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoaded(imageIndex)}
                    onError={() => handleImageLoaded(imageIndex)}
                    quality={75}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  <div className="bg-white rounded-full p-1.5 shadow-lg">
                    <ArrowUpRight className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Modal with improved preloading */}
      {showAllPhotos && (
        <GaleriaPropiedad 
          isOpen={showAllPhotos}
          images={images}
          onClose={() => setShowAllPhotos(false)}
          initialIndex={currentIndex}
          preloadedImages={preloadedImages}
        />
      )}
    </>
  );
}