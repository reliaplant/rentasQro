import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, increment } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { ZoneData, CondoData } from '@/app/interfaces';
import { PropertyData } from '@/app/interfaces';

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

export const addProperty = async (propertyData: PropertyData, images: File[]): Promise<string> => {
  try {
    const imageUrls = await uploadImages(images);
    const dataToSave = {
      ...propertyData,
      imageUrls,
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

export const updateProperty = async (id: string, propertyData: Partial<PropertyData>, newImages?: File[]): Promise<void> => {
  try {
    const docRef = doc(db, "properties", id);
    let updateData = { ...propertyData };
    
    if (newImages?.length) {
      const newImageUrls = await uploadImages(newImages);
      updateData.imageUrls = [...(propertyData.imageUrls || []), ...newImageUrls];
    }
    
    await updateDoc(docRef, updateData);
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
export const addZone = async (zoneData: ZoneData, imageFile: File): Promise<string> => {
  try {
    // Upload image first
    const imageUrl = await uploadZoneImage(imageFile);
    
    const docRef = await addDoc(collection(db, "zones"), {
      ...zoneData,
      imageUrl,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding zone:", error);
    throw error;
  }
};

const uploadZoneImage = async (file: File): Promise<string> => {
  const filename = `zones/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const updateZone = async (
  id: string, 
  data: Partial<ZoneData>, 
  newImage?: File
): Promise<void> => {
  try {
    const updateData = { ...data };
    if (newImage) {
      updateData.imageUrl = await uploadZoneImage(newImage);
    }
    await updateDoc(doc(db, "zones", id), updateData);
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
      ...doc.data() 
    })) as ZoneData[];
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
    const imageUrls = await uploadCondoImages(imageFiles);
    let logoUrl;
    
    if (logoFile) {
      logoUrl = await uploadCondoLogo(logoFile);
    }

    const docRef = await addDoc(collection(db, "condominiums"), {
      ...condoData,
      imageUrls,
      logoUrl,
      googlePlaceId: condoData.googlePlaceId || null,
      cachedReviews: [],
      reviewsLastUpdated: null,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding condominium:", error);
    throw error;
  }
};

const uploadCondoLogo = async (file: File): Promise<string> => {
  const filename = `condominiums/logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadCondoImages = async (files: File[], portadaFile?: File | null): Promise<{ urls: string[], portadaUrl?: string }> => {
  const urls: string[] = [];
  let portadaUrl;

  if (portadaFile) {
    const filename = `condominiums/portadas/${Date.now()}-${portadaFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, portadaFile);
    portadaUrl = await getDownloadURL(storageRef);
  }

  // ...existing image upload code...

  return { urls, portadaUrl };
};

const uploadCondoImagesInternal = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const filename = `condominiums/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
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

export { db, auth };