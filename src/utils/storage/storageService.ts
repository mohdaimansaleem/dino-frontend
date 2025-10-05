// import { ApiResponse } from '../types';
import { apiService } from '../api';

export interface UploadResponse {
  success: boolean;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadTimestamp: string;
}

export interface BulkUploadResponse {
  success: boolean;
  uploadedFiles: UploadResponse[];
  failedFiles: Array<{ filename: string; error: string }>;
  totalUploaded: number;
  totalFailed: number;
}

export interface FileInfo {
  name: string;
  size: number;
  contentType: string;
  created: string;
  updated: string;
  publicUrl?: string;
  md5Hash: string;
  etag: string;
}

class StorageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  // Image upload methods
  async uploadImage(
    file: File, 
    folder?: string, 
    optimize: boolean = true,
    generateThumbnails: boolean = false
  ): Promise<UploadResponse> {
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    formData.append('optimize', optimize.toString());
    formData.append('generate_thumbnails', generateThumbnails.toString());

    try {
      const response = await apiService.post<UploadResponse>('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Upload failed');
    }
  }

  async uploadMultipleImages(
    files: File[], 
    folder?: string, 
    optimize: boolean = true
  ): Promise<BulkUploadResponse> {
    if (files.length > 10) {
      throw new Error('Maximum 10 files allowed per upload');
    }

    files.forEach(file => this.validateImageFile(file));

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    formData.append('optimize', optimize.toString());

    try {
      const response = await apiService.post<BulkUploadResponse>('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Upload failed');
    }
  }

  async uploadProfileImage(file: File): Promise<UploadResponse> {
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.post<UploadResponse>('/users/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Profile image upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Profile image upload failed');
    }
  }

  async uploadMenuItemImage(file: File, menuItemId: string): Promise<UploadResponse> {
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('menu_item_id', menuItemId);

    try {
      const response = await apiService.post<UploadResponse>('/uploads/menu-item-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Menu item image upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Menu item image upload failed');
    }
  }

  async uploadCafeLogo(file: File, cafeId: string): Promise<UploadResponse> {
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cafe_id', cafeId);

    try {
      const response = await apiService.post<UploadResponse>('/uploads/cafe-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Cafe logo upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Cafe logo upload failed');
    }
  }

  async uploadCafeCover(file: File, cafeId: string): Promise<UploadResponse> {
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cafe_id', cafeId);

    try {
      const response = await apiService.post<UploadResponse>('/uploads/cafe-cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Cafe cover image upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Cafe cover image upload failed');
    }
  }

  // Document upload methods
  async uploadDocument(file: File, folder?: string): Promise<UploadResponse> {
    this.validateDocumentFile(file);

    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    try {
      const response = await apiService.post<UploadResponse>('/uploads/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Document upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Document upload failed');
    }
  }

  // File management methods
  async deleteFile(filePath: string): Promise<void> {
    try {
      const response = await apiService.delete(`/uploads/file/${encodeURIComponent(filePath)}`);

      if (!response.success) {
        throw new Error(response.message || 'File deletion failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'File deletion failed');
    }
  }

  async deleteMultipleFiles(filePaths: string[]): Promise<{ successful: number; failed: number; results: Record<string, boolean> }> {
    try {
      const response = await apiService.delete('/uploads/files', {
        data: { file_paths: filePaths }
      });

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'File deletion failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'File deletion failed');
    }
  }

  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const response = await apiService.get<FileInfo>(`/uploads/file-info/${encodeURIComponent(filePath)}`);

      if (response.success && response.data) {
        return response.data as any;
      }

      throw new Error(response.message || 'Failed to get file info');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get file info');
    }
  }

  async listFiles(prefix: string = '', maxResults: number = 100): Promise<FileInfo[]> {
    try {
      const params = new URLSearchParams();
      if (prefix) params.append('prefix', prefix);
      params.append('max_results', maxResults.toString());

      const response = await apiService.get<FileInfo[]>(`/uploads/files?${params}`);

      if (response.success && response.data) {
        return response.data as any;
      }

      return [];
    } catch (error: any) {
      return [];
    }
  }

  async getSignedUrl(filePath: string, expirationHours: number = 1): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('expiration_hours', expirationHours.toString());

      const response = await apiService.get(`/uploads/signed-url/${encodeURIComponent(filePath)}?${params}`);

      if (response.success) {
        // This endpoint returns a redirect, so we need to handle it differently
        return (response.data as string) || response.message || '';
      }

      throw new Error('Failed to get signed URL');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get signed URL');
    }
  }

  // Validation methods
  private validateImageFile(file: File): void {
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  }

  private validateDocumentFile(file: File): void {
    if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${this.ALLOWED_DOCUMENT_TYPES.join(', ')}`);
    }

    if (file.size > this.MAX_FILE_SIZE * 2) { // 10MB for documents
      throw new Error(`File too large. Maximum size: ${(this.MAX_FILE_SIZE * 2) / (1024 * 1024)}MB`);
    }
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  isImageFile(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  isDocumentFile(file: File): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(file.type);
  }

  // Image processing utilities
  async resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return this.resizeImage(file, 1920, 1080, quality);
  }
}

export const storageService = new StorageService();