'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaChevronLeft, FaChevronRight, FaBed, FaBath, FaHome } from 'react-icons/fa';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';
import type { PropertyData } from '@/app/shared/interfaces';

// Function to determine image loading priority
const getImagePriority = (propertyIndex: number, imageIndex: number) => {
  // The first 5-10 properties (depending on screen size) are prioritized
  const isPriorityProperty = propertyIndex < 10;
  
  // Only the first image of each priority property loads with priority
  const isPriorityImage = imageIndex === 0;
  
  return isPriorityProperty && isPriorityImage;
};

interface PropertyCardProps {
  property: PropertyData;
  index: number;
  currency?: 'MXN' | 'USD';
  linkTo?: string;
  className?: string;
  showAsFavorite?: boolean;
  transactionOverride?: 'renta' | 'venta';
  type?: 'default' | 'compact' | 'featured';
  size?: 'default' | 'large';
  openInNewTab?: boolean;
  onFavoriteClick?: (id: string) => void; // Add this new prop for custom favorite action
}

export default function PropertyCard({ 
  property, 
  index, 
  currency = 'MXN',
  linkTo,
  className = '',
  showAsFavorite,
  transactionOverride,
  type = 'default',
  size = 'default',
  openInNewTab = false,
  onFavoriteClick
}: PropertyCardProps) {
  // Add favorites functionality
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isFav, setIsFav] = useState(showAsFavorite || false);
  const { convertMXNtoUSD } = useExchangeRate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Initialize favorite state when component mounts
  useEffect(() => {
    if (property.id && !showAsFavorite) {
      setIsFav(isFavorite(property.id));
    }
  }, [property.id, isFavorite, showAsFavorite]);
  
  // Handle favorite button click
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (property.id) {
      // If custom handler provided, use it instead of the default toggle
      if (onFavoriteClick) {
        onFavoriteClick(property.id);
      } else {
        toggleFavorite(property.id);
      }
      setIsFav(!isFav);
    }
  };

  const maxImages = property.imageUrls ? Math.min(property.imageUrls.length, 5) : 1;

  const formatPropertyType = (type: string) => {
    if (type === 'departamento') return 'Depa';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get property price in the selected currency
  const getDisplayPrice = () => {
    if (currency === 'USD') {
      return convertMXNtoUSD(property.price);
    }
    return property.price;
  };

  // Handle image navigation
  const navigateImage = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (direction === 'prev') {
      // If we're at the first image and going back, go to the last
      setCurrentImageIndex(currentImageIndex === 0 ? maxImages - 1 : currentImageIndex - 1);
    } else {
      // If we're at the last image and going forward, go to the first
      setCurrentImageIndex(currentImageIndex === maxImages - 1 ? 0 : currentImageIndex + 1);
    }
  };

  // Determine the href for the property link
  const href = linkTo || `/propiedad/${property.id}`;

  // Determine transaction type - use override if provided
  const displayTransactionType = transactionOverride || property.transactionType;

  // Determine size-based classes
  const sizeClasses = {
    badgeText: size === 'large' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs',
    titleText: size === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
    subtitleText: size === 'large' ? 'text-sm' : 'text-xs sm:text-sm',
    detailsText: size === 'large' ? 'text-sm' : 'text-xs sm:text-sm',
    priceText: size === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
    iconSize: size === 'large' ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4',
    spacing: size === 'large' ? 'gap-3' : 'gap-2 sm:gap-3',
    padding: size === 'large' ? 'pt-3 sm:pt-4' : 'pt-2 sm:pt-3'
  };

  // Wrap the card content in Link if linkTo is provided
  const cardContent = (
    <div className="group block">
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden">
        {/* Combined transaction type and preventa badge */}
        <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 z-20">
          <span className={`bg-white/90 backdrop-blur-sm text-gray-800 ${sizeClasses.badgeText} font-medium px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm`}>
            {property.preventa 
              ? 'Preventa' 
              : displayTransactionType === 'renta' 
                ? 'En renta' 
                : 'En venta'}
          </span>
        </div>

        {/* Favorite button with hover effect */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 transition-all duration-200 cursor-pointer group/btn"
          aria-label={isFav ? "Eliminar de favoritos" : "Añadir a favoritos"}
        >
          <FaHeart className={`${sizeClasses.iconSize} ${isFav ? "text-pink-500" : "text-gray-400"} group-hover/btn:text-pink-500 transition-colors duration-200`} />
        </button>

        {/* Image container with hover darkening overlay */}
        <div className="aspect-[16/12] relative bg-gray-100 overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out w-full h-full"
            style={{ 
              transform: `translateX(-${currentImageIndex * 100}%)`,
            }}
          >
            {property.imageUrls?.slice(0, 5).map((url, imageIndex) => {
              const shouldPrioritize = getImagePriority(index, imageIndex);
              
              return (
                <div key={imageIndex} className="flex-shrink-0 w-full h-full relative">
                  <Image 
                    src={url || '/placeholder.jpg'} 
                    alt={`${property.descripcion || 'Imagen de propiedad'} ${imageIndex + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 17vw, 15vw"
                    priority={shouldPrioritize}
                    loading={shouldPrioritize ? 'eager' : 'lazy'}
                    className="object-cover rounded-lg"
                    quality={imageIndex === 0 ? 80 : 40}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0M/d5DwAChQGFAyGkvgAAAABJRU5ErkJggg=="
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
              );
            })}
          </div>
          {/* Hover darkening overlay - no transition */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 z-10 pointer-events-none"></div>
          {/* Gradient overlay for dots visibility */}
          <div className="rounded-lg absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/30 to-transparent z-15"></div>
          
          {/* Navigation buttons - only visible on hover if multiple images */}
          {maxImages > 1 && (
            <>
              <button 
                onClick={(e) => navigateImage(e, 'prev')}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
              >
                <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800" />
              </button>
              <button 
                onClick={(e) => navigateImage(e, 'next')}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-white z-20"
              >
                <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-800" />
              </button>
            </>
          )}

          {/* Position indicators */}
          {maxImages > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20">
              {[...Array(maxImages)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property information */}
        <div className={`${sizeClasses.padding} space-y-0.5 sm:space-y-1`}>
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="flex flex-wrap items-center">
                <h3 className={`font-medium ${sizeClasses.titleText} text-gray-900 truncate`}>
                  {formatPropertyType(property.propertyType)} en {property.condoName}
                </h3>
                {property.modelo && (
                  <span className={`ml-1.5 bg-violet-100 text-violet-700 ${sizeClasses.subtitleText} font-medium px-1.5 py-0.5 rounded-md`}>
                    {property.modelo}
                  </span>
                )}
              </div>
              <p className={`${sizeClasses.subtitleText} text-gray-500 truncate`}>
                {property.zone === 'X5oWujYupjRKx0tF8Hlj' ? 'Zibatá' : property.zone || 'Zona no especificada'}
              </p>
              
              {/* Show different metrics based on property type */}
              {property.propertyType === 'terreno' ? (
                <div className={`flex items-center ${sizeClasses.spacing} ${sizeClasses.detailsText} text-gray-500 mt-0.5 sm:mt-1`}>
                  <span>{property.terrenoM2 || 0}m² terreno</span>
                  {(property.construccionM2 ?? 0) > 0 && (
                    <>
                      <span>•</span>
                      <span>{property.construccionM2}m² construcción</span>
                    </>
                  )}
                </div>
              ) : (
                <div className={`flex flex-wrap items-center ${sizeClasses.spacing} ${sizeClasses.detailsText} text-gray-500 mt-0.5 sm:mt-1`}>
                  <div className="flex items-center">
                    <FaBed className={`mr-1 text-gray-400 ${size === 'large' ? 'w-4 h-4' : ''}`} />
                    <span>{property.bedrooms}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <FaBath className={`mr-1 text-gray-400 ${size === 'large' ? 'w-4 h-4' : ''}`} />
                    <span>{property.bathrooms}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <FaHome className={`mr-1 text-gray-400 ${size === 'large' ? 'w-4 h-4' : ''}`} />
                    <span>{property.construccionM2}m²</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price section - removed extra padding to maintain consistent spacing */}
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className={`font-semibold ${sizeClasses.priceText} text-black`}>
              {currency === 'USD' ? '$' : '$'}
              {getDisplayPrice().toLocaleString(undefined, {
                minimumFractionDigits: currency === 'USD' ? 0 : 0,
                maximumFractionDigits: currency === 'USD' ? 0 : 0
              })}
            </span>
            <span className={`${sizeClasses.detailsText} text-gray-500`}>
              {currency} {displayTransactionType === 'renta' ? '/mes' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // If linkTo is provided, wrap the card in a Link
  if (href) {
    return (
      <Link 
        href={href} 
        className={`cursor-pointer mb-2 sm:mb-4 ${className}`}
        target={openInNewTab ? "_blank" : undefined} 
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {cardContent}
      </Link>
    );
  }

  // Otherwise just return the card content
  return <div className={className}>{cardContent}</div>;
}
