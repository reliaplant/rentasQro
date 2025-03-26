import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images, Camera, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GaleriaPropiedad from './galeriaPropiedad';

interface FotosPropiedadProps {
  images: string[];
  propertyType?: string;
}

export default function FotosPropiedad({ images, propertyType }: FotosPropiedadProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!images?.length) return null;

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    
    if (Math.abs(velocity.x) > 500 || Math.abs(swipe) > 50) {
      if (swipe < 0 && currentIndex < images.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      } else if (swipe > 0 && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  return (
    <>
      <section className="relative mb-8 ">
        {/* Mobile View */}
        <div className="md:hidden relative h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-20 z-10" />
          
          <motion.div 
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 500, damping: 30 },
                  opacity: { duration: 0.15 }
                }}
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

        {/* Desktop View - 5 Photo Layout */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="grid grid-cols-12 gap-2 h-auto">
            {/* Main large image on top */}
            <div 
              className="col-span-12 h-[42vh] relative cursor-pointer overflow-hidden rounded group"
              onClick={() => {setShowAllPhotos(true); setCurrentIndex(0);}}
            >
              <Image
                src={images[0]}
                alt="Principal"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Overlay with view all photos on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/80 border-2 border-white backdrop-blur-sm px-5 py-3 rounded-lg flex items-center gap-3 shadow-lg transform transition-all scale-90 group-hover:scale-100">
                  <Images className="h-5 w-5" />
                  <span className="font-medium  rounded-md px-2">Ver todas las fotos ({images.length})</span>
                </div>
                </div>
            </div>
            
            {/* First row of 2 photos */}
            {images.slice(1, 3).map((url, i) => (
              <div 
                key={`row1-${i}`} 
                className="col-span-6 h-[21vh] relative cursor-pointer overflow-hidden rounded group"
                onClick={() => {setShowAllPhotos(true); setCurrentIndex(i+1);}}
              >
                <Image
                  src={url}
                  alt={`Foto ${i + 2}`}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                  <div className="bg-white rounded-full p-1.5 shadow-lg">
                    <ArrowUpRight className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Second row of 2 photos */}
            {images.slice(3, 5).map((url, i) => (
              <div 
                key={`row2-${i}`} 
                className="col-span-6 h-[21vh] relative cursor-pointer overflow-hidden rounded group"
                onClick={() => {setShowAllPhotos(true); setCurrentIndex(i+3);}}
              >
                <Image
                  src={url}
                  alt={`Foto ${i + 4}`}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
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