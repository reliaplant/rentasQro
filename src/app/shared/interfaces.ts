import { Timestamp } from 'firebase/firestore';

export interface ZoneData {
  id?: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  description?: string; // Añadimos este campo
  imageUrl?: string;
  createdAt?: any; // Puedes usar Timestamp de Firebase si lo prefieres
  condominiums?: any[]; // Puedes especificar CondoData[] si lo necesitas
}

export interface CondoData {
  id?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  zoneId: string;
  zoneName: string;
  qualityLevel?: 'high' | 'medium' | 'low'; // New property for quality level
  polygonId?: string; // Nuevo campo para identificar el polígono en el mapa
  polygonPath?: string;
  rentPriceMin?: number;
  rentPriceAvg?: number;
  rentPriceMax?: number;
  salePriceMin?: number;
  salePriceAvg?: number;
  salePriceMax?: number;
  priceMin?: number;
  priceAvg?: number;
  priceMax?: number;
  status?: 'active' | 'inactive';
  amenities?: string[];
  imageUrls?: string[];
  logoUrl?: string | null;
  portada?: string; // Field for cover image
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
  streetViewImage?: string;
  streetViewLink?: string;
  manualReviews?: Review[];
  desarrolladoraLogoURL?: string;
  desarrolladoraDescripcion?: string;
  desarrolladoraName?: string;
  desarrolladoraId: string;
  coordX?: number; // Coordenadas X para el mapa
  coordY?: number; // Coordenadas Y para el mapa
}

export interface Desarrolladora {
  id?: string;
  name: string;
  logoURL?: string;
  descripcion?: string;
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
  propertyCondoNumber?: string; // Número de propiedad dentro del condominio
  propertyCondoNumberPhoto?: string; // Número de propiedad dentro del condominio
  zone: string;
  condo: string;  // ID del condominio
  condoName: string;  // Nombre del condominio
  imageUrls: string[];
  propertyType: string; // 'casa', 'departamento', etc.
  price: number;
  transactionType: 'renta' | 'venta'
  descripcion: string;
  status: 'borrador' | 'publicada' | 'en_cierre' | 'vendida' | 'descartada';
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  constructionYear?: number | null; // Make it optional and nullable
  construccionM2?: number;
  terrenoM2?: number; // Add this field
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
  isDummy?: boolean; // Added for dummy properties
  asesorAliado?: string; // Added for allied advisor
  porcentajePizo?: number; // Added for Pizo percentage
  comision?: number; // Added for commission
  modelo?: string; // Added for model
}

export interface resumenCondo{
  condoId: string;
  condoName: string;
  coordX: number;
  coordY: number;
  propiedadesEnRenta: number;
  propiedadesEnVenta: number;
  propiedadesRentaResumen?: any[]; // Add this property
  propiedadesVentaResumen?: any[]; // Add this property
  rentPriceMin: number;
  rentPriceMax: number;
  salePriceMin: number;
  salePriceMax: number;
}

export interface negocio{
  id?: string;
  propiedadId: string;
  propertyType: string; // 'casa', 'departamento', etc.
  condoName: string;  // Nombre del condominio
  transactionType: 'renta' | 'venta' | 'ventaRenta';
  price: number;
  comision: number;
  asesorAliado?: string; // Added for allied advisor
  porcentajePizo?: number; // Added for Pizo percentage
  estatus: "form" | "propuesta" | "evaluación" | "comercialización" | "congeladora" | "cerrada" | "cancelada";
  fechaCreacion: Timestamp;
  fechaCierre?: Timestamp;
  vigenciaEnDias?: number;
  dormido?: boolean;
  fechaDormido?: Timestamp;
  dormidoHasta?: Timestamp | null; // Updated to allow null values
  notas?: string;
  souurce?: string;
  campaign?: string;
  medium?: string;
  origenTexto: string;
  origenUrl: string;
  asesor: string;
  nombreCompleto?: string;
  telefono?: string;
  correo?: string;
}
