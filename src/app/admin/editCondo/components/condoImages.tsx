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
  const [imageTags, setImageTags] = useState<Record<string, string>>(
    formData.imageAmenityTags || {}
  );

  // Sync image tags when formData changes
  useEffect(() => {
    if (formData.imageAmenityTags) {
      setImageTags(formData.imageAmenityTags);
    }
  }, [formData.imageAmenityTags]);

  const sortByAmenities = () => {
    const sorted = [...previewUrls].sort((a, b) => {
      const tagA = imageTags[a] || 'general';
      const tagB = imageTags[b] || 'general';
      return tagA.localeCompare(tagB);
    });
    onReorderImages(sorted);
  };

  const handleTagChange = (url: string, amenityId: string) => {
    // Create new tags object with the updated tag
    const newTags = {
      ...imageTags,
      [url]: amenityId || 'general'
    };

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
    
    // Remove from image tags
    const removedUrl = previewUrls[index];
    const newImageTags = { ...imageTags };
    delete newImageTags[removedUrl];

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
        {previewUrls.map((url, index) => (
          <motion.div 
            key={url} 
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="relative aspect-[4/3]  overflow-hidden border border-gray-200 group"
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
                value={imageTags[url] || 'general'}
                onChange={(e) => handleTagChange(url, e.target.value)}
                className="w-full text-sm bg-white/20 text-white backdrop-blur-sm 
                border border-white/30  py-1.5 px-3 appearance-none cursor-pointer
                transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="general">✨ General</option>
                {condoAmenities.map((amenity) => (
                  <option key={amenity.id} value={amenity.id}>
                    {amenity.icon} {amenity.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        ))}

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