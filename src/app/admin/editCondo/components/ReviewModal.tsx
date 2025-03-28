import { useState, useRef, useEffect } from 'react';
import { Star, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { Review } from '@/app/shared/interfaces';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Review) => void;
  editingReview?: Review;  // Add editing review prop
}

export default function ReviewModal({ isOpen, onClose, onSubmit, editingReview }: ReviewModalProps) {
  const [reviewData, setReviewData] = useState<Partial<Review>>({
    author_name: '',
    rating: 5,
    text: '',
    relative_time_description: 'Recientemente',
    time: Date.now(),
    customDate: new Date()
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when editing
  useEffect(() => {
    if (editingReview) {
      setReviewData({
        ...editingReview,
        customDate: new Date(editingReview.time)
      });
      if (editingReview.profile_photo_url) {
        setPhotoPreview(editingReview.profile_photo_url);
      }
    }
  }, [editingReview]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!reviewData.author_name || !reviewData.text) return;

    const newReview: Review = {
      ...reviewData,
      profile_photo_url: photoPreview || '',
      time: reviewData.customDate?.getTime() || Date.now(),
      rating: reviewData.rating || 5,
      relative_time_description: reviewData.customDate ? 
        new Date(reviewData.customDate).toLocaleDateString() : 
        'Recientemente'
    } as Review;

    onSubmit(newReview);
    onClose();

    // Reset form
    setReviewData({
      author_name: '',
      rating: 5,
      text: '',
      relative_time_description: 'Recientemente',
      time: Date.now(),
      customDate: new Date()
    });
    setPhotoFile(null);
    setPhotoPreview('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {editingReview ? 'Editar reseña' : 'Agregar reseña manual'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Add date picker */}
          <input
            type="datetime-local"
            value={reviewData.customDate ? 
              new Date(reviewData.customDate).toISOString().split('.')[0].slice(0, 16) : 
              new Date().toISOString().split('.')[0].slice(0, 16)
            }
            onChange={(e) => {
              const date = new Date(e.target.value);
              setReviewData(prev => ({
                ...prev,
                customDate: date,
                time: date.getTime()
              }));
            }}
            className="w-full rounded-lg border-gray-300 mb-4"
          />

          {/* Photo Upload */}
          <div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 relative overflow-hidden"
            >
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload size={24} className="text-gray-400" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Author Name */}
          <input
            type="text"
            value={reviewData.author_name}
            onChange={(e) => setReviewData(prev => ({ ...prev, author_name: e.target.value }))}
            placeholder="Nombre del autor"
            className="w-full rounded-lg border-gray-300"
            required
          />

          {/* Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                className="p-1"
              >
                <Star
                  size={24}
                  className={star <= (reviewData.rating || 5) ? "text-yellow-400 fill-current" : "text-gray-300"}
                />
              </button>
            ))}
          </div>

          {/* Review Text */}
          <textarea
            value={reviewData.text}
            onChange={(e) => setReviewData(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Escribe la reseña aquí"
            rows={4}
            className="w-full rounded-lg border-gray-300"
            required
          />

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reviewData.author_name || !reviewData.text}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {editingReview ? 'Guardar cambios' : 'Agregar reseña'}
          </button>
        </div>
      </div>
    </div>
  );
}