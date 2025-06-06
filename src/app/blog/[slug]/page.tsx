import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from './utils';
import { BlogPost } from '@/app/admin/blog-editor/types';
import BlogPostContent from './components/BlogPostContent';
import { Metadata } from 'next';

// Generate metadata for the page - properly handling params
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  try {
    // Properly await the params if it's a Promise
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    const post = await getBlogPostBySlug(slug);
    
    if (!post) {
      return {
        title: 'Artículo no encontrado',
        description: 'El artículo que buscas no existe o ha sido eliminado.'
      };
    }
    
    return {
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.summary || `${post.title} - Artículo por ${post.author}`,
      keywords: post.keyPhrases?.join(', ') || post.tags.join(', '),
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.metaDescription || post.summary || `${post.title} - Artículo por ${post.author}`,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'Hubo un error al cargar este artículo'
    };
  }
}

// Single export default for the server component - properly handling params
export default async function BlogPostPage({ params }: { params: any }) {  
  try {
    // Properly await the params if it's a Promise
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    const initialPost = await getBlogPostBySlug(slug);
    
    // If post doesn't exist, show 404
    if (!initialPost) {
      return notFound();
    }
    
    // Pass the slug to the client component
    return <BlogPostContent slug={slug} />;
  } catch (error) {
    console.error("Error in blog post page:", error);
    // Return a simple error UI from the server component
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>Ha ocurrido un error al cargar este artículo</p>
      </div>
    );
  }
}
