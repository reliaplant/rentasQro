import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

export interface PropertyData {
  id?: string;
  propertyType: string;
  transactionType: string;
  price: number;
  bathrooms: number;
  bedrooms: number;
  furnished: boolean;
  zone: string;
  privateComplex: string;
  advisor: string;
  publicationDate: string;
  imageUrls: string[];
  createdAt?: Timestamp;
  maintenanceCost?: number;
  maintenanceIncluded?: boolean;
  constructionYear: number;
  petsAllowed?: boolean;
  status: 'disponible' | 'no disponible' | 'apartada';
  dealType: 'directo' | 'asesor';
}

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const urls = [];
  for (const file of files) {
    const storageRef = ref(storage, `properties/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
};

export const addProperty = async (propertyData: PropertyData, images: File[]): Promise<string> => {
  try {
    const imageUrls = await uploadImages(images);
    const dataToSave = {
      ...propertyData,
      imageUrls,
      createdAt: Timestamp.now()
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
      properties.push({ id: doc.id, ...doc.data() } as PropertyData);
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

export { db };