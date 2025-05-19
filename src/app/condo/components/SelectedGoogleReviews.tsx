import React from 'react';
import { Review } from '@/app/shared/interfaces';

interface SelectedGoogleReviewsProps {
  reviews: Review[];
  selectedReviewIds: string[];
}

export default function SelectedGoogleReviews({ reviews, selectedReviewIds }: SelectedGoogleReviewsProps) {
  // Filter reviews to only show those with IDs in selectedReviewIds
  const filteredReviews = reviews.filter(review => 
    selectedReviewIds?.includes(review.id || '')
  );

  if (!filteredReviews.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No hay reseñas seleccionadas para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredReviews.map((review, index) => (
        <div key={review.id || index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start">
            {review.profile_photo_url && (
              <img 
                src={review.profile_photo_url} 
                alt={review.author_name}
                className="w-10 h-10 rounded-full mr-3" 
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">{review.author_name}</h4>
                <span className="text-sm text-gray-500">{review.relative_time_description}</span>
              </div>
              
              <div className="flex items-center mt-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-700 text-sm">{review.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
