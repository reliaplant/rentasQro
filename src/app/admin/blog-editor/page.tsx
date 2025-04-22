"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogForm from "./components/BlogForm";
import BlogPreview from "./components/BlogPreview";
import { BlogPost } from "./types";
import { getBlogPost, createBlogPost, updateBlogPost } from "@/app/shared/firebase";
import { toast, Toaster } from "react-hot-toast";

// Simple loading component
const SimpleLoading = () => (
  <div className="container mx-auto p-4 flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

export default function BlogEditorPage() {
  // Wrap the useSearchParams in a Suspense boundary
  return (
    <Suspense fallback={<SimpleLoading />}>
      <BlogEditorContent />
    </Suspense>
  );
}

// Actual content component that uses search params
function BlogEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get('id');
  const isEditing = !!postId;
  const [loading, setLoading] = useState(isEditing);
  const [activeTab, setActiveTab] = useState<'basic' | 'seo'>('basic');
  
  const [blogPost, setBlogPost] = useState<BlogPost>({
    title: "",
    content: "",
    author: "",
    coverImage: "",
    tags: [],
    publishDate: new Date().toISOString().split('T')[0],
    published: false,
    // Initialize SEO fields
    seoTitle: "",
    slug: "",
    summary: "",
    metaDescription: "",
    keyPhrases: [],
  });

  useEffect(() => {
    if (postId) {
      fetchBlogPost(postId);
    }
  }, [postId]);

  const fetchBlogPost = async (id: string) => {
    try {
      setLoading(true);
      const post = await getBlogPost(id);
      if (post) {
        setBlogPost(post);
      } else {
        toast.error("No se encontró la entrada del blog");
        router.push('/admin?tab=blog');
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Error al cargar la entrada del blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (saveAsDraft: boolean = false) => {
    // Make sure we have a post
    if (!blogPost.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    if (!blogPost.author) {
      toast.error("Debes seleccionar un autor");
      return;
    }

    // Set published status based on param if not explicitly set
    const postToSave = {
      ...blogPost,
      published: saveAsDraft ? false : blogPost.published
    };

    // Create slug from title if not provided
    if (!postToSave.slug) {
      postToSave.slug = postToSave.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }

    if (isEditing && postId) {
      await updateBlogPost(postId, postToSave);
      toast.success("Entrada actualizada correctamente");
    } else {
      await createBlogPost(postToSave);
      toast.success("Entrada creada correctamente");
    }

    router.push('/admin?tab=blog');
  };

  if (loading) {
    return <SimpleLoading />;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
      
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Editar Entrada de Blog" : "Nueva Entrada de Blog"}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <BlogForm 
            blogPost={blogPost} 
            setBlogPost={setBlogPost} 
            onSave={handleSave}
            isEditing={isEditing}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <BlogPreview blogPost={blogPost} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}
