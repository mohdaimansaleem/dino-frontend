import { apiService } from './api';
import { ApiResponse } from '../types';

export interface Table {
  id: string;
  table_number: string;
  venue_id: string;
  capacity: number;
  table_status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  qr_code: string;
  location: {
    section?: string;
    floor?: string;
    position?: string;
  };
  features: string[];
  current_order_id?: string;
  last_cleaned?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TableCreate {
  table_number: string;
  venue_id: string;
  capacity: number;
  location?: {
    section?: string;
    floor?: string;
    position?: string;
  };
  features?: string[];
  notes?: string;
}

export interface TableStatusUpdate {
  table_status: Table['table_status'];
  notes?: string;
}

class TableService {
  async getTables(venueId?: string): Promise<Table[]> {
    try {
      const params = venueId ? { venue_id: venueId } : {};
      const response = await apiService.get<Table[]>('/tables', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch tables');
      }
    } catch (error: any) {
      console.error('Get tables error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch tables');
    }
  }

  async getTable(tableId: string): Promise<Table> {
    try {
      const response = await apiService.get<Table>(`/tables/${tableId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch table');
      }
    } catch (error: any) {
      console.error('Get table error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch table');
    }
  }

  async getTableByQR(qrCode: string): Promise<{ table: Table; venue: any; menu: any }> {
    try {
      const response = await apiService.get<{ table: Table; venue: any; menu: any }>(`/public/qr/${qrCode}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Invalid QR code');
      }
    } catch (error: any) {
      console.error('Get table by QR error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Invalid QR code');
    }
  }

  async createTable(tableData: TableCreate): Promise<Table> {
    try {
      const response = await apiService.post<Table>('/tables', tableData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create table');
      }
    } catch (error: any) {
      console.error('Create table error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create table');
    }
  }

  async updateTable(tableId: string, tableData: Partial<TableCreate>): Promise<Table> {
    try {
      const response = await apiService.put<Table>(`/tables/${tableId}`, tableData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update table');
      }
    } catch (error: any) {
      console.error('Update table error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table');
    }
  }

  async updateTableStatus(tableId: string, statusData: TableStatusUpdate): Promise<Table> {
    try {
      const response = await apiService.put<Table>(`/tables/${tableId}/status`, statusData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update table status');
      }
    } catch (error: any) {
      console.error('Update table status error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table status');
    }
  }

  async deleteTable(tableId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/tables/${tableId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete table');
      }
    } catch (error: any) {
      console.error('Delete table error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete table');
    }
  }

  async generateQRCode(tableId: string): Promise<string> {
    try {
      const response = await apiService.post<{ qr_code: string }>(`/tables/${tableId}/qr-code`);
      
      if (response.success && response.data) {
        return response.data.qr_code;
      } else {
        throw new Error(response.message || 'Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('Generate QR code error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate QR code');
    }
  }

  async getTableAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = { venue_id: venueId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiService.get('/tables/analytics', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch table analytics');
      }
    } catch (error: any) {
      console.error('Get table analytics error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch table analytics');
    }
  }

  async markTableCleaned(tableId: string): Promise<void> {
    try {
      const response = await apiService.post(`/tables/${tableId}/cleaned`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark table as cleaned');
      }
    } catch (error: any) {
      console.error('Mark table cleaned error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to mark table as cleaned');
    }
  }

  async getAvailableTables(venueId: string): Promise<Table[]> {
    try {
      const response = await apiService.get<Table[]>('/tables', {
        venue_id: venueId,
        status: 'available'
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch available tables');
      }
    } catch (error: any) {
      console.error('Get available tables error:', error);
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch available tables');
    }
  }
}

export const tableService = new TableService();