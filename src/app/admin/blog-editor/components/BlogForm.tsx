"use client";

import { useState, useEffect } from "react";
import { BlogPost, BlogContributor } from "../types";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { uploadBlogImage, getAllContributors } from "@/app/shared/firebase";
import ClientSideRichEditor from "./ClientSideRichEditor";

interface BlogFormProps {
  blogPost: BlogPost;
  setBlogPost: React.Dispatch<React.SetStateAction<BlogPost>>;
  onSave: (saveAsDraft?: boolean) => Promise<void>;
  isEditing: boolean;
  activeTab: 'basic' | 'seo';
  setActiveTab: React.Dispatch<React.SetStateAction<'basic' | 'seo'>>;
}

export default function BlogForm({ 
  blogPost, 
  setBlogPost, 
  onSave, 
  isEditing,
  activeTab,
  setActiveTab
}: BlogFormProps) {
  const [newTag, setNewTag] = useState("");
  const [newKeyPhrase, setNewKeyPhrase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contributors, setContributors] = useState<BlogContributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);

  // Fetch contributors when component mounts
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setLoadingContributors(true);
        const data = await getAllContributors();
        // Only include active contributors
        const activeContributors = data.filter(contributor => contributor.active);
        setContributors(activeContributors);
      } catch (error) {
        console.error("Error fetching contributors:", error);
        toast.error("Error al cargar los articulistas");
      } finally {
        setLoadingContributors(false);
      }
    };

    fetchContributors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for author selection
    if (name === 'author') {
      const selectedContributor = contributors.find(c => c.name === value);
      if (selectedContributor) {
        setBlogPost(prev => ({ 
          ...prev, 
          author: value,
          contributorId: selectedContributor.id
        }));
      } else {
        setBlogPost(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setBlogPost(prev => ({ ...prev, [name]: value }));
    }

    // Auto-generate slug from title if slug is empty
    if (name === 'title' && !blogPost.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setBlogPost(prev => ({ ...prev, slug }));
    }
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !blogPost.tags.includes(newTag.trim())) {
      setBlogPost((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setBlogPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPhraseAdd = () => {
    if (newKeyPhrase.trim() && !blogPost.keyPhrases?.includes(newKeyPhrase.trim())) {
      setBlogPost((prev) => ({
        ...prev,
        keyPhrases: [...(prev.keyPhrases || []), newKeyPhrase.trim()],
      }));
      setNewKeyPhrase("");
    }
  };

  const handleKeyPhraseRemove = (phraseToRemove: string) => {
    setBlogPost((prev) => ({
      ...prev,
      keyPhrases: prev.keyPhrases?.filter((phrase) => phrase !== phraseToRemove) || [],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image before upload
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // For preview, create a local URL
      const localUrl = URL.createObjectURL(compressedFile);
      setBlogPost((prev) => ({ ...prev, coverImage: localUrl }));
      
      // In a real app, you would upload to Firebase and get URL
      if (blogPost.id) {
        const remoteUrl = await uploadBlogImage(compressedFile, blogPost.id);
        setBlogPost((prev) => ({ ...prev, coverImage: remoteUrl }));
      }
      
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      toast.error("Error al cargar la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    
    if (!blogPost.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    try {
      setSubmitting(true);
      await onSave(saveAsDraft);
    } catch (error) {
      console.error("Error saving blog post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`${
              activeTab === 'basic'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Información Básica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`${
              activeTab === 'seo'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            SEO
          </button>
        </nav>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              name="title"
              value={blogPost.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Autor</label>
            {loadingContributors ? (
              <div className="w-full p-2 border rounded bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse">Cargando articulistas...</div>
              </div>
            ) : contributors.length > 0 ? (
              <select
                name="author"
                value={blogPost.author}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="" disabled>Seleccionar articulista</option>
                {contributors.map(contributor => (
                  <option key={contributor.id} value={contributor.name}>
                    {contributor.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="author"
                  value={blogPost.author}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="No hay articulistas - introduce un nombre"
                />
                <a 
                  href="/admin/blog-editor/contributor?return=blog" 
                  target="_blank"
                  className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                >
                  Crear
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Imagen de portada</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded"
            />
            {blogPost.coverImage && (
              <div className="mt-2">
                <img 
                  src={blogPost.coverImage} 
                  alt="Vista previa" 
                  className="h-40 w-auto object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contenido</label>
            <ClientSideRichEditor 
              value={blogPost.content}
              onChange={(newContent: string) => setBlogPost(prev => ({ ...prev, content: newContent }))}
              placeholder="Escribe el contenido de tu artículo aquí..."
              postId={blogPost.id || 'temp-' + Date.now()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Etiquetas</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Añadir etiqueta"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-blue-500 text-white p-2 rounded"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {blogPost.tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha de publicación</label>
            <input
              type="date"
              name="publishDate"
              value={blogPost.publishDate.split('T')[0]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={blogPost.published}
              onChange={(e) => 
                setBlogPost((prev) => ({ ...prev, published: e.target.checked }))
              }
            />
            <label htmlFor="published" className="text-sm font-medium">
              Publicar inmediatamente
            </label>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título SEO</label>
            <input
              type="text"
              name="seoTitle"
              value={blogPost.seoTitle || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Título optimizado para SEO (60-70 caracteres)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(blogPost.seoTitle?.length || 0)}/70 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL amigable (Slug)</label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">/blog/</span>
              <input
                type="text"
                name="slug"
                value={blogPost.slug || ''}
                onChange={handleChange}
                className="flex-1 p-2 border rounded"
                placeholder="url-amigable-del-articulo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resumen</label>
            <textarea
              name="summary"
              value={blogPost.summary || ''}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border rounded"
              placeholder="Breve resumen del artículo (1-2 frases)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta descripción</label>
            <textarea
              name="metaDescription"
              value={blogPost.metaDescription || ''}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded"
              placeholder="Descripción para los resultados de búsqueda (150-160 caracteres)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(blogPost.metaDescription?.length || 0)}/160 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Frases clave objetivo</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyPhrase}
                onChange={(e) => setNewKeyPhrase(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Añadir frase clave"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleKeyPhraseAdd())}
              />
              <button
                type="button"
                onClick={handleKeyPhraseAdd}
                className="bg-blue-500 text-white p-2 rounded"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {blogPost.keyPhrases?.map((phrase) => (
                <div
                  key={phrase}
                  className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                >
                  {phrase}
                  <button
                    type="button"
                    onClick={() => handleKeyPhraseRemove(phrase)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-2">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={submitting}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
        >
          Guardar como borrador
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          {isEditing ? "Actualizar entrada" : "Publicar entrada"}
        </button>
      </div>
    </form>
  );
}
