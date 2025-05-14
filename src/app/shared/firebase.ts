/**
 * OFFICIAL FIREBASE SERVICE
 * This is the single source of truth for Firebase functionality in the application.
 * Do not create duplicate Firebase service files.
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, increment, setDoc, limit, Query, DocumentData, orderBy, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, listAll } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User, fetchSignInMethodsForEmail } from "firebase/auth";
import { ZoneData, CondoData } from '@/app/shared/interfaces';
import { PropertyData, Desarrolladora } from '@/app/shared/interfaces';
import { BlogPost, BlogContributor } from '@/app/admin/blog-editor/types';

const firebaseConfig = {
  apiKey: "AIzaSyArhNxt2pZdMCGJwmoqV1PNWOIX7jN3oVQ",
  authDomain: "rentasqro-bc53f.firebaseapp.com",
  projectId: "rentasqro-bc53f",
  storageBucket: "rentasqro-bc53f.firebasestorage.app",
  messagingSenderId: "706566534125",
  appId: "1:706566534125:web:f4f298f0247c6bae28ede4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Authentication functions
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Add new function for real-time auth monitoring
export const onAuthStateChange = (callback: (user: User | null) => void): () => void => {
  return onAuthStateChanged(auth, callback);
};

// Add after existing interfaces
export interface AdvisorData {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  photo?: string;
  verified: boolean;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// export interface ZoneData {
//   id?: string;
//   name: string;
//   description?: string;
//   condominiums: CondoData[];
//   createdAt?: Timestamp;
// }

// export interface CondoData {
//   id?: string;
//   name: string;
//   description?: string;
//   zoneId: string;
//   amenities?: string[];
//   createdAt?: Timestamp;
// }

// Update uploadImages function with progress tracking
export const uploadImages = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const urls: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB

  try {
    for (const [index, file] of files.entries()) {
      // Validate file
      if (file.size > maxSize) {
        throw new Error(`La imagen ${file.name} excede el límite de 10MB`);
      }
      if (!file.type.startsWith('image/')) {
        throw new Error(`El archivo ${file.name} no es una imagen válida`);
      }

      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const storageRef = ref(storage, `properties/${filename}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const url = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const totalProgress = ((index + (snapshot.bytesTransferred / snapshot.totalBytes)) / files.length) * 100;
              onProgress(totalProgress);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (error) {
              reject(error);
            }
          }
        );
      });

      urls.push(url);
    }

    return urls;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Error al subir las imágenes');
  }
};

export const addProperty = async (propertyData: PropertyData): Promise<string> => {
  try {
    const dataToSave = {
      ...propertyData,
      createdAt: Timestamp.now(),
      publicationDate: Timestamp.now(),
      views: 0,
      whatsappClicks: 0
    };
    
    const docRef = await addDoc(collection(db, "properties"), dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error adding property: ", error);
    throw error;
  }
};

export const getProperties = async (): Promise<PropertyData[]> => {
  try {
    console.log("Fetching properties from Firebase...");
    const querySnapshot = await getDocs(collection(db, "properties"));
    const properties: PropertyData[] = [];
    
    console.log(`Found ${querySnapshot.size} documents in collection`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Property ${doc.id}:`, data);
      properties.push({ id: doc.id, ...data } as PropertyData);
    });
    
    console.log(`Returning ${properties.length} properties`);
    return properties;
  } catch (error) {
    console.error("Error fetching properties: ", error);
    throw error;
  }
};

export const getProperty = async (id: string): Promise<PropertyData> => {
  try {
    const docRef = doc(db, "properties", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Increment views
      await incrementPropertyViews(id);
      return { id: docSnap.id, ...docSnap.data() } as PropertyData;
    }
    throw new Error('Propiedad no encontrada');
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
};

// Merged updateProperty function - combines both implementations
export const updateProperty = async (id: string, propertyData: Partial<PropertyData>): Promise<boolean> => {
  try {
    const propertyRef = doc(db, "properties", id);
    const updateData = {
      ...propertyData,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(propertyRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

export const deleteProperty = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "properties", id));
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};

// Add new advisor functions
export const getAdvisorProfile = async (userId: string): Promise<AdvisorData | null> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "advisors"), where("userId", "==", userId))
    );
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AdvisorData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching advisor:", error);
    throw error;
  }
};

export const updateAdvisorProfile = async (
  userId: string, 
  data: Partial<AdvisorData>, 
  photoFile?: File
): Promise<void> => {
  try {
    let updateData = { ...data };
    
    if (photoFile) {
      const storageRef = ref(storage, `advisors/${userId}-${Date.now()}`);
      await uploadBytes(storageRef, photoFile);
      updateData.photo = await getDownloadURL(storageRef);
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, "advisors"), where("userId", "==", userId))
    );
    
    if (!querySnapshot.empty) {
      await updateDoc(querySnapshot.docs[0].ref, updateData);
    } else {
      await addDoc(collection(db, "advisors"), {
        userId,
        ...updateData,
        createdAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error("Error updating advisor:", error);
    throw error;
  }
};

export const getPropertiesByAdvisor = async (userId: string): Promise<PropertyData[]> => {
  try {
    const q = query(
      collection(db, "properties"),
      where("advisor", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const properties: PropertyData[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() } as PropertyData);
    });
    
    return properties;
  } catch (error) {
    console.error("Error fetching advisor properties:", error);
    throw error;
  }
};

// Add new functions for tracking
export const incrementPropertyViews = async (propertyId: string): Promise<void> => {
  try {
    const propertyRef = doc(db, "properties", propertyId);
    await updateDoc(propertyRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};

export const incrementWhatsappClicks = async (propertyId: string): Promise<void> => {
  try {
    console.log('Incrementing WhatsApp clicks for property:', propertyId);
    const propertyRef = doc(db, "properties", propertyId);
    await updateDoc(propertyRef, {
      whatsappClicks: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing WhatsApp clicks:", error);
    // Throw a more specific error
    throw new Error("Error al actualizar contador de WhatsApp");
  }
};

// Add new functions for zones and condos
export const addZone = async (zoneData: ZoneData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "zones"), {
      name: zoneData.name
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding zone:", error);
    throw error;
  }
};

export const updateZone = async (
  id: string, 
  data: Partial<ZoneData>
): Promise<void> => {
  try {
    await updateDoc(doc(db, "zones", id), {
      name: data.name
    });
  } catch (error) {
    console.error("Error updating zone:", error);
    throw error;
  }
};

export const getZones = async (): Promise<ZoneData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "zones"));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      name: doc.data().name 
    }));
  } catch (error) {
    console.error("Error fetching zones:", error);
    throw error;
  }
};


export const deleteZone = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "zones", id));
  } catch (error) {
    console.error("Error deleting zone:", error);
    throw error;
  }
};

export const addCondo = async (
  condoData: CondoData, 
  imageFiles: File[],
  logoFile?: File | null
): Promise<string> => {
  try {
    // Verificar los campos obligatorios
    if (!condoData.name || !condoData.zoneId) {
      throw new Error('El nombre y la zona del condominio son obligatorios');
    }
    
    // Subir imágenes y logo
    let imageUrls: string[] = [];
    let logoUrl: string | undefined;
    
    if (imageFiles && imageFiles.length > 0) {
      console.log(`Subiendo ${imageFiles.length} imágenes`);
      imageUrls = await uploadCondoImagesInternal(imageFiles);
      console.log('URLs de imágenes subidas:', imageUrls);
    }
    
    if (logoFile) {
      console.log('Subiendo logo');
      logoUrl = await uploadCondoLogo(logoFile);
      console.log('URL de logo:', logoUrl);
    }

    // Extract portada from condoData explicitly if it's a data URL
    let portadaUrl = condoData.portada;
    if (portadaUrl && portadaUrl.startsWith('data:image')) {
      console.log('Portada is a data URL, uploading to storage...');
      // Convert data URL to Blob and upload
      const response = await fetch(portadaUrl);
      const blob = await response.blob();
      const portadaFile = new File([blob], 'portada.jpg', { type: 'image/jpeg' });
      const storageRef = ref(storage, `condominiums/portadas/${Date.now()}-portada.jpg`);
      await uploadBytes(storageRef, portadaFile);
      portadaUrl = await getDownloadURL(storageRef);
      console.log('Portada uploaded, URL:', portadaUrl);
    }

    // Preparar datos a guardar - ensure all fields are included
    const dataToSave = {
      name: condoData.name,
      description: condoData.description || '',
      shortDescription: condoData.shortDescription || '',
      zoneId: condoData.zoneId,
      polygonId: condoData.polygonId || '', // Ensure polygonId is included
      polygonPath: condoData.polygonPath || '', // Ensure polygonPath is included
      status: condoData.status || 'active',
      amenities: condoData.amenities || [],
      imageUrls: imageUrls,
      logoUrl: logoUrl || null,
      portada: portadaUrl || '', // Ensure portada is included
      googlePlaceId: condoData.googlePlaceId || null,
      rentPriceMin: condoData.rentPriceMin || 0,
      rentPriceAvg: condoData.rentPriceAvg || 0,
      rentPriceMax: condoData.rentPriceMax || 0,
      salePriceMin: condoData.salePriceMin || 0,
      salePriceAvg: condoData.salePriceAvg || 0,
      salePriceMax: condoData.salePriceMax || 0,
      cachedReviews: [],
      reviewsLastUpdated: null,
      createdAt: Timestamp.now()
    };
    
    console.log('Guardando en Firestore:', dataToSave);
    
    const docRef = await addDoc(collection(db, "condominiums"), dataToSave);
    console.log('Condominio creado con ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding condominium:", error);
    throw error;
  }
};

const uploadCondoLogo = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No logo file provided');
  }
  
  const filename = `condominiums/logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const storageRef = ref(storage, filename);
  
  try {
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error('Error al subir el logo');
  }
};

const uploadCondoImagesInternal = async (files: File[]): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }
  
  const urls: string[] = [];
  
  for (const file of files) {
    if (!file) continue;
    
    try {
      const filename = `condominiums/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    } catch (error) {
      console.error(`Error al subir imagen ${file.name}:`, error);
      // Continuar con las siguientes imágenes
    }
  }
  
  return urls;
};

export const getCondosByZone = async (zoneId: string): Promise<CondoData[]> => {
  try {
    const q = query(
      collection(db, "condominiums"),
      where("zoneId", "==", zoneId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CondoData[];
  } catch (error) {
    console.error("Error fetching condominiums:", error);
    throw error;
  }
};

// Add new function to get all condominiums
export const getCondominiums = async (): Promise<CondoData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "condominiums"));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as CondoData[];
  } catch (error) {
    console.error("Error fetching condominiums:", error);
    throw error;
  }
};

// Update updateCondo function to handle selected reviews
export const updateCondo = async (
  id: string,
  data: Partial<CondoData>,
  imageFiles?: File[],
  logoFile?: File | null
): Promise<void> => {
  try {
    const condoRef = doc(db, "condominiums", id);
    const updateData = { ...data };

    // Process image files if provided
    if (imageFiles && imageFiles.length > 0) {
      const urls = await uploadCondoImagesInternal(imageFiles);
      updateData.imageUrls = [...(data.imageUrls || []), ...urls];
    }

    // Process logo if provided
    if (logoFile) {
      updateData.logoUrl = await uploadCondoLogo(logoFile);
    }

    // Ensure imageAmenityTags is preserved
    if (!updateData.imageAmenityTags && data.imageAmenityTags) {
      updateData.imageAmenityTags = data.imageAmenityTags;
    }

    await updateDoc(condoRef, updateData);
  } catch (error) {
    console.error('Error updating condominium:', error);
    throw error;
  }
};

export const getZoneById = async (id: string): Promise<ZoneData | null> => {
  try {
    console.log('Fetching zone:', id);
    const docRef = doc(db, "zones", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Zone data:', docSnap.data());
      return { id: docSnap.id, ...docSnap.data() } as ZoneData;
    }
    console.log('Zone not found');
    return null;
  } catch (error) {
    console.error("Error fetching zone:", error);
    return null;
  }
};

export const getCondoById = async (id: string): Promise<CondoData | null> => {
  try {
    console.log('Fetching condo:', id);
    const docRef = doc(db, "condominiums", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Condo data:', docSnap.data());
      return { id: docSnap.id, ...docSnap.data() } as CondoData;
    }
    console.log('Condo not found');
    return null;
  } catch (error) {
    console.error("Error fetching condo:", error);
    return null;
  }
};

export const updateCondoReviews = async (condoId: string): Promise<void> => {
  try {
    const condoRef = doc(db, "condominiums", condoId);
    const condoDoc = await getDoc(condoRef);
    const condoData = condoDoc.data();

    if (!condoData?.googlePlaceId) {
      throw new Error('No Google Place ID found');
    }

    console.log('Fetching reviews for place:', condoData.googlePlaceId);

    const response = await fetch(`/api/google-reviews?placeId=${condoData.googlePlaceId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response received');

    if (!data.result) {
      throw new Error('Invalid API response format');
    }

    const { result } = data;
    
    // Format data to match our Firebase structure
    interface GoogleReview {
      author_name: string;
      rating: number;
      relative_time_description: string;
      text: string;
      profile_photo_url: string;
      time: number;
    }

    interface PlaceDetails {
      name: string;
      formatted_address: string;
      website: string;
      photos: any[]; // Type could be more specific based on Google Places API response
    }

    interface UpdatedCondoData {
      cachedReviews: GoogleReview[];
      googleRating: number;
      totalRatings: number;
      filteredRatingCount: number;
      reviewsLastUpdated: Timestamp;
      placeDetails: PlaceDetails;
    }

        const updatedData: UpdatedCondoData = {
          cachedReviews: result.reviews?.map((review: GoogleReview) => ({
            author_name: review.author_name,
            rating: review.rating,
            relative_time_description: review.relative_time_description,
            text: review.text,
            profile_photo_url: review.profile_photo_url,
            time: review.time
          })) || [],
          googleRating: result.rating || 0,
          totalRatings: result.user_ratings_total || 0,
          filteredRatingCount: result.filteredCount || 0,
          reviewsLastUpdated: Timestamp.now(),
          placeDetails: {
            name: result.placeDetails?.name || '',
            formatted_address: result.placeDetails?.formatted_address || '',
            website: result.placeDetails?.website || '',
            photos: [] // Initialize with empty array
          }
        };

    // Only add photos if they exist
    if (result.placeDetails?.photos?.length > 0) {
      updatedData.placeDetails.photos = result.placeDetails.photos;
    }

    console.log('Updating document with:', updatedData);
    await updateDoc(condoRef, {
      ...updatedData,
      selectedGoogleReviews: condoData.selectedGoogleReviews || [] // Preserve existing selections
    });
    
  } catch (error) {
    console.error('Error updating reviews:', error);
    throw error;
  }
};

export const checkIfUserExists = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};

// Enhanced function to check if a user is an admin
export const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    console.log(`[ROLE CHECK] Checking if user ${userId} is an admin...`);
    
    // First check if there's a direct document with this ID
    const adminDocRef = doc(db, 'admins', userId);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      console.log(`[ROLE CHECK] Found admin document for ${userId} with direct ID match`);
      return true;
    }
    
    // If not found by ID, try querying by userId field
    console.log(`[ROLE CHECK] No direct admin document, checking by userId field...`);
    const adminsQuery = query(
      collection(db, 'admins'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(adminsQuery);
    const isAdmin = !querySnapshot.empty;
    
    console.log(`[ROLE CHECK] Admin query returned ${querySnapshot.size} results for userId ${userId}`);
    
    // Also check in users collection for isAdmin flag
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists() && userDoc.data().isAdmin) {
        console.log(`[ROLE CHECK] User document has isAdmin=true flag for ${userId}`);
        return true;
      }
    } catch (userDocError) {
      console.error('[ROLE CHECK] Error checking user document for admin flag:', userDocError);
    }
    
    return isAdmin;
  } catch (error) {
    console.error('[ROLE CHECK] Error checking if user is admin:', error);
    return false;
  }
};

// Function to create an admin user
export const createAdminUser = async (userId: string, email: string, name: string): Promise<void> => {
  try {
    console.log(`Creating admin user for ${userId}`);
    
    // Create admin record
    await setDoc(doc(db, 'admins', userId), {
      userId: userId,
      email: email,
      name: name,
      role: 'admin',
      createdAt: new Date()
    });
    
    // Also update the users collection to mark as admin
    await updateDoc(doc(db, 'users', userId), {
      isAdmin: true
    });
    
    console.log(`Admin user created successfully for ${userId}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Enhanced function to check if a user is an advisor
export async function checkIfUserIsAdvisor(uid: string): Promise<boolean> {
  try {
    console.log(`[ROLE CHECK] Checking if user ${uid} is an advisor...`);
    
    // First check in the users collection if they have isAdvisor flag
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`[ROLE CHECK] User document exists for ${uid}:`, userData);
        if (userData.isAdvisor) {
          console.log(`[ROLE CHECK] Found isAdvisor=true flag in user document for ${uid}`);
          return true;
        }
      } else {
        console.log(`[ROLE CHECK] No user document found for ${uid}`);
      }
    } catch (userDocError) {
      console.error('[ROLE CHECK] Error checking user document for advisor flag:', userDocError);
    }
    
    // Also check the advisors collection
    console.log(`[ROLE CHECK] Checking advisors collection for ${uid}...`);
    const advisorsQuery = query(
      collection(db, 'advisors'),
      where('userId', '==', uid)
    );
    
    const advisorsSnapshot = await getDocs(advisorsQuery);
    console.log(`[ROLE CHECK] Found ${advisorsSnapshot.size} advisor documents for ${uid}`);
    
    if (!advisorsSnapshot.empty) {
      const advisorDoc = advisorsSnapshot.docs[0];
      console.log(`[ROLE CHECK] Advisor document:`, advisorDoc.data());
      
      // Check if the advisor is active
      const status = advisorDoc.data().status;
      if (status === 'active') {
        console.log(`[ROLE CHECK] Advisor is active for ${uid}`);
        return true;
      } else {
        console.log(`[ROLE CHECK] Advisor exists but status=${status} for ${uid}`);
      }
    }
    
    return false;
  } catch (error) {
    console.error('[ROLE CHECK] Error checking if user is advisor:', error);
    return false;
  }
}

// Create or update user in the users collection
export async function createOrUpdateUser(user: any): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name: user.displayName || '',
      email: user.email,
      lastLogin: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

/**
 * Obtiene los datos del asesor desde Firestore - VERSIÓN MEJORADA
 */
