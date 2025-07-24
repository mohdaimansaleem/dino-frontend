import { apiService } from './api';

export interface QRCodeData {
  id: string;
  tableId: string;
  cafeId: string;
  cafeName: string;
  tableNumber: string;
  qrCodeUrl: string;
  qrCodeBase64: string; // Made required since we always generate it
  menuUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRGenerationRequest {
  cafeId: string;
  tableId: string;
  cafeName: string;
  tableNumber: string;
  customization?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    template?: 'classic' | 'modern' | 'elegant' | 'minimal';
  };
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
      // In demo mode, return mock data
      if (localStorage.getItem('dino_demo_mode') === 'true') {
        return this.generateMockQR(request);
      }
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

  // Get all QR codes for a cafe
  async getCafeQRCodes(cafeId: string): Promise<QRCodeData[]> {
    try {
      const response = await apiService.get<QRCodeData[]>(`/qr/cafe/${cafeId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to get cafe QR codes:', error);
      return [];
    }
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
      // In demo mode, return mock base64 QR
      if (localStorage.getItem('dino_demo_mode') === 'true') {
        return this.generateMockQRBase64(request);
      }
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

  // Mock QR generation for demo mode
  private generateMockQR(request: QRGenerationRequest): QRCodeData {
    const menuUrl = `${window.location.origin}/menu/${request.cafeId}/${request.tableId}`;
    
    return {
      id: `qr-${Date.now()}`,
      tableId: request.tableId,
      cafeId: request.cafeId,
      cafeName: request.cafeName,
      tableNumber: request.tableNumber,
      qrCodeUrl: `/api/qr/mock-${request.tableId}.png`,
      qrCodeBase64: this.generateMockQRBase64(request),
      menuUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Generate mock base64 QR code (simple placeholder)
  private generateMockQRBase64(request: QRGenerationRequest): string {
    // Create a simple SVG QR code placeholder
    const size = 200;
    const cellSize = size / 21; // 21x21 grid for better QR pattern
    
    // Simple pattern for demo (21x21 QR code pattern)
    const pattern = [
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
      [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,0,1,1,0,1,1],
      [0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,1,0,1,1,0,0],
      [1,1,1,0,0,1,1,1,1,0,1,0,1,1,1,0,1,0,0,1,1],
      [0,0,0,1,1,0,0,0,0,1,0,1,0,0,0,1,0,1,1,0,0],
      [1,1,1,0,0,1,1,1,1,0,1,0,1,1,1,0,1,0,0,1,1],
      [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,0,1,1,0,0],
      [1,1,1,1,1,1,1,0,0,1,1,1,0,0,1,0,1,0,0,1,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0,1,1,0,0],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,1],
      [1,0,1,1,1,0,1,0,1,1,1,1,1,0,0,1,0,1,1,0,0],
      [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,1],
      [1,0,0,0,0,0,1,0,1,0,1,0,1,0,0,1,0,1,1,0,0],
      [1,1,1,1,1,1,1,0,0,1,1,1,0,0,1,1,1,1,1,1,1],
    ];

    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          svg += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    
    // Convert SVG to base64
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Utility function to create menu URL
  createMenuUrl(cafeId: string, tableId: string): string {
    return `${window.location.origin}/menu/${cafeId}/${tableId}`;
  }

  // Validate QR code URL
  validateQRUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      
      // Should match pattern: /menu/{cafeId}/{tableId}
      return pathParts.length === 3 && pathParts[0] === 'menu';
    } catch {
      return false;
    }
  }
}

export const qrService = new QRService();