import { collection, addDoc, updateDoc, doc, deleteDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '@/app/shared/firebase'; // Updated import path to use shared Firebase service
import { BlogPost, BlogContributor } from '../types';

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
    const storage = getStorage();
    const imageRef = ref(storage, `blog-images/${postId}/${file.name}`);
    
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    
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
    const docRef = await addDoc(collection(db, CONTRIBUTORS_COLLECTION), {
      ...contributor,
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
    const contributorRef = doc(db, CONTRIBUTORS_COLLECTION, id);
    await updateDoc(contributorRef, {
      ...contributor,
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
    const storage = getStorage();
    const photoRef = ref(storage, `blog-contributors/${contributorId}/${file.name}`);
    
    await uploadBytes(photoRef, file);
    const downloadURL = await getDownloadURL(photoRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading contributor photo:', error);
    throw error;
  }
}