export async function getAdvisorData(userId: string) {
  if (!userId) {
    console.error("[ADVISOR DATA] No userId provided to getAdvisorData");
    return null;
  }
  
  console.log(`[ADVISOR DATA] Starting comprehensive search for advisor data with userId: ${userId}`);
  
  try {
    // APPROACH 1: Query by userId field in advisors collection
    console.log(`[ADVISOR DATA] Approach 1: Querying advisors collection with userId: ${userId}`);
    const advisorsQuery = query(collection(db, "advisors"), where("userId", "==", userId));
    const advisorsSnapshot = await getDocs(advisorsQuery);
    
    console.log(`[ADVISOR DATA] Found ${advisorsSnapshot.size} documents by userId field`);
    
    if (!advisorsSnapshot.empty) {
      const advisorDoc = advisorsSnapshot.docs[0];
      const advisorData = advisorDoc.data();
      console.log(`[ADVISOR DATA] Found advisor by userId field. Data:`, advisorData);
      return { id: advisorDoc.id, ...advisorData };
    }
    
    // APPROACH 2: Try direct document lookup
    console.log(`[ADVISOR DATA] Approach 2: Direct document lookup with ID: ${userId}`);
    const directDocRef = doc(db, "advisors", userId);
    const directDocSnap = await getDoc(directDocRef);
    
    if (directDocSnap.exists()) {
      const directData = directDocSnap.data();
      console.log(`[ADVISOR DATA] Found advisor by direct document ID. Data:`, directData);
      return { id: userId, ...directData };
    }
    
    // APPROACH 3: Check if there's any document that might contain this ID
    console.log(`[ADVISOR DATA] Approach 3: Checking all advisors for any match`);
    const allAdvisorsSnapshot = await getDocs(collection(db, "advisors"));
    
    for (const doc of allAdvisorsSnapshot.docs) {
      const data = doc.data();
      console.log(`[ADVISOR DATA] Checking document ${doc.id}:`, data);
      
      // Check if any field in this document could match our userId
      if (
        doc.id === userId || 
        data.userId === userId || 
        data.uid === userId ||
        (data.email && data.email === userId)
      ) {
        console.log(`[ADVISOR DATA] Found potential match in document ${doc.id}`);
        return { id: doc.id, ...data };
      }
    }
    
    // If we get here, no advisor was found
    console.log(`[ADVISOR DATA] ⚠️ NO ADVISOR DATA FOUND after exhaustive search for userId: ${userId}`);
    return null;
  } catch (error) {
    console.error("[ADVISOR DATA] Error fetching advisor data:", error);
    return null;
  }
}

