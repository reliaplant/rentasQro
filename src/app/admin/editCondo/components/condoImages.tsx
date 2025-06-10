import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, X, SortAsc } from 'lucide-react';
import { condoAmenities } from '@/app/constants/amenities';

interface CondoImagesProps {
  previewUrls: string[];
  onImagesChange: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onReorderImages: (newOrder: string[]) => void;
  formData: any;
  onFormDataChange: (data: any) => void;
}

export default function CondoImages({ 
  previewUrls, 
  onImagesChange, 
  onRemoveImage,
  onReorderImages,
  formData,
  onFormDataChange 
}: CondoImagesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Better handling for different types of imageAmenityTags
  const [imageTags, setImageTags] = useState<Record<number, string>>({});
  
  // Initialize tags on mount and when formData changes
  useEffect(() => {
    console.log("formData tags:", formData.imageAmenityTags);
    
    // Initialize from formData
    if (formData.imageAmenityTags) {
      const newTags: Record<number, string> = {};
      
      // Check if tags are already index-based (numeric keys)
      const isIndexBased = Object.keys(formData.imageAmenityTags).some(key => !isNaN(Number(key)));
      
      if (isIndexBased) {
        // Direct copy for index-based tags
        Object.entries(formData.imageAmenityTags).forEach(([idx, tag]) => {
          newTags[Number(idx)] = tag as string;
        });
      } else {
        // Convert URL-based tags to index-based
        previewUrls.forEach((url, index) => {
          if (formData.imageAmenityTags[url]) {
            const tag = formData.imageAmenityTags[url];
            newTags[index] = Array.isArray(tag) ? tag[0] : tag;
          }
        });
      }
      
      console.log("Setting tags:", newTags);
      setImageTags(newTags);
    }
  }, [formData, previewUrls]);

  // Function to ensure we always maintain index-based tags
  useEffect(() => {
    if (previewUrls.length > 0) {
      // We need to ensure tags are always index-based
      const newImageTags: Record<number, string> = {};
      
      // First convert any existing tags
      if (formData.imageAmenityTags) {
        // Check if tags are already index-based
        const hasIndexBasedTags = Object.keys(formData.imageAmenityTags).some(
          key => !isNaN(parseInt(key))
        );

        if (hasIndexBasedTags) {
          // Already using index-based tags, preserve them
          Object.entries(formData.imageAmenityTags).forEach(([key, value]) => {
            if (!isNaN(parseInt(key))) {
              const index = parseInt(key);
              if (index < previewUrls.length) {
                const amenityId = Array.isArray(value) ? value[0] : value;
                newImageTags[index] = amenityId;
              }
            }
          });
        } else {
          // Convert URL-based tags to index-based
          previewUrls.forEach((url, index) => {
            if (url in formData.imageAmenityTags!) {
              const amenityId = formData.imageAmenityTags![url];
              const amenityIdString = Array.isArray(amenityId) ? amenityId[0] : amenityId;
              newImageTags[index] = amenityIdString;
            }
          });
        }
      }
      
      // Update form data with consistent index-based tags
      onFormDataChange({
        ...formData,
        imageAmenityTags: newImageTags
      });
    }
  }, [previewUrls.length]);

  // Sort images by their amenity tags
  const sortByAmenities = () => {
    // Create pairs of [url, tag] for sorting
    const urlsWithTags = previewUrls.map((url, index) => ({
      url,
      tag: imageTags[index] || 'general'
    }));
    
    // Sort by tag name
    const sorted = [...urlsWithTags].sort((a, b) => a.tag.localeCompare(b.tag));
    
    // Extract just the URLs in the new order
    const sortedUrls = sorted.map(item => item.url);
    
    // Create new imageTags object based on the new order
    const newImageTags: Record<number, string> = {};
    sorted.forEach((item, index) => {
      if (item.tag !== 'general') {
        newImageTags[index] = item.tag;
      }
    });
    
    // Update local state
    setImageTags(newImageTags);
    
    // Update parent state with new tags and order
    onReorderImages(sortedUrls);
    onFormDataChange({
      ...formData,
      imageAmenityTags: newImageTags
    });
  };

  // Handle tag change with more robust error handling
  const handleTagChange = (index: number, amenityId: string) => {
    console.log(`Changing tag for index ${index} to ${amenityId}`);
    
    // Create new tags object
    const newTags = { ...imageTags };
    
    if (amenityId === 'general') {
      // Remove the tag if it's set to general
      delete newTags[index];
    } else {
      // Set the tag
      newTags[index] = amenityId;
    }
    
    console.log("New tags:", newTags);
    
    // Update local state
    setImageTags(newTags);
    
    // Update parent component state
    onFormDataChange({
      ...formData,
      imageAmenityTags: newTags
    });
  };

  const handleRemoveImage = (index: number) => {
    // Remove from preview URLs
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Remap all image tags to account for the removed image
    const newImageTags: Record<number, string> = {};
    Object.keys(imageTags).forEach(idx => {
      const currentIdx = parseInt(idx);
      if (currentIdx < index) {
        // Indices before the deleted one stay the same
        newImageTags[currentIdx] = imageTags[currentIdx];
      } else if (currentIdx > index) {
        // Indices after the deleted one shift down by 1
        newImageTags[currentIdx - 1] = imageTags[currentIdx];
      }
      // The index itself gets removed
    });
    
    // Update parent state
    onFormDataChange({
      ...formData,
      imageUrls: newPreviewUrls,
      imageAmenityTags: newImageTags
    });

    // Notify parent component
    onRemoveImage(index);

    // Cleanup URL if it's a local preview
    if (previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Galería de Imágenes
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Sube fotos de las diferentes áreas del condominio y etiquétalas por tipo
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-gray-600">
            {previewUrls.length} {previewUrls.length === 1 ? 'imagen' : 'imágenes'} en la galería
          </p>
          <motion.button
            type="button"
            onClick={sortByAmenities}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200  flex items-center gap-2 transition-colors"
          >
            <SortAsc size={16} />
            Ordenar por amenidad
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
        {previewUrls.map((url, index) => {
          // Get the current tag for this image
          const currentTag = imageTags[index] || 'general';
          
          return (
            <motion.div 
              key={`${index}-${url.slice(-8)}`} 
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="relative aspect-[4/3] overflow-hidden border border-gray-200 group"
            >
              <Image
                src={url}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />

              <motion.button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={14} />
              </motion.button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-1 px-1">
                <select
                  value={currentTag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  className="w-full text-sm bg-white/20 text-white backdrop-blur-sm 
                  border border-white/30 py-1.5 px-3 appearance-none cursor-pointer
                  transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="general">✨ General</option>
                  {condoAmenities.map((amenity) => (
                    <option key={amenity.id} value={amenity.id}>
                      {amenity.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          );
        })}

        <motion.button

          onClick={() => fileInputRef.current?.click()}
          className="aspect-[4/3]  border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="rounded-full bg-gray-200 p-3 mb-2">
            <Plus className="h-6 w-6 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-600">Agregar imágenes</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
        </motion.button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onImagesChange(files);
          e.target.value = ''; // Reset input
        }}
      />
      
      <div className="mt-6 bg-blue-50  p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Consejo:</strong> Etiqueta tus imágenes según el área que muestran para organizar mejor la galería.
        </p>
      </div>
    </div>
  );
}