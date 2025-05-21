import Link from 'next/link';
import { BiMap } from 'react-icons/bi';
import Image from 'next/image';
import { FaChevronRight, FaStar } from 'react-icons/fa';
import AdvisorModal from '@/app/components/AdvisorModal';
import GoogleMap from './GoogleMap';

interface HeaderProps {
    name: string;
    coverImage: string;
    description?: string;
    shortDescription?: string;
    logoUrl?: string | null;
    desarrolladoraName?: string;
    desarrolladoraDescripcion?: string;
    desarrolladoraLogoURL?: string;
    googlePlaceId?: string;
    formattedAddress?: string;
    googleRating?: number;
    totalRatings?: number;
}

export default function Header({
    name,
    coverImage,
    description,
    shortDescription,
    logoUrl,
    desarrolladoraName,
    desarrolladoraDescripcion,
    desarrolladoraLogoURL,
    googlePlaceId,
    formattedAddress,
    googleRating,
    totalRatings
}: HeaderProps) {
    return (
        <header className="">
            {/* Hero Section */}
            <section className="relative w-full bg-gradient-to-b from-[#FAF4E5] to-[#F0E0C7]">

                <div className="h-full flex flex-col justify-center items-center">
                    <div className="grid lg:grid-cols-2 items-stretch h-full">
                        {/* Texto principal - vertically centered */}
                        <div className="flex items-center justify-center order-2 lg:order-1 h-full">
                            <div className="w-full px-4 sm:px-[5vw] py-8 lg:py-16">
                                <div className="flex flex-col items-start">
                                    {/* Header with logo and titles in a row - logo overlaps on mobile */}
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6 relative">
                                        {/* Logo with negative top position to overlap on mobile */}
                                        {logoUrl && (
                                            <div className="border-gray-400/20 h-[100px] w-[100px] md:h-[140px] md:w-[140px] flex-shrink-0 relative -mt-24 md:mt-0 z-10">
                                                <Image
                                                    src={logoUrl}
                                                    alt={`${name} logo`}
                                                    fill
                                                    className="object-contain rounded-lg shadow-lg border-2 border-gray-400/20 bg-white/90"
                                                    priority
                                                    quality={90}
                                                />
                                            </div>
                                        )}

                                        {/* Titles */}
                                        <div>
                                            <h1 className="text-xl sm:text-3xl md:text-4xl font-light mb-1 text-gray-900 leading-tight">
                                                {name}
                                            </h1>
                                            {shortDescription && (
                                                <h2 className="text-lg sm:text-xl md:text-xl font-light !text-[#CA7644]">
                                                    {shortDescription}
                                                </h2>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {description && (
                                        <p className="text-sm sm:text-base md:text-md text-gray-600 font-light mb-3">
                                            {description}
                                        </p>
                                    )}

                                    {/* Google Rating - All in one row */}
                                    {googleRating && (
                                        <div className="flex items-center flex-wrap gap-2 mb-6 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FaStar className="text-yellow-500 text-base sm:text-lg" />
                                                <span className="font-medium text-base sm:text-lg">{googleRating.toFixed(1)}</span>
                                                {totalRatings && (
                                                    <span className="text-sm text-gray-500">
                                                        ({totalRatings} reseñas)
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-xs text-gray-500">según valoraciones de Google</span>

                                            {googlePlaceId && (
                                                <a
                                                    href={`https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:underline"
                                                >
                                                    ver reseñas
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Developer info - Hidden on mobile */}
                                    <div className="hidden lg:block mt-8">
                                        {desarrolladoraName && (
                                            <div className="flex items-start gap-4">
                                                {desarrolladoraLogoURL && (
                                                    <div className="h-16 flex-shrink-0">
                                                        <Image
                                                            src={desarrolladoraLogoURL}
                                                            alt={desarrolladoraName}
                                                            width={64}
                                                            height={64}
                                                            className="object-contain h-full w-full border border-gray-200 rounded"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-xs font-medium text-gray-500">Desarrollado por</h3>
                                                    <h4 className="text-lg font-semibold text-gray-900">{desarrolladoraName}</h4>
                                                    {desarrolladoraDescripcion && (
                                                        <p className="text-xs text-gray-600 mt-1">{desarrolladoraDescripcion}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Imagen */}
                        <div className="relative order-1 lg:order-2 lg:absolute lg:right-0 lg:top-0 lg:w-1/2 lg:h-full min-h-[300px] sm:min-h-[400px] h-full">
                            {/* Google Map - Hidden on mobile */}
                            <div className="hidden lg:block absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
                                {/* Google Map */}
                                <div className="h-[120px] w-[180px] md:h-[150px] md:w-[220px]">
                                    <GoogleMap
                                        googlePlaceId={googlePlaceId}
                                        formattedAddress={formattedAddress}
                                    />
                                </div>
                            </div>

                            <Image
                                src={coverImage}
                                alt={`${name} - Portada`}
                                fill
                                className="object-cover"
                                priority
                                quality={95}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </header>
    );
}
