import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GaleriaPropiedad from './galeriaPropiedad';

interface FotosPropiedadProps {
  images: string[];
  propertyType?: string;
}

export default function FotosPropiedad({ images, propertyType }: FotosPropiedadProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images?.length) return null;

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    
    if (Math.abs(velocity.x) > 500 || Math.abs(swipe) > 100) {
      if (swipe < 0 && currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (swipe > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  return (
    <>
      <section className="relative">
        {/* Mobile View */}
        <div className="md:hidden relative h-[50vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[currentIndex]}
                  alt={`Photo ${currentIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={currentIndex === 0}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Photo indicator */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* View all photos button */}
          <button 
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium"
          >
            Ver todas
          </button>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] relative rounded-2xl overflow-hidden">
          {/* Main large image */}
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer"
            onClick={() => setShowAllPhotos(true)}
          >
            <Image
              src={images[0]}
              alt="Principal"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors z-50 shadow-lg " />
          </div>
          
          {/* Side images grid */}
          <div className="grid grid-cols-2 col-span-2 row-span-2 gap-2 ">
              {images.slice(1, 5).map((url, i) => (
                  <div 
                      key={i} 
                      className="relative cursor-pointer overflow-hidden"
                      onClick={() => setShowAllPhotos(true)}
                  >
                      <Image
                          src={url}
                          alt={`Foto ${i + 2}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover "
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors" />
                  </div>
              ))}
          </div>

          {/* Show all photos button */}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="cursor-pointer text-sm absolute bottom-0 right-0 bg-black/80 backdrop-blur-sm rounded-tl-lg rounded-br-lg px-6 py-3 font-semibold text-white border-black border-1  
             shadow-lg z-10"
          >
            Mostrar todas las {images.length} fotos
          </button>
        </div>
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