export interface MediaFile {
  id: string | number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date | string | null;
  updatedAt?: any;
  width?: any;
  height?: any;
  alt?: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface InsertMediaFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}
