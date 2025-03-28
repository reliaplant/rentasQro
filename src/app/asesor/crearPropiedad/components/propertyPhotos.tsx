"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import type { PropertyData } from '@/app/shared/interfaces';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface PropertyPhotosProps {
  data: PropertyData;
  onChange: (newData: Partial<PropertyData>) => void;
  onError?: (error: string | null) => void; // Add this prop for validation
}

export default function PropertyPhotos({ data, onChange, onError }: PropertyPhotosProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      // Validate files
      const validFiles = files.filter(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          setUploadError(`El archivo ${file.name} no es una imagen válida`);
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`La imagen ${file.name} excede el límite de 10MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Upload files to Firebase Storage
      const urls = await uploadImages(validFiles, (progress) => {
        setUploadProgress(progress);
      });

      // Update property data with new image URLs
      onChange({
        imageUrls: [...(data.imageUrls || []), ...urls]
      });

      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Error al subir las imágenes. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  }, [data.imageUrls, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    handleFiles(Array.from(e.target.files));
  }, [handleFiles]);

  const handleDelete = useCallback((index: number) => {
    const newUrls = [...data.imageUrls];
    newUrls.splice(index, 1);
    onChange({ imageUrls: newUrls });
  }, [data.imageUrls, onChange]);

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
    
    onChange({ imageUrls: newUrls });
  }, [data.imageUrls, onChange]);
  
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  }, []);

  // Add validation for minimum required photos
  useEffect(() => {
    const hasPhotos = data.imageUrls && data.imageUrls.length > 0;
    onError?.(hasPhotos ? null : 'Debe subir al menos una foto');
    
    // Cleanup error when component unmounts
    return () => {
      onError?.(null);
    };
  }, [data.imageUrls, onError]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium">Fotos de la propiedad</h2>
      
      {/* Show a message if no photos */}
      {(!data.imageUrls || data.imageUrls.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Se requiere al menos una foto para continuar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 transition-all duration-200 relative
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50' : ''}
        `}
      >
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-600">Subiendo... {Math.round(uploadProgress)}%</p>
            </div>
          </div>
        )}

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
          <p className="mt-1 text-sm text-gray-500">PNG, JPG hasta 10MB</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
            disabled={isUploading}
          />
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {/* Image Grid */}
      {data.imageUrls && data.imageUrls.length > 0 && (
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
    </div>
  );
}

// Helper function for uploading images
async function uploadImages(files: File[], onProgress?: (progress: number) => void): Promise<string[]> {
  const storage = getStorage();
  const urls: string[] = [];

  for (const file of files) {
    const filename = `properties/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const url = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => reject(error),
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            reject(error);
          }
        }
      );
    });

    urls.push(url);
  }

  return urls;
}