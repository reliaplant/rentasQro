import { Timestamp } from 'firebase/firestore';

export interface ZoneData {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string; 
  createdAt?: Timestamp;
}

export interface CondoData {
  id?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  zoneId: string;
  status?: 'active' | 'inactive';
  amenities?: string[];
  imageUrls?: string[];
  logoUrl?: string | null;
  googlePlaceId?: string | null;
  googleRating?: number;
  totalRatings?: number;
  cachedReviews?: any[];
  reviewsLastUpdated?: Timestamp | null;
  selectedGoogleReviews?: string[];
  createdAt?: Timestamp;
  placeDetails?: {
    name?: string;
    formatted_address?: string;
    website?: string;
    photos?: any[];
  };
  imageAmenityTags?: {[key: string]: string[]};
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
  zone: string;
  condo: string;
  imageUrls: string[];
  propertyType: string; // 'casa', 'departamento', etc.
  price: number;
  transactionType: 'renta' | 'venta' | 'ventaRenta';
  descripcion: string;
  status: 'borrador' | 'publicada' | 'en_cierre' | 'vendida' | 'descartada';
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  constructionYear?: number | null; // Make it optional and nullable
  construccionM2?: number;
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
  maintenanceCost?: number;
  maintenanceIncluded?: boolean;
  furnished: boolean;
  servicesIncluded: boolean;
  includesWifi?: boolean;
  includesWater?:boolean;
  includesGas?:boolean;
  includesElectricity?:boolean;
  petsAllowed?: boolean;
  contratoMinimo?: number;  
  depositoRenta?: number;
  views: number;
  whatsappClicks: number;
}