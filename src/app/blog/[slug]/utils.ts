import { getBlogPostBySlugWithIndex } from '@/app/shared/firebase';
import { BlogPost } from '@/app/admin/blog-editor/types';

// Helper function to get blog post by slug using the index for efficiency
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  
  try {
    // Use the new index-based lookup function
    return await getBlogPostBySlugWithIndex(slug);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    throw error; // Propagate the error
  }
}
