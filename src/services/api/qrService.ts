// import { apiService } from '../../utils/api'; // Commented out as it's not used
import QRCode from 'qrcode';

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
    template?: 'classic' | 'modern' | 'elegant' | 'minimal' | 'premium' | 'colorful' | 'retro' | 'tech' | 'nature' | 'artistic' | 'corporate' | 'festive' | 'business' | 'simple' | 'professional' | 'clean' | 'standard';
  };
  // Legacy compatibility
  cafeId?: string;
  cafeName?: string;
}

class QRService {
  // Base URL for the application
  private getBaseUrl(): string {
    // Use current window location as base URL for dynamic deployment
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback for server-side rendering or when window is not available
    return 'https://dino-frontend-867506203789.us-central1.run.app';
  }

  // Generate QR code for a table
  async generateTableQR(request: QRGenerationRequest): Promise<QRCodeData> {
    try {
      // Generate the actual menu URL
      const menuUrl = this.createMenuUrl(request.venueId, request.tableId);
      
      // Generate QR code as base64
      const qrCodeBase64 = await QRCode.toDataURL(menuUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: request.customization?.primaryColor || '#000000',
          light: '#FFFFFF'
        }
      });

      // Create QR code data
      const qrData: QRCodeData = {
        id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tableId: request.tableId,
        venueId: request.venueId,
        venueName: request.venueName,
        tableNumber: request.tableNumber,
        qrCodeUrl: menuUrl,
        qrCodeBase64: qrCodeBase64,
        menuUrl: menuUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Legacy compatibility
        cafeId: request.cafeId,
        cafeName: request.cafeName
      };

      return qrData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate QR code');
    }
  }

  // Get QR code data
  async getQRCode(qrId: string): Promise<QRCodeData> {
    try {
      // This method should be implemented to fetch QR code data from the backend
      // For now, throw an error indicating this needs to be implemented
      throw new Error('QR code retrieval not implemented. Use generateTableQR instead.');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get QR code');
    }
  }

  // Get all QR codes for a venue
  async getVenueQRCodes(venueId: string): Promise<QRCodeData[]> {
    // This method should be implemented to fetch venue QR codes from the backend
    // For now, return empty array - QR codes will be generated on demand
    return [];
  }

  // Legacy method for backward compatibility
  async getCafeQRCodes(cafeId: string): Promise<QRCodeData[]> {
    return this.getVenueQRCodes(cafeId);
  }

  // Regenerate QR code
  async regenerateQR(qrId: string, request: QRGenerationRequest): Promise<QRCodeData> {
    try {
      // Generate the actual menu URL
      const menuUrl = this.createMenuUrl(request.venueId, request.tableId);
      
      const qrCodeBase64 = await QRCode.toDataURL(menuUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: request.customization?.primaryColor || '#000000',
          light: '#FFFFFF'
        }
      });

      const qrData: QRCodeData = {
        id: qrId,
        tableId: request.tableId,
        venueId: request.venueId,
        venueName: request.venueName,
        tableNumber: request.tableNumber,
        qrCodeUrl: menuUrl,
        qrCodeBase64: qrCodeBase64,
        menuUrl: menuUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cafeId: request.cafeId,
        cafeName: request.cafeName
      };

      return qrData;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to regenerate QR code');
    }
  }

  // Delete QR code
  async deleteQR(qrId: string): Promise<void> {
    try {
      // This method should be implemented to delete QR code from the backend
      throw new Error('QR code deletion not implemented');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete QR code');
    }
  }

  // Generate QR code as base64 for immediate use
  async generateQRBase64(request: QRGenerationRequest): Promise<string> {
    try {
      const menuUrl = this.createMenuUrl(request.venueId, request.tableId);
      
      const qrCodeBase64 = await QRCode.toDataURL(menuUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: request.customization?.primaryColor || '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeBase64;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate QR code');
    }
  }

  // Bulk generate QR codes for multiple tables
  async bulkGenerateQR(requests: QRGenerationRequest[]): Promise<QRCodeData[]> {
    try {
      const qrCodes: QRCodeData[] = [];
      
      for (const request of requests) {
        const qrData = await this.generateTableQR(request);
        qrCodes.push(qrData);
      }
      
      return qrCodes;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate QR codes');
    }
  }

  // Generate print-ready QR template
  async generatePrintTemplate(qrData: QRCodeData, template: 'classic' | 'modern' | 'elegant' | 'minimal' | 'premium' | 'colorful' | 'retro' | 'tech' | 'nature' | 'artistic' | 'corporate' | 'festive' | 'business' | 'simple' | 'professional' | 'clean' | 'standard' = 'classic'): Promise<string> {
    try {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${qrData.venueName} Table ${qrData.tableNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { border: 2px solid #333; padding: 20px; margin: 20px auto; max-width: 300px; }
            .qr-code img { max-width: 200px; height: auto; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${qrData.venueName}</h2>
            <h3>Table ${qrData.tableNumber}</h3>
            <div class="qr-code">
              <img src="${qrData.qrCodeBase64}" alt="QR Code" />
            </div>
            <p>Scan to view menu</p>
          </div>
        </body>
        </html>
      `;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate print template');
    }
  }



  // Utility function to create menu URL
  createMenuUrl(venueId: string, tableId: string): string {
    const baseUrl = this.getBaseUrl();
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