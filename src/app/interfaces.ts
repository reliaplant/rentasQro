import { Timestamp } from 'firebase/firestore';

export interface ZoneData {
    id?: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    imageUrl: string;
    createdAt?: Timestamp;
    condominiums?: CondoData[];
  }
  
  export interface CondoData {
    id?: string;
    name: string;
    description: string;
    shortDescription: string;
    amenities: string[];
    status: string;
    zoneId?: string;
    imageUrls: string[];
    logoUrl?: string;
    googlePlaceId?: string;
    googleRating?: number;
    totalRatings?: number;
    filteredRatingCount?: number;
    cachedReviews?: Review[];
    manualReviews?: Review[];
    selectedGoogleReviews?: string[]; // Array of IDs/timestamps to track selected Google reviews
    placeDetails?: PlaceDetails;
    reviewsLastUpdated?: any; // Firestore Timestamp
    streetViewImage?: string;
    streetViewLink?: string;
    portada?: string; // URL of the cover image
    imageAmenityTags?: Record<string, string>; // Map of image URL to amenity ID
  }

  export interface CondoFormData {
    zoneId: string;
    condo?: CondoData;
    onClose: () => void;
    onSave: () => void;
  }

  export interface Review {
    id?: string;  // Add ID for editing/deleting
    author_name: string;
    rating: number;
    text: string;
    profile_photo_url?: string;
    time: number;
    relative_time_description: string;
    customDate?: Date;  // Add custom date field
  }

  export interface PlaceDetails {
    name: string;
    formatted_address: string;
    website?: string;
    photos?: string[];
  }

  export interface ImageWithTag {
    url: string;
    amenityId?: string;
  }

  export interface PropertyData {
    id?: string;
    advisor: string;
    createdAt?: Timestamp;
    publicationDate: Timestamp;
    privateComplex: string;
    zone: string;
    imageUrls: string[];
    propertyType: string; // 'casa', 'departamento', etc.
    price: number;
    transactionTypes: string[]; // 'venta', 'renta'
    status: 'borrador' | 'publicada' | 'en_cierre' | 'vendida' | 'descartada';


    //detalles
    descripcion: string;
    construccionM2?: number;
    constructionYear: number;
    bedrooms: number;
    bathrooms: number;
    parkingSpots: number;
    cuartoEstudio?: boolean;
    cuartoLavado?: boolean;   
    nivelesCasa?: number;
    pisoDepto?: number;
    balcon?: boolean;
    jardin?: boolean;
    roofGarden?: boolean;
    bodega?: boolean;    
    estadoConservacion?: 'nuevo' | 'como_nuevo' | 'remodelado' | 'aceptable' | 'requiere_reparaciones';
    calentadorAgua?: boolean;
    tipoGas?: 'estacionario' | 'natural' ;
    cocinaEquipada?: boolean;

    
    // Rent-specific
    maintenanceCost?: number;
    maintenanceIncluded?: boolean;
    furnished: boolean;
    includesWifi?: boolean;
    includesWater?:boolean;
    includesGas?:boolean;
    includesElectricity?:boolean;
    petsAllowed?: boolean;
    contratoMinimo?: number;  
    depositoRenta?: number;

    // Stats
    views: number;
    whatsappClicks: number;
  }