// New function to get advisor by document ID
export const getAdvisorById = async (advisorId: string): Promise<AdvisorData | null> => {
  try {
    console.log(`[ADVISOR LOOKUP] Looking up advisor with document ID: ${advisorId}`);
    const advisorRef = doc(db, "advisors", advisorId);
    const advisorDoc = await getDoc(advisorRef);
    
    if (advisorDoc.exists()) {
      console.log(`[ADVISOR LOOKUP] Found advisor document:`, advisorDoc.data());
      return {
        id: advisorDoc.id,
        ...advisorDoc.data()
      } as AdvisorData;
    }
    
    console.log(`[ADVISOR LOOKUP] No advisor found with document ID: ${advisorId}`);
    return null;
  } catch (error) {
    console.error(`[ADVISOR LOOKUP] Error fetching advisor by ID:`, error);
    return null;
  }
};

// Add new function to fetch similar properties
interface SimilarPropertiesParams {
  currentPropertyId: string;
  propertyType: string;
  transactionType: string;
  zone?: string;
  condo?: string;
  price?: number;
  maxResults?: number; // Renamed to avoid conflict with Firestore's limit()
}

export async function getSimilarProperties({
  currentPropertyId,
  propertyType,
  transactionType,
  zone,
  condo,
  price,
  maxResults = 4  // Renamed parameter
}: SimilarPropertiesParams): Promise<PropertyData[]> {
  try {
    console.log(`SIMILAR QUERY: Starting search for properties similar to ${currentPropertyId}`);
    console.log(`SIMILAR QUERY: Filters - type: ${propertyType}, transaction: ${transactionType}, zone: ${zone}`);
    
    let finalProperties: PropertyData[] = [];
    
    // STEP 1: Try to find properties with same condo (most similar)
    if (condo) {
      try {
        console.log(`SIMILAR QUERY: Trying to find properties in same condo: ${condo}`);
        const condoQuery = query(
          collection(db, 'properties'),
          where('condo', '==', condo),
          limit(maxResults * 2)  // Using Firebase's limit() function
        );
        
        const condoSnapshot = await getDocs(condoQuery);
        console.log(`SIMILAR QUERY: Found ${condoSnapshot.size} properties in same condo`);
        
        const condoProperties = condoSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as PropertyData))
          .filter(prop => prop.id !== currentPropertyId);
          
        finalProperties.push(...condoProperties);
      } catch (err) {
        console.error("SIMILAR QUERY: Error in condo query:", err);
      }
    }
    
    // STEP 2: Try to find properties with same zone
    if (finalProperties.length < maxResults && zone) {  // Fixed reference
      try {
        console.log(`SIMILAR QUERY: Trying to find properties in same zone: ${zone}`);
        const zoneQuery = query(
          collection(db, 'properties'),
          where('zone', '==', zone),
          limit(maxResults * 2)  // Using Firebase's limit() function
        );
        
        const zoneSnapshot = await getDocs(zoneQuery);
        console.log(`SIMILAR QUERY: Found ${zoneSnapshot.size} properties in same zone`);
        
        const zoneProperties = zoneSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as PropertyData))
          .filter(prop => 
            prop.id !== currentPropertyId && 
            !finalProperties.some(p => p.id === prop.id)
          );
          
        finalProperties.push(...zoneProperties);
      } catch (err) {
        console.error("SIMILAR QUERY: Error in zone query:", err);
      }
    }
    
    // STEP 3: Try to find properties with same property type and transaction type
    if (finalProperties.length < maxResults) {  // Fixed reference
      try {
        console.log(`SIMILAR QUERY: Trying to find properties with type: ${propertyType}, transaction: ${transactionType}`);
        const typeQuery = query(
          collection(db, 'properties'),
          where('propertyType', '==', propertyType),
          limit(maxResults * 2)  // Using Firebase's limit() function
        );
        
        const typeSnapshot = await getDocs(typeQuery);
        console.log(`SIMILAR QUERY: Found ${typeSnapshot.size} properties with same type`);
        
        const typeProperties = typeSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as PropertyData))
          .filter(prop => 
            prop.id !== currentPropertyId &&
            prop.transactionType === transactionType &&
            !finalProperties.some(p => p.id === prop.id)
          );
          
        finalProperties.push(...typeProperties);
      } catch (err) {
        console.error("SIMILAR QUERY: Error in type query:", err);
      }
    }
    
    // STEP 4: Last resort - get any properties
    if (finalProperties.length < maxResults) {  // Fixed reference
      try {
        console.log('SIMILAR QUERY: Getting any properties as fallback');
        const anyQuery = query(
          collection(db, 'properties'),
          limit(maxResults * 3)  // Using Firebase's limit() function
        );
        
        const anySnapshot = await getDocs(anyQuery);
        console.log(`SIMILAR QUERY: Found ${anySnapshot.size} total properties`);
        
        const anyProperties = anySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as PropertyData))
          .filter(prop => 
            prop.id !== currentPropertyId && 
            !finalProperties.some(p => p.id === prop.id)
          );
          
        finalProperties.push(...anyProperties);
      } catch (err) {
        console.error("SIMILAR QUERY: Error in fallback query:", err);
      }
    }
    
    // STEP 5: Take only the properties we need for our grid
    finalProperties = finalProperties.slice(0, maxResults);  // Fixed reference
    
    console.log(`SIMILAR QUERY: Final count: ${finalProperties.length} properties`);
    console.log('SIMILAR QUERY: Property IDs:', finalProperties.map(p => p.id).join(', '));
    
    // STEP 6: Add dummy properties if we don't have enough
    if (finalProperties.length < maxResults) {  // Fixed reference
      const dummiesNeeded = maxResults - finalProperties.length;  // Fixed reference
      console.log(`SIMILAR QUERY: Adding ${dummiesNeeded} dummy properties`);
      
      for (let i = 0; i < dummiesNeeded; i++) {
        finalProperties.push({
          id: `dummy-${i}`,
          propertyType: propertyType || 'casa',
          transactionType: transactionType || 'venta',
          condoName: 'Otras propiedades',
          zone: zone || '',
          price: 0,
          imageUrls: [],
          advisor: '',
          status: 'publicada',
          isDummy: true,
          views: 0,
          whatsappClicks: 0,
          furnished: false,
          servicesIncluded: false,
          bedrooms: 0,
          bathrooms: 0,
          parkingSpots: 0,
          publicationDate: Timestamp.now(),
          descripcion: '',
          constructionYear: null,
          condo: ''
        } as PropertyData);
      }
    }
    
    return finalProperties;
    
  } catch (error) {
    console.error("SIMILAR QUERY: Critical error:", error);
    
    // Always return exactly 'maxResults' properties even on error by creating dummies
    return Array(4).fill(null).map((_, i) => ({
      id: `dummy-error-${i}`,
      propertyType: propertyType || 'casa',
      transactionType: transactionType || 'venta',
      condoName: 'Otras propiedades',
      zone: zone || '',
      price: 0,
      imageUrls: [],
      advisor: '',
      status: 'publicada',
      isDummy: true,
      views: 0,
      whatsappClicks: 0,
      furnished: false,
      servicesIncluded: false,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpots: 0,
      publicationDate: Timestamp.now(),
      descripcion: '',
      constructionYear: null,
      condo: ''
    } as PropertyData));
  }
}

