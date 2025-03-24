"use client";

import { useState, useRef, useCallback } from 'react';
import type { PropertyData } from '@/app/interfaces';

interface PropertyPhotosProps {
  data: Pick<PropertyData, 'imageUrls'>;
  onChange: (field: keyof PropertyData, value: string[]) => void;
  onUploadImages: (files: File[]) => Promise<void>;
  onDeleteImage?: (index: number) => void;
  onReorderImages?: (newOrder: string[]) => void;
  error?: string | null;
}

export default function PropertyPhotos({ data, onChange, onUploadImages, onDeleteImage, onReorderImages, error }: PropertyPhotosProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Memoize handlers for better performance
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    try {
      setIsUploading(true);
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      
      // Call onUploadImages to update the parent's imageFiles state
      await onUploadImages(files);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setLocalError('Error al procesar las imágenes');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadImages]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      try {
        setIsUploading(true);
        
        // Call onUploadImages to update the parent's imageFiles state
        await onUploadImages(files);
      } catch (error) {
        setLocalError('Error al procesar las imágenes');
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUploadImages]);

  // Ensure this function properly deletes the image
  const handleDelete = useCallback((index: number) => {
    if (onDeleteImage) {
      onDeleteImage(index);
    } else {
      const newUrls = [...data.imageUrls];
      newUrls.splice(index, 1);
      onChange('imageUrls', newUrls);
      
      const newFiles = [...selectedFiles];
      newFiles.splice(index, 1);
      setSelectedFiles(newFiles);
    }
  }, [data.imageUrls, onChange, selectedFiles, onDeleteImage]);

  // Simplified drag and drop functions
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('opacity-50');
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDropImage = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex || isNaN(dragIndex)) return;
    
    const newUrls = [...data.imageUrls];
    const [movedItem] = newUrls.splice(dragIndex, 1);
    newUrls.splice(dropIndex, 0, movedItem);
    
    if (onReorderImages) {
      onReorderImages(newUrls);
    } else {
      onChange('imageUrls', newUrls);
    }
  }, [data.imageUrls, onChange, onReorderImages]);
  
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  }, []);

  return (
    <div className="space-y-8">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra tus fotos aquí'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            PNG, JPG hasta 10MB
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Seleccionar archivos
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Image Grid */}
      {data.imageUrls.length > 0 && (
        <div className="relative">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Fotos ({data.imageUrls.length})
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Arrastra y suelta para reordenar. La primera foto será la principal.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden group border-2 border-gray-200 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropImage(e, index)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 group-hover:bg-black/30 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 cursor-pointer z-10"
                    type="button"
                    aria-label="Eliminar imagen"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {(error || localError) && (
        <div className="text-red-500 mt-2">
          {error || localError}
        </div>
      )}
    </div>
  );
}