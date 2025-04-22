import { BlogPost } from "../types";

interface BlogPreviewProps {
  blogPost: BlogPost;
  activeTab?: 'basic' | 'seo';
}

export default function BlogPreview({ blogPost, activeTab = 'basic' }: BlogPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="blog-preview">
      <h2 className="text-xl font-bold mb-4">Vista previa</h2>
      
      {blogPost.title ? (
        <>
          <h1 className="text-3xl font-bold mb-4">{blogPost.title}</h1>
          
          {blogPost.coverImage && (
            <div className="mb-4">
              <img 
                src={blogPost.coverImage} 
                alt={blogPost.title}
                className="w-full h-64 object-cover rounded" 
              />
            </div>
          )}
          
          <div className="mb-4 text-gray-600">
            <span className="font-medium">Por {blogPost.author || 'Autor'}</span>
            <span> · {formatDate(blogPost.publishDate)}</span>
          </div>
          
          {blogPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blogPost.tags.map(tag => (
                <span key={tag} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="blog-content prose prose-sm sm:prose lg:prose-lg max-w-none">
            {blogPost.content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: blogPost.content }} 
                className="tiptap-content"
              />
            ) : (
              <p className="text-gray-400 italic">Sin contenido</p>
            )}
          </div>
          
          {/* SEO info preview */}
          {activeTab === 'seo' && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Vista previa SEO</h3>
              <div className="bg-gray-100 p-4 rounded">
                <div className="text-blue-600 text-lg font-medium">
                  {blogPost.seoTitle || blogPost.title}
                </div>
                <div className="text-green-700 text-sm">
                  {typeof window !== "undefined" ? window.location.origin : ""}/blog/{blogPost.slug || 'url-del-articulo'}
                </div>
                <div className="text-gray-700 mt-1">
                  {blogPost.metaDescription || (blogPost.summary 
                    ? blogPost.summary.substring(0, 160) + (blogPost.summary.length > 160 ? '...' : '')
                    : 'Sin descripción meta...')}
                </div>
              </div>
            </div>
          )}
          
          {blogPost.published ? (
            <div className="mt-4 py-2 px-3 bg-green-100 text-green-800 rounded inline-block">
              Publicado
            </div>
          ) : (
            <div className="mt-4 py-2 px-3 bg-yellow-100 text-yellow-800 rounded inline-block">
              Borrador
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400 italic">
          Completa el formulario para ver la vista previa
        </div>
      )}
    </div>
  );
}
