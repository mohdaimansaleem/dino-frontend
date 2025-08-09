import { apiService } from './api';

export interface QRCodeData {
  id: string;
  tableId: string;
  venueId: string;
  venueName: string;
  tableNumber: string;
  qrCodeUrl: string;
  qrCodeBase64: string; // Made required since we always generate it
  menuUrl: string;
  createdAt: string;
  updatedAt: string;
  // Legacy compatibility
  cafeId?: string;
  cafeName?: string;
}

export interface QRGenerationRequest {
  venueId: string;
  tableId: string;
  venueName: string;
  tableNumber: string;
  customization?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    template?: 'classic' | 'modern' | 'elegant' | 'minimal';
  };
  // Legacy compatibility
  cafeId?: string;
  cafeName?: string;
}

class QRService {
  // Generate QR code for a table
  async generateTableQR(request: QRGenerationRequest): Promise<QRCodeData> {
    try {
      const response = await apiService.post<QRCodeData>('/qr/generate', request);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to generate QR code');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate QR code');
    }
  }

  // Get QR code data
  async getQRCode(qrId: string): Promise<QRCodeData> {
    try {
      const response = await apiService.get<QRCodeData>(`/qr/${qrId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'QR code not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to get QR code');
    }
  }

  // Get all QR codes for a venue
  async getVenueQRCodes(venueId: string): Promise<QRCodeData[]> {
    try {
      const response = await apiService.get<QRCodeData[]>(`/qr/venue/${venueId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      return [];
    }
  }

  // Legacy method for backward compatibility
  async getCafeQRCodes(cafeId: string): Promise<QRCodeData[]> {
    return this.getVenueQRCodes(cafeId);
  }

  // Regenerate QR code
  async regenerateQR(qrId: string, request: QRGenerationRequest): Promise<QRCodeData> {
    try {
      const response = await apiService.put<QRCodeData>(`/qr/${qrId}/regenerate`, request);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to regenerate QR code');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to regenerate QR code');
    }
  }

  // Delete QR code
  async deleteQR(qrId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/qr/${qrId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete QR code');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete QR code');
    }
  }

  // Generate QR code as base64 for immediate use
  async generateQRBase64(request: QRGenerationRequest): Promise<string> {
    try {
      const response = await apiService.post<{ qrCodeBase64: string }>('/qr/generate-base64', request);
      
      if (response.success && response.data) {
        return response.data.qrCodeBase64;
      }
      
      throw new Error(response.message || 'Failed to generate QR code');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate QR code');
    }
  }

  // Bulk generate QR codes for multiple tables
  async bulkGenerateQR(requests: QRGenerationRequest[]): Promise<QRCodeData[]> {
    try {
      const response = await apiService.post<QRCodeData[]>('/qr/bulk-generate', { requests });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to generate QR codes');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate QR codes');
    }
  }

  // Generate print-ready QR template
  async generatePrintTemplate(qrId: string, template: 'classic' | 'modern' | 'elegant' | 'minimal' = 'classic'): Promise<string> {
    try {
      const response = await apiService.get<{ templateHtml: string }>(`/qr/${qrId}/print-template?template=${template}`);
      
      if (response.success && response.data) {
        return response.data.templateHtml;
      }
      
      throw new Error(response.message || 'Failed to generate print template');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate print template');
    }
  }



  // Utility function to create menu URL
  createMenuUrl(venueId: string, tableId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${venueId}/${tableId}`;
  }

  // Legacy method for backward compatibility
  createCafeMenuUrl(cafeId: string, tableId: string): string {
    return this.createMenuUrl(cafeId, tableId);
  }

  // Validate QR code URL
  validateQRUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      
      // Should match pattern: /menu/{venueId}/{tableId}
      return pathParts.length === 3 && pathParts[0] === 'menu';
    } catch {
      return false;
    }
  }
}

export const qrService = new QRService();