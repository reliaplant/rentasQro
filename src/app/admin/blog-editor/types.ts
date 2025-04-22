export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  contributorId?: string; // Add reference to the contributor ID
  coverImage: string;
  tags: string[];
  publishDate: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  // SEO fields
  seoTitle?: string;
  slug?: string;
  summary?: string;
  metaDescription?: string;
  keyPhrases?: string[];
}

export interface BlogContributor {
  id?: string;
  name: string;
  email: string;
  bio: string;
  photo?: string;
  active: boolean;
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  }; 
  createdAt?: string;
  updatedAt?: string;
  photoFile?: File; // Property to handle file uploads
}
