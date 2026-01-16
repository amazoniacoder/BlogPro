import { apiRequest } from "@/lib/queryClient";

// Define minimal types needed for the API

interface BlogPost {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  published: boolean;
  createdAt: string;
  excerpt?: string;
  tags?: string[];
}

interface InsertBlogPost extends Omit<BlogPost, 'id' | 'createdAt'> {}

interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface InsertContact extends Omit<Contact, 'id' | 'createdAt'> {}

interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}



// Blog API
export const blogApi = {
  getPublished: () => fetch("/api/blog").then(res => res.json()) as Promise<BlogPost[]>,
  getAll: () => fetch("/api/blog/all").then(res => res.json()) as Promise<BlogPost[]>,
  getById: (id: number) => fetch(`/api/blog/${id}`).then(res => res.json()) as Promise<BlogPost>,
  create: (data: InsertBlogPost) => apiRequest("POST", "/api/blog", data),
  update: (id: number, data: Partial<InsertBlogPost>) => apiRequest("PUT", `/api/blog/${id}`, data),
  delete: (id: number) => apiRequest("DELETE", `/api/blog/${id}`),
};

// Media API
export const mediaApi = {
  getAll: () => fetch("/api/media").then(res => res.json()) as Promise<MediaFile[]>,
  delete: (id: number) => apiRequest("DELETE", `/api/media/${id}`),
};

// Contact API
export const contactApi = {
  send: (data: InsertContact) => apiRequest("POST", "/api/contact", data),
  getAll: () => fetch("/api/contacts").then(res => res.json()) as Promise<Contact[]>,
};
