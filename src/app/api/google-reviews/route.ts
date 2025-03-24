import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  if (!placeId) return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });

  try {
    console.log('Fetching place data for:', placeId);
    
    // Use the Places API v1 with correct field mask for reviews
    const placeUrl = `https://places.googleapis.com/v1/places/${placeId}?languageCode=es`;
    
    // Important: Make sure 'reviews' is included in the field mask
    const response = await fetch(placeUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,formattedAddress,rating,userRatingCount,websiteUri,photos,reviews'
      }
    });
    
    if (!response.ok) {
      console.error('API error:', response.status, await response.text());
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Log full response structure for debugging
    console.log('API response keys:', Object.keys(data));
    console.log('Photos available:', data.photos?.length || 0);
    console.log('Reviews available:', data.reviews?.length || 0);
    
    if (data.reviews && data.reviews.length > 0) {
      // Log structure of first review
      console.log('First review structure:', JSON.stringify(data.reviews[0]).substring(0, 200) + '...');
    }
    
    // Extract text helper
    const extractText = (obj: any): string => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (obj.text) return obj.text;
      return '';
    };
    
    // Process reviews if available
    let processedReviews: any[] = [];
    if (data.reviews && data.reviews.length > 0) {
      // Get all reviews first
      const allReviews = data.reviews.map((review: any) => ({
        author_name: review.authorAttribution?.displayName || 'Anónimo',
        rating: review.rating || 0,
        relative_time_description: review.relativePublishTimeDescription || 'Recientemente',
        text: extractText(review.text),
        profile_photo_url: review.authorAttribution?.photoUri || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent((review.authorAttribution?.displayName || 'A'))}&background=random`,
        time: review.publishTime ? new Date(review.publishTime).getTime() : Date.now()
      }));
      
      // Filter for high ratings (4-5)
      interface ReviewAttribution {
        displayName: string;
        photoUri?: string;
      }

      interface GoogleReview {
        authorAttribution?: ReviewAttribution;
        rating: number;
        relativePublishTimeDescription?: string;
        text: string | { text: string };
        publishTime?: string;
      }

      interface ProcessedReview {
        author_name: string;
        rating: number;
        relative_time_description: string;
        text: string;
        profile_photo_url: string;
        time: number;
      }
      console.log(`High-rated reviews (4-5 stars): ${processedReviews.length} out of ${allReviews.length}`);
      
      // If no high reviews, use all reviews
      if (processedReviews.length === 0) {
        console.log('No high-rated reviews, using all reviews');
        processedReviews = allReviews;
      }
    }
    
    // Convert photo references to URLs
    const photoUrls = data.photos?.map((photo: any) => 
      `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxHeightPx=800`
    ) || [];
    
    // Final result object
    const result = {
      result: {
        rating: data.rating || 0,
        user_ratings_total: data.userRatingCount || 0,
        reviews: processedReviews,
        placeDetails: {
          name: extractText(data.displayName),
          formatted_address: data.formattedAddress || '',
          website: data.websiteUri || '',
          photos: photoUrls
        },
        filteredCount: processedReviews.length
      }
    };
    
    console.log('Final processed reviews count:', processedReviews.length);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Google Places API:', error);
    return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
  }
}