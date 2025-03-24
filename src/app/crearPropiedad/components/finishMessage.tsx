"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface FinishMessageProps {
  propertyId?: string | null;
}

export default function FinishMessage({ propertyId }: FinishMessageProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  
  // Simulate loading progress
  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalId);
          setIsDone(true);
          return 100;
        }
        
        // Speed up towards the end
        const increment = prev < 70 ? 5 : 3;
        return Math.min(prev + increment, 100);
      });
    }, 150);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="flex justify-center mb-6">
          {isDone ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          ) : (
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={Math.PI * 2 * 45}
                  strokeDashoffset={Math.PI * 2 * 45 * (1 - progress / 100)}
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDashoffset: Math.PI * 2 * 45 }}
                  animate={{ strokeDashoffset: Math.PI * 2 * 45 * (1 - progress / 100) }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                {progress}%
              </div>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          {isDone ? '¡Propiedad guardada con éxito!' : 'Guardando propiedad...'}
        </h2>
        <p className="text-gray-600 mb-8">
          {isDone
            ? `${propertyId ? 'Los cambios han sido aplicados' : 'Tu propiedad ha sido creada'} y está lista para ser publicada.`
            : 'Estamos procesando la información y subiendo las imágenes.'}
        </p>
        
        {isDone && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => router.push('/misObras')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Regresar a mis propiedades
          </motion.button>
        )}
      </motion.div>
      
      {/* Optional decorative elements */}
      {isDone && (
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="text-4xl">🎉</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}