export async function getZoneByName(zoneName: string): Promise<ZoneData | null> {
  const zonesRef = collection(db, 'zones');
  const normalizedZoneName = zoneName.toLowerCase().trim();
  
  // Buscar zona por coincidencia exacta
  const exactQuery = query(zonesRef, where('name', '==', normalizedZoneName));
  const exactSnapshot = await getDocs(exactQuery);
  
  if (!exactSnapshot.empty) {
    return { 
      id: exactSnapshot.docs[0].id,
      ...exactSnapshot.docs[0].data()
    } as ZoneData;
  }
  
  // Buscar zona por nombre similar
  const allZonesSnapshot = await getDocs(zonesRef);
  const matchingZone = allZonesSnapshot.docs.find(doc => 
    doc.data().name.toLowerCase() === normalizedZoneName
  );
  
  if (matchingZone) {
    return { 
      id: matchingZone.id,
      ...matchingZone.data()
    } as ZoneData;
  }
  
  return null;
}

// Function to get properties by condo ID
export const getPropertiesByCondo = async (condoId: string): Promise<PropertyData[]> => {
  try {
    console.log(`Fetching properties for condo ID: ${condoId}`);
    const q = query(
      collection(db, "properties"),
      where("condo", "==", condoId),
      where("status", "==", "publicada")
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} properties for condo ${condoId}`);
    
    const properties: PropertyData[] = [];
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() } as PropertyData);
    });
    
    return properties;
  } catch (error) {
    console.error("Error fetching properties by condo:", error);
    return [];
  }
};

// CRUD functions for Desarrolladoras
export const getDesarrolladoras = async (): Promise<Desarrolladora[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'desarrolladoras'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Desarrolladora[];
  } catch (error) {
    console.error('Error fetching desarrolladoras:', error);
    throw error;
  }
};

export const addDesarrolladora = async (data: Desarrolladora): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'desarrolladoras'), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding desarrolladora:', error);
    throw error;
  }
};

export const updateDesarrolladora = async (id: string, data: Partial<Desarrolladora>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'desarrolladoras', id), data);
  } catch (error) {
    console.error('Error updating desarrolladora:', error);
    throw error;
  }
};

export const deleteDesarrolladora = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'desarrolladoras', id));
  } catch (error) {
    console.error('Error deleting desarrolladora:', error);
    throw error;
  }
};

// BLOG FUNCTIONS
const BLOG_COLLECTION = 'blogPosts';
const CONTRIBUTORS_COLLECTION = 'blogContributors';

// Create a new blog post
export async function createBlogPost(blogPost: BlogPost): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, BLOG_COLLECTION), {
      ...blogPost,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog post:', error);
    throw error;
  }
}

// Update an existing blog post
export async function updateBlogPost(id: string, blogPost: Partial<BlogPost>): Promise<void> {
  try {
    const blogRef = doc(db, BLOG_COLLECTION, id);
    await updateDoc(blogRef, {
      ...blogPost,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
}

// Delete a blog post
export async function deleteBlogPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BLOG_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
}

// Get a single blog post by ID
export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const docRef = doc(db, BLOG_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_COLLECTION),
      orderBy('publishDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw error;
  }
}

// Get published blog posts
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_COLLECTION),
      where('published', '==', true),
      orderBy('publishDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting published blog posts:', error);
    throw error;
  }
}

// Upload an image to Firebase Storage
export async function uploadBlogImage(file: File, postId: string): Promise<string> {
  try {
    const storageRef = ref(storage, `blog-images/${postId}/${file.name}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// CRUD operations for blog contributors
export async function getAllContributors(): Promise<BlogContributor[]> {
  try {
    const q = query(
      collection(db, CONTRIBUTORS_COLLECTION),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogContributor[];
  } catch (error) {
    console.error('Error getting contributors:', error);
    throw error;
  }
}

export async function getContributor(id: string): Promise<BlogContributor | null> {
  try {
    const docRef = doc(db, CONTRIBUTORS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogContributor;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting contributor:', error);
    throw error;
  }
}

export async function createContributor(contributor: BlogContributor): Promise<string> {
  try {
    // Remove photoFile property as it's not meant to be stored in Firestore
    const { photoFile, ...contributorData } = contributor;
    
    const docRef = await addDoc(collection(db, CONTRIBUTORS_COLLECTION), {
      ...contributorData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contributor:', error);
    throw error;
  }
}

export async function updateContributor(id: string, contributor: Partial<BlogContributor>): Promise<void> {
  try {
    // Remove photoFile property as it's not meant to be stored in Firestore
    const { photoFile, ...contributorData } = contributor;
    
    const contributorRef = doc(db, CONTRIBUTORS_COLLECTION, id);
    await updateDoc(contributorRef, {
      ...contributorData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating contributor:', error);
    throw error;
  }
}

export async function deleteContributor(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CONTRIBUTORS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting contributor:', error);
    throw error;
  }
}

export async function uploadContributorPhoto(file: File, contributorId: string): Promise<string> {
  try {
    const storageRef = ref(storage, `blog-contributors/${contributorId}/${file.name}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading contributor photo:', error);
    throw error;
  }
}

// Get all advisors from Firestore
export const getAllAdvisors = async () => {
  try {
    const advisorsRef = collection(db, 'advisors');
    const snapshot = await getDocs(advisorsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching advisors:', error);
    return [];
  }
};

// Function to update the quality level of a condominium
export const updateCondoQualityLevel = async (
  condoId: string, 
  qualityLevel: 'high' | 'medium' | 'low'
): Promise<void> => {
  try {
    console.log(`Updating condo ${condoId} quality level to ${qualityLevel}`);
    const condoRef = doc(db, "condominiums", condoId);
    await updateDoc(condoRef, {
      qualityLevel: qualityLevel
    });
    console.log('Quality level updated successfully');
  } catch (error) {
    console.error('Error updating condo quality level:', error);
    throw error;
  }
};

// Función para obtener propiedades con paginación
export const getPropertiesWithPagination = async (
  startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  pageSize: number = 10
): Promise<{
  properties: PropertyData[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMoreDocs: boolean;
}> => {
  try {
    let propertiesQuery;
    
    if (startAfterDoc) {
      // Consulta con paginación a partir de un documento
      propertiesQuery = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc'),
        startAfter(startAfterDoc),
        limit(pageSize + 1) // Pedimos uno extra para saber si hay más
      );
    } else {
      // Consulta inicial
      propertiesQuery = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(propertiesQuery);
    
    // Verificar si hay más documentos
    const docs = querySnapshot.docs;
    const hasMoreDocs = docs.length > pageSize;
    
    // Si hay más documentos, eliminamos el extra que pedimos
    const propertyDocs = hasMoreDocs ? docs.slice(0, pageSize) : docs;
    
    // Último documento visible para la siguiente consulta
    const lastVisible = propertyDocs.length > 0 ? propertyDocs[propertyDocs.length - 1] : null;
    
    // Convertir documentos a objetos PropertyData
    const properties = propertyDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convertir fechas si existen
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as unknown as PropertyData; // Uso de casting seguro para evitar el error de TypeScript
    });

    return {
      properties,
      lastVisible,
      hasMoreDocs
    };
  } catch (error) {
    console.error('Error fetching properties with pagination:', error);
    return {
      properties: [],
      lastVisible: null,
      hasMoreDocs: false
    };
  }
};

// Promotor interface
export interface Promotor {
  id: string;
  name: string;
  code: string;
  createdAt?: any;
}

/**
 * Gets all promoters from Firestore
 */
export const getPromotores = async (): Promise<Promotor[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "promotores"));
    const promotoresList: Promotor[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      promotoresList.push({
        id: doc.id,
        name: data.name || '',
        code: data.code || '',
        createdAt: data.createdAt
      });
    });
    
    // Sort alphabetically by name
    promotoresList.sort((a, b) => a.name.localeCompare(b.name));
    
    return promotoresList;
  } catch (error) {
    console.error("Error fetching promotores:", error);
    return [];
  }
};

/**
 * Gets a promotor by ID
 */
export const getPromotorById = async (id: string): Promise<Promotor | null> => {
  try {
    const docRef = doc(db, "promotores", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        code: data.code || '',
        createdAt: data.createdAt
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching promotor:", error);
    return null;
  }
};

/**
 * Gets a promotor by code
 */
export const getPromotorByCode = async (code: string): Promise<Promotor | null> => {
  try {
    const q = query(
      collection(db, "promotores"),
      where("code", "==", code)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        code: data.code || '',
        createdAt: data.createdAt
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching promotor by code:", error);
    return null;
  }
};

// Blog index document name
const BLOG_INDEX_DOC = 'blogIndex';

// Create or update the blog index
export async function updateBlogIndex(): Promise<void> {
  try {
    console.log('Updating blog index...');
    
    // Get all blog posts
    const posts = await getAllBlogPosts();
    
    // Create a mapping of slugs to post IDs
    const slugToIdMap: Record<string, string> = {};
    const idToSlugMap: Record<string, string> = {};
    
    // Only include published posts with slugs in the index
    posts.filter(post => post.published && post.slug).forEach(post => {
      if (post.slug && post.id) {
        slugToIdMap[post.slug] = post.id;
        idToSlugMap[post.id] = post.slug;
      }
    });
    
    // Create the index document
    const indexData = {
      slugToId: slugToIdMap,
      idToSlug: idToSlugMap,
      lastUpdated: new Date().toISOString(),
      postCount: Object.keys(slugToIdMap).length
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'blogMeta', BLOG_INDEX_DOC), indexData);
    
    console.log(`Blog index updated with ${Object.keys(slugToIdMap).length} posts`);
    return;
  } catch (error) {
    console.error('Error updating blog index:', error);
    throw error;
  }
}

// Get a blog post by slug using the index for efficient lookup
export async function getBlogPostBySlugWithIndex(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  
  try {
    // First try to find the post ID from the index
    const indexDoc = await getDoc(doc(db, 'blogMeta', BLOG_INDEX_DOC));
    
    if (indexDoc.exists()) {
      const indexData = indexDoc.data();
      const postId = indexData.slugToId[slug];
      
      // If we found the ID in the index, get the post directly
      if (postId) {
        return await getBlogPost(postId);
      }
      
      // If it might be an ID instead of a slug, check that too
      if (indexData.idToSlug[slug]) {
        return await getBlogPost(slug);
      }
    }
    
    // Fallback: if the index doesn't exist or the slug isn't in the index
    console.log('Blog index lookup failed, falling back to full search');
    const posts = await getAllBlogPosts();
    
    // Try to find by slug
    const postBySlug = posts.find(post => post.published && post.slug === slug);
    if (postBySlug) return postBySlug;
    
    // Try to find by ID
    const postById = posts.find(post => post.published && post.id === slug);
    return postById || null;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw error;
  }
}

export { db, auth, storage };