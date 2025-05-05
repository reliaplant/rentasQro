'use client';

import Image from 'next/image';
import { Star, ArrowUpRight } from 'lucide-react';
import { Review } from '@/app/shared/interfaces';

interface ReviewsProps {
  condoName: string;
  googleRating?: number;
  totalRatings?: number;
  googlePlaceId?: string;
  cachedReviews?: Review[];
  selectedGoogleReviews?: string[]; // Add this to track selected reviews
  manualReviews?: Review[]; // Add this for manual reviews
}

export default function Reviews({
  condoName,
  googleRating = 0,
  totalRatings = 0,
  googlePlaceId,
  cachedReviews = [],
  selectedGoogleReviews = [], // Default to empty array
  manualReviews = [] // Default to empty array
}: ReviewsProps) {
  // Filter reviews to show only selected ones or all if none are selected
  const filteredReviews = cachedReviews.filter(review => 
    // If we have selected reviews, only show those
    selectedGoogleReviews.length === 0 || 
    selectedGoogleReviews.includes(review.time.toString())
  );

  // Combine filtered Google reviews with manual reviews
  const allReviews = [...filteredReviews, ...manualReviews];

  // If we have no reviews to show after filtering, return nothing
  if (allReviews.length === 0 && googleRating === 0) {
    return null;
  }

  return (
    <div className="px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Reseñas</h3>
        {googlePlaceId && (
          <a 
            href={`https://search.google.com/local/reviews?placeid=${googlePlaceId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-violet-600 hover:text-violet-800"
          >
            Ver en Google Maps
          </a>
        )}
      </div>

      {/* Rating Summary */}
      {googleRating > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= Math.round(googleRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">{googleRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({totalRatings} reseñas)</span>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {allReviews.map((review, index) => (
          <div 
            key={`${review.author_name}-${index}`}
            className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              {/* User Image */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative">
                {review.profile_photo_url ? (
                  <Image
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">
                    {review.author_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div>
                <p className="font-medium">{review.author_name}</p>
                <div className="flex items-center">
                  {/* Star Rating */}
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  
                  {/* Time */}
                  {review.relative_time_description && (
                    <span className="text-xs text-gray-500 ml-2">
                      {review.relative_time_description}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Review Text */}
            <p className="text-sm text-gray-600 line-clamp-4">
              {review.text}
            </p>
          </div>
        ))}
      </div>
      
      {/* Google Attribution */}
      {googlePlaceId && (
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-end">
          <span>Reseñas de </span>
          <Image
            src="/assets/google-logo.svg"
            alt="Google"
            width={50}
            height={20}
            className="ml-1"
          />
        </div>
      )}
    </div>
  );
}

const ReviewCard = ({ review, className = '' }: { review: Review; className?: string }) => (
  <div className={`bg-white rounded-lg md:rounded-xl p-4 md:p-6 ${className} md:shadow-[0_2px_6px_rgb(0,0,0,0.05)] shadow-md border border-gray-200`}>
    <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
      {review.profile_photo_url ? (
        <Image
          src={review.profile_photo_url}
          alt={review.author_name}
          width={32}
          height={32}
          className="rounded-full w-8 h-8 md:w-10 md:h-10"
        />
      ) : (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-violet-50 flex items-center justify-center">
          <span className="text-violet-600 font-medium text-xs md:text-sm">
            {review.author_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div>
        <p className="font-medium text-sm md:text-base">{review.author_name}</p>
        <div className="flex items-center text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < review.rating ? 'fill-yellow-400' : 'text-gray-200'}
            />
          ))}
          <span className="ml-1 md:ml-2 text-2xs md:text-xs text-gray-500">{review.relative_time_description}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-600 text-xs md:text-sm line-clamp-3 md:line-clamp-none">{review.text}</p>
  </div>
);
