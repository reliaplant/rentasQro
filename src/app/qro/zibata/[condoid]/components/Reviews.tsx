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
    <div className="mt-2 md:mt-16 mt-8 md:bg-white bg-gray-50 md:p-0 p-8">
      <h3 className="text-xl font-semibold mb-6">Reseñas sobre {condoName}</h3>

      {/* Rating Overview - Mobile Only */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Star size={24} className="fill-yellow-400 text-yellow-400" />
            <div>
              <div className="text-2xl font-semibold">{googleRating}</div>
              <div className="text-sm text-gray-500">{totalRatings} reseñas</div>
            </div>
          </div>
          {googlePlaceId && (
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-800 flex flex-row items-center gap-1"
            >
              Ver en Google
              <ArrowUpRight size={24} className="text-black" />
            </a>
          )}
        </div>
      </div>

      {/* Reviews Display */}
      <div className="hidden md:grid grid-cols-1 gap-4">
        {cachedReviews?.slice(0, 3).map((review) => (
          <ReviewCard 
            key={review.time}
            review={review}
          />
        ))}
      </div>

      {/* Mobile Reviews */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory -mx-8 px-8 pb-4 gap-4 scrollbar-hide">
        {cachedReviews?.slice(0, 3).map((review) => (
          <ReviewCard 
            key={review.time}
            review={review}
            className="flex-shrink-0 w-[85vw] snap-center"
          />
        ))}
      </div>

      {(!cachedReviews || cachedReviews.length === 0) && (
        <p className="text-gray-500 italic">No hay reseñas disponibles</p>
      )}
    </div>
  );
}

const ReviewCard = ({ review, className = '' }: { review: Review; className?: string }) => (
  <div className={`bg-white rounded-xl p-6 ${className} md:shadow-[0_2px_6px_rgb(0,0,0,0.05)] shadow-lg border border-gray-200`}>
    <div className="flex items-center gap-3 mb-2">
      {review.profile_photo_url ? (
        <Image
          src={review.profile_photo_url}
          alt={review.author_name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
          <span className="text-violet-600 font-medium">
            {review.author_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div>
        <p className="font-medium">{review.author_name}</p>
        <div className="flex items-center text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < review.rating ? 'fill-yellow-400' : 'text-gray-200'}
            />
          ))}
          <span className="ml-2 text-xs text-gray-500">{review.relative_time_description}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-600 text-sm">{review.text}</p>
  </div>
);
