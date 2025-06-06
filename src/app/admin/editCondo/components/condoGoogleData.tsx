import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Globe, RefreshCw, Pencil, Trash } from 'lucide-react';
import { CondoData, Review } from '@/app/shared/interfaces';
import ReviewModal from './ReviewModal';
import { doc, updateDoc } from 'firebase/firestore';
import { db, updateCondoReviews, getCondoById } from '@/app/shared/firebase';
import Image from 'next/image';

interface CondoGoogleDataProps {
  id: string;
  formData: Partial<CondoData>;
  onFormDataChange: (data: Partial<CondoData>) => void;
}

export default function CondoGoogleData({ id, formData, onFormDataChange }: CondoGoogleDataProps) {
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const streetViewInputRef = useRef<HTMLInputElement>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load reviews when the component mounts if we have a valid Google Place ID
  useEffect(() => {
    const loadReviewsOnMount = async () => {
      if (
        id && 
        id !== 'new' && 
        formData.googlePlaceId && 
        (!formData.cachedReviews || formData.cachedReviews.length === 0) &&
        !initialLoadComplete
      ) {
        console.log('Loading reviews for condo on mount:', id);
        setIsLoadingReviews(true);
        try {
          await updateCondoReviews(id);
          const updatedCondo = await getCondoById(id);
          if (updatedCondo) {
            console.log('Loaded reviews from Google:', updatedCondo.cachedReviews?.length || 0);
            onFormDataChange({
              ...formData,
              ...updatedCondo
            });
          }
        } catch (error) {
          console.error('Error loading reviews on mount:', error);
          setReviewError('Error al cargar las reseñas automáticamente');
        } finally {
          setIsLoadingReviews(false);
          setInitialLoadComplete(true);
        }
      } else {
        setInitialLoadComplete(true);
      }
    };

    loadReviewsOnMount();
  }, [id, formData.googlePlaceId, initialLoadComplete]);

  const handleStreetViewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onFormDataChange({
          ...formData,
          streetViewImage: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add coordinate handling functions
  const handleCoordXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onFormDataChange({
      ...formData,
      coordX: value
    });
  };

  const handleCoordYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onFormDataChange({
      ...formData,
      coordY: value
    });
  };

  const handleDeleteReview = (reviewToDelete: Review) => {
    onFormDataChange({
      ...formData,
      manualReviews: formData.manualReviews?.filter(r => 
        r.time !== reviewToDelete.time || r.author_name !== reviewToDelete.author_name
      )
    });
  };

  const handleEditReview = (review: Review) => {
    setEditingReview({
      ...review,
      customDate: new Date(review.time)
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSelection = async (reviewTime: string, checked: boolean) => {
    try {
      const currentSelected = formData.selectedGoogleReviews || [];
      const newSelected = checked 
        ? [...currentSelected, reviewTime]
        : currentSelected.filter(time => time !== reviewTime);

      await updateDoc(doc(db, "condominiums", id), {
        selectedGoogleReviews: newSelected
      });

      onFormDataChange({
        ...formData,
        selectedGoogleReviews: newSelected
      });
    } catch (error) {
      console.error('Error updating selected reviews:', error);
    }
  };

  const handleRefreshReviews = async () => {
    if (!id || id === 'new') {
      setReviewError('Guarde primero el condominio');
      return;
    }
    if (!formData.googlePlaceId) {
      setReviewError('Se requiere un Google Place ID');
      return;
    }
    
    setIsLoadingReviews(true);
    setReviewError(null);
    try {
      console.log('Refreshing reviews for Place ID:', formData.googlePlaceId);
      // First ensure the googlePlaceId is saved
      await updateDoc(doc(db, "condominiums", id), {
        googlePlaceId: formData.googlePlaceId
      });
      
      // Then update the reviews
      await updateCondoReviews(id);
      
      // Get the updated data
      const updatedCondo = await getCondoById(id);
      if (updatedCondo) {
        console.log('Fresh reviews loaded:', updatedCondo.cachedReviews?.length || 0);
        onFormDataChange({
          ...formData,
          ...updatedCondo
        });
      } else {
        throw new Error('No se pudo obtener los datos actualizados');
      }
    } catch (error) {
      console.error('Error refreshing reviews:', error);
      setReviewError('Error al obtener datos de Google Places');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Function to render review stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < rating ? '#FBBF24' : 'none'}
            stroke={i < rating ? '#FBBF24' : '#D1D5DB'}
            className="mr-0.5"
          />
        ))}
      </div>
    );
  };

  // Function to render profile photo
  const renderProfilePhoto = (photoUrl: string | undefined, name: string) => {
    if (photoUrl) {
      return (
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
          {name?.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Google Place ID Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Información de Google
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Conecta tu condominio con los datos de Google Maps
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Place ID
          </label>
          <div className="flex">
            <input
              type="text"
              value={formData.googlePlaceId || ''}
              onChange={(e) => onFormDataChange({ ...formData, googlePlaceId: e.target.value })}
              className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: ChIJN1t_tDeuEmsRUsoyG83frY4"
            />
            <button
              type="button"
              onClick={handleRefreshReviews}
              disabled={isLoadingReviews || !formData.googlePlaceId || id === 'new'}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoadingReviews ? (
                <RefreshCw size={16} className="animate-spin mr-2" />
              ) : (
                <RefreshCw size={16} className="mr-2" />
              )}
              <span>Obtener datos</span>
            </button>
          </div>
          {reviewError && (
            <p className="mt-2 text-sm text-red-600">{reviewError}</p>
          )}
          <p className="mt-2 text-xs text-gray-500 flex items-center">
            <Globe size={12} className="mr-1" />
            Obtén el ID desde la URL de Google Maps o la API de Google Places
          </p>
        </div>
      </div>

      {/* Loading indicator for initial load */}
      {!initialLoadComplete && (
        <div className="flex justify-center items-center py-8">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          <span className="ml-2 text-blue-500">Cargando reseñas...</span>
        </div>
      )}

      {/* Place Details */}
      {formData.placeDetails && (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Datos de Google Maps</h4>
          <div className="space-y-3">
            <p className="flex items-center text-sm">
              <span className="mr-2">📍</span>
              <span><strong>Nombre oficial:</strong> {formData.placeDetails.name}</span>
            </p>
            <p className="flex items-center text-sm">
              <MapPin size={16} className="mr-2" />
              <span><strong>Dirección:</strong> {formData.placeDetails.formatted_address}</span>
            </p>
            {formData.placeDetails.website && (
              <p className="flex items-center text-sm">
                <Globe size={16} className="mr-2" />
                <a href={formData.placeDetails.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-500 hover:underline">
                  {formData.placeDetails.website}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Map Section */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-2">Mapa</h4>
        {formData.googlePlaceId ? (
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=place_id:${formData.googlePlaceId}&language=es`}
            />
          </div>
        ) : (
          <div className="h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-center">
              Ingresa un Google Place ID para ver el mapa
            </p>
          </div>
        )}
      </div>

      {/* Street View Section */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800 mb-2">Vista de calle</h4>
        <div 
          className="h-48 rounded-lg overflow-hidden border border-gray-200 relative group cursor-pointer"
          onClick={() => streetViewInputRef.current?.click()}
        >
          {formData.streetViewImage ? (
            <>
              <Image
                src={formData.streetViewImage}
                alt="Vista de calle"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white px-3 py-1 bg-black/50 rounded-lg text-sm opacity-0 group-hover:opacity-100">
                  Cambiar imagen
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MapPin size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Agregar imagen de vista de calle</p>
              </div>
            </div>
          )}
        </div>
        <input
          ref={streetViewInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleStreetViewImageChange}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enlace de Google Street View
          </label>
          <input
            type="url"
            value={formData.streetViewLink || ''}
            onChange={(e) => onFormDataChange({ ...formData, streetViewLink: e.target.value })}
            className="w-full rounded-lg border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://goo.gl/maps/..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Agrega un enlace directo a la vista de calle en Google Maps
          </p>
        </div>
      </div>

      {/* Coordinate Section */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800 mb-2">Coordenadas del Mapa</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordenada X (Longitud)
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.coordX !== undefined ? formData.coordX : ''}
              onChange={handleCoordXChange}
              className="w-full rounded-lg border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-100.353529"
            />
            <p className="mt-1 text-xs text-gray-500">
              Longitud para ubicar el condominio en el mapa
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordenada Y (Latitud)
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.coordY !== undefined ? formData.coordY : ''}
              onChange={handleCoordYChange}
              className="w-full rounded-lg border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="20.684225"
            />
            <p className="mt-1 text-xs text-gray-500">
              Latitud para ubicar el condominio en el mapa
            </p>
          </div>
        </div>
      </div>

      {/* Google Reviews Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Reseñas de Google
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              {formData.selectedGoogleReviews?.length || 0} reseñas seleccionadas
            </p>
            {formData.googlePlaceId && (
              <button
                onClick={handleRefreshReviews}
                disabled={isLoadingReviews || id === 'new'}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoadingReviews ? "animate-spin" : ""} />
                <span>Actualizar</span>
              </button>
            )}
          </div>
        </div>

        {/* Reviews info box */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-600">
              Selecciona las reseñas de Google que quieres mostrar en tu página. Las reseñas seleccionadas aparecerán en tu sitio web.
            </p>
            {formData.reviewsLastUpdated && (
              <p className="text-xs text-gray-500">
                Última actualización: {new Date(formData.reviewsLastUpdated.toDate()).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-3">
          {isLoadingReviews ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw size={24} className="animate-spin text-blue-500" />
              <span className="ml-2 text-blue-500">Cargando reseñas...</span>
            </div>
          ) : (
            <>
              {formData.cachedReviews?.map((review, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.selectedGoogleReviews?.includes(review.time.toString()) || false}
                      onChange={(e) => handleReviewSelection(review.time.toString(), e.target.checked)}
                      className="mt-1 h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {renderProfilePhoto(review.profile_photo_url, review.author_name)}
                        <div>
                          <div className="font-medium">{review.author_name}</div>
                          <div className="flex items-center gap-2">
                            {renderRatingStars(review.rating)}
                            <span className="text-xs text-gray-500">
                              {review.relative_time_description}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.cachedReviews || formData.cachedReviews.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No hay reseñas disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Actualiza las reseñas o agrega una manualmente
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Manual Reviews Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Reseñas Manuales
          </h3>
          <button
            onClick={() => {
              setEditingReview(undefined);
              setIsReviewModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Agregar reseña
          </button>
        </div>

        <div className="space-y-3">
          {formData.manualReviews?.map((review, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  {renderProfilePhoto(review.profile_photo_url, review.author_name)}
                  <div>
                    <p className="font-medium">{review.author_name}</p>
                    <div className="flex items-center">
                      {renderRatingStars(review.rating)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {review.relative_time_description || new Date(review.time).toLocaleDateString()}
              </p>
              <p className="mt-2 text-gray-600">{review.text}</p>
            </div>
          ))}

          {(!formData.manualReviews || formData.manualReviews.length === 0) && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No hay reseñas manuales</p>
              <p className="text-sm text-gray-400 mt-1">
                Agrega reseñas personalizadas para mostrar en tu sitio
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(undefined);
        }}
        onSubmit={(review) => {
          if (editingReview) {
            onFormDataChange({
              ...formData,
              manualReviews: formData.manualReviews?.map(r =>
                r.id === editingReview.id ? { ...review, id: r.id } : r
              )
            });
          } else {
            onFormDataChange({
              ...formData,
              manualReviews: [...(formData.manualReviews || []), { ...review, id: Date.now().toString() }]
            });
          }
          setIsReviewModalOpen(false);
          setEditingReview(undefined);
        }}
        editingReview={editingReview}
      />
    </div>
  );
}