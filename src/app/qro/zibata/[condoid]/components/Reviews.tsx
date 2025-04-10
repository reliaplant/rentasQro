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
}

export default function Reviews({ condoName, googleRating, totalRatings, googlePlaceId, cachedReviews }: ReviewsProps) {
  return (
    <div className="mt-2 md:mt-16 mb-8 md:mt-8 md:bg-white md:p-0 p-4">
      <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Reseñas sobre {condoName}</h3>

      {/* Rating Overview - Mobile Only */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg mb-3">
          <div className="flex items-center gap-2">
            <Star size={18} className="fill-yellow-400 text-yellow-400" />
            <div>
              <div className="text-xl font-semibold">{googleRating}</div>
              <div className="text-2xs text-gray-500">{totalRatings} reseñas</div>
            </div>
          </div>
          {googlePlaceId && (
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xs text-gray-600 hover:text-gray-800 flex flex-row items-center gap-1"
            >
              Ver en Google
              <ArrowUpRight size={18} className="text-black" />
            </a>
          )}
        </div>
      </div>

      {/* Reviews Display - Desktop */}
      <div className="hidden md:grid grid-cols-1 gap-4">
        {cachedReviews?.slice(0, 3).map((review) => (
          <ReviewCard 
            key={review.time}
            review={review}
          />
        ))}
      </div>

      {/* Mobile Reviews - Changed to grid/column layout instead of horizontal scroll */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {cachedReviews?.slice(0, 3).map((review) => (
          <ReviewCard 
            key={review.time}
            review={review}
          />
        ))}
      </div>

      {(!cachedReviews || cachedReviews.length === 0) && (
        <p className="text-gray-500 italic text-sm">No hay reseñas disponibles</p>
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
