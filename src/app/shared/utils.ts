/**
 * OFFICIAL FIREBASE SERVICE
 * This is the single source of truth for Firebase functionality in the application.
 * Do not create duplicate Firebase service files.
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, increment, setDoc, limit, Query, DocumentData, orderBy, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, listAll } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User, fetchSignInMethodsForEmail } from "firebase/auth";
import { ZoneData, CondoData, resumenCondo, PropertyData, Desarrolladora, negocio } from '@/app/shared/interfaces';
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
    const querySnapshot = await getDocs(collection(db, "properties"));
    const properties: PropertyData[] = [];
    
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({ id: doc.id, ...data } as PropertyData);
    });
    
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

// Modify addCondo to store condo info in its zone document
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
      imageUrls = await uploadCondoImagesInternal(imageFiles);
    }
    
    if (logoFile) {
      logoUrl = await uploadCondoLogo(logoFile);
    }

    // Extract portada from condoData explicitly if it's a data URL
    let portadaUrl = condoData.portada;
    if (portadaUrl && portadaUrl.startsWith('data:image')) {
      // Convert data URL to Blob and upload
      const response = await fetch(portadaUrl);
      const blob = await response.blob();
      const portadaFile = new File([blob], 'portada.jpg', { type: 'image/jpeg' });
      const storageRef = ref(storage, `condominiums/portadas/${Date.now()}-portada.jpg`);
      await uploadBytes(storageRef, portadaFile);
      portadaUrl = await getDownloadURL(storageRef);
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
    
    
    const docRef = await addDoc(collection(db, "condominiums"), dataToSave);
    
    // Update the zone document to include this condo in its condos array
    try {
      const zoneRef = doc(db, "zones", condoData.zoneId);
      const zoneDoc = await getDoc(zoneRef);
      
      if (zoneDoc.exists()) {
        // Get current condos array or initialize if it doesn't exist
        const currentZoneData = zoneDoc.data();
        const currentCondos = currentZoneData.condos || [];
        
        // Add the new condo to the array
        await updateDoc(zoneRef, {
          condos: [...currentCondos, {
            condoId: docRef.id,
            condoName: condoData.name,
            coordX: condoData.coordX || 0,
            coordY: condoData.coordY || 0,
            zoneId: condoData.zoneId
          }]
        });
        
      } else {
        console.error('La zona no existe:', condoData.zoneId);
      }
    } catch (zoneError) {
      console.error('Error al actualizar la zona con el nuevo condominio:', zoneError);
      // We don't throw here to not fail the condo creation if zone update fails
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding condominium:", error);
    throw error;
  }
};

const uploadCondoLogo = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo para subir');
  }
  
  try {
    const filename = `condominiums/logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading condo logo:", error);
    throw new Error('Error al subir el logo del condominio');
  }
};

// Define uploadCondoImagesInternal before it's used at line 394
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

// Fix the function at line 477 that's missing a return value
const someFunction = async (): Promise<string> => {
  // Add your implementation here
  return ""; // Add proper return value
};

// Fix the unterminated string literal at line 479
const someString = "This is a properly terminated string";