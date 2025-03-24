import { Star } from 'lucide-react';
import Image from 'next/image';
import { GoogleReview } from '@/app/interfaces';

interface ReviewsProps {
  reviews: GoogleReview[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-medium mb-6">Reseñas de Google</h3>
      <div className="grid gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={review.profile_photo_url}
                alt={review.author_name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{review.author_name}</p>
                <p className="text-sm text-gray-500">{review.relative_time_description}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span>{review.rating}</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}