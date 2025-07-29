import { apiService } from './api';
import { ApiResponse } from '../types';

// Table-related types
export interface Table {
  id: string;
  venue_id: string;
  table_number: number;
  table_name?: string;
  capacity: number;
  table_status: TableStatus;
  qr_code: string;
  qr_code_url?: string;
  location: {
    section?: string;
    floor?: string;
    position?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  features?: string[];
  is_active: boolean;
  is_reserved: boolean;
  reservation_details?: {
    customer_name: string;
    customer_phone: string;
    reservation_time: string;
    party_size: number;
    special_requests?: string;
  };
  current_order_id?: string;
  last_cleaned?: string;
  created_at: string;
  updated_at: string;
}

export interface TableCreate {
  venue_id: string;
  table_number: number;
  table_name?: string;
  capacity: number;
  location?: {
    section?: string;
    floor?: string;
    position?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  features?: string[];
}

export interface TableUpdate {
  table_number?: number;
  table_name?: string;
  capacity?: number;
  table_status?: TableStatus;
  location?: {
    section?: string;
    floor?: string;
    position?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  features?: string[];
  is_active?: boolean;
}

export type TableStatus = 
  | 'available' 
  | 'occupied' 
  | 'reserved' 
  | 'cleaning' 
  | 'maintenance' 
  | 'out_of_order';

export interface TableReservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_time: string;
  party_size: number;
  duration_minutes?: number;
  special_requests?: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'seated' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface TableAnalytics {
  venue_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_tables: number;
  average_utilization: number;
  peak_hours: Array<{
    hour: number;
    utilization_rate: number;
    occupied_tables: number;
  }>;
  table_performance: Array<{
    table_id: string;
    table_number: number;
    total_orders: number;
    total_revenue: number;
    utilization_rate: number;
    average_order_value: number;
  }>;
  reservation_stats: {
    total_reservations: number;
    confirmed_reservations: number;
    no_shows: number;
    cancellations: number;
  };
}

export interface TableLayout {
  venue_id: string;
  layout_name: string;
  sections: Array<{
    id: string;
    name: string;
    floor?: string;
    tables: Array<{
      table_id: string;
      position: {
        x: number;
        y: number;
      };
      rotation?: number;
    }>;
  }>;
  created_at: string;
  updated_at: string;
}

class TableService {
  // Get tables with filtering
  async getTables(filters?: {
    venue_id?: string;
    status?: TableStatus;
    section?: string;
    floor?: string;
    available_only?: boolean;
  }): Promise<Table[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.section) params.append('section', filters.section);
      if (filters?.floor) params.append('floor', filters.floor);
      if (filters?.available_only !== undefined) params.append('available_only', filters.available_only.toString());

      const response = await apiService.get<Table[]>(`/tables?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get tables:', error);
      return [];
    }
  }

  // Get table by ID
  async getTable(tableId: string): Promise<Table | null> {
    try {
      const response = await apiService.get<Table>(`/tables/${tableId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get table:', error);
      return null;
    }
  }

  // Get venue tables
  async getVenueTables(venueId: string): Promise<Table[]> {
    try {
      const response = await apiService.get<Table[]>(`/tables/venues/${venueId}/tables`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get venue tables:', error);
      return [];
    }
  }

  // Create new table
  async createTable(tableData: TableCreate): Promise<ApiResponse<Table>> {
    try {
      return await apiService.post<Table>('/tables', tableData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create table');
    }
  }

  // Update table
  async updateTable(tableId: string, tableData: TableUpdate): Promise<ApiResponse<Table>> {
    try {
      return await apiService.put<Table>(`/tables/${tableId}`, tableData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table');
    }
  }

  // Delete table
  async deleteTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/tables/${tableId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete table');
    }
  }

  // Update table status
  async updateTableStatus(tableId: string, status: TableStatus): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/tables/${tableId}/status`, { status });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table status');
    }
  }

  // Bulk update table statuses
  async bulkUpdateTableStatus(updates: Array<{ table_id: string; status: TableStatus }>): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>('/tables/bulk-status-update', { updates });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to bulk update table statuses');
    }
  }

  // QR Code Management

  // Generate QR code for table
  async generateTableQR(tableId: string, customization?: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    template?: string;
  }): Promise<ApiResponse<{ qr_code_url: string; qr_code_base64: string }>> {
    try {
      return await apiService.post<{ qr_code_url: string; qr_code_base64: string }>(
        `/tables/${tableId}/generate-qr`, 
        customization || {}
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to generate QR code');
    }
  }

  // Regenerate QR code for table
  async regenerateTableQR(tableId: string): Promise<ApiResponse<{ qr_code_url: string; qr_code_base64: string }>> {
    try {
      return await apiService.post<{ qr_code_url: string; qr_code_base64: string }>(`/tables/${tableId}/regenerate-qr`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to regenerate QR code');
    }
  }

  // Bulk generate QR codes for venue
  async bulkGenerateQRCodes(venueId: string, customization?: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    template?: string;
  }): Promise<ApiResponse<Array<{ table_id: string; qr_code_url: string; qr_code_base64: string }>>> {
    try {
      return await apiService.post<Array<{ table_id: string; qr_code_url: string; qr_code_base64: string }>>(
        `/tables/venues/${venueId}/bulk-generate-qr`, 
        customization || {}
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to bulk generate QR codes');
    }
  }

  // Table Reservations

  // Get table reservations
  async getTableReservations(tableId: string, filters?: {
    status?: ReservationStatus;
    date?: string;
  }): Promise<TableReservation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date) params.append('date', filters.date);

      const response = await apiService.get<TableReservation[]>(`/tables/${tableId}/reservations?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get table reservations:', error);
      return [];
    }
  }

  // Create table reservation
  async createReservation(reservationData: {
    table_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    reservation_time: string;
    party_size: number;
    duration_minutes?: number;
    special_requests?: string;
  }): Promise<ApiResponse<TableReservation>> {
    try {
      return await apiService.post<TableReservation>('/tables/reservations', reservationData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create reservation');
    }
  }

  // Update reservation
  async updateReservation(reservationId: string, reservationData: {
    reservation_time?: string;
    party_size?: number;
    special_requests?: string;
    status?: ReservationStatus;
  }): Promise<ApiResponse<TableReservation>> {
    try {
      return await apiService.put<TableReservation>(`/tables/reservations/${reservationId}`, reservationData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update reservation');
    }
  }

  // Cancel reservation
  async cancelReservation(reservationId: string, reason?: string): Promise<ApiResponse<void>> {
    try {
      const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      return await apiService.post<void>(`/tables/reservations/${reservationId}/cancel${params}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to cancel reservation');
    }
  }

  // Confirm reservation (customer seated)
  async confirmReservation(reservationId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/tables/reservations/${reservationId}/confirm`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to confirm reservation');
    }
  }

  // Analytics and Reporting

  // Get table analytics
  async getTableAnalytics(venueId: string, startDate?: string, endDate?: string): Promise<TableAnalytics | null> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiService.get<TableAnalytics>(`/tables/venues/${venueId}/analytics?${params.toString()}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get table analytics:', error);
      return null;
    }
  }

  // Get table utilization
  async getTableUtilization(venueId: string, date?: string): Promise<{
    total_tables: number;
    occupied_tables: number;
    utilization_rate: number;
    peak_hour: number;
    peak_utilization: number;
  } | null> {
    try {
      const params = date ? `?date=${date}` : '';
      const response = await apiService.get<any>(`/tables/venues/${venueId}/utilization${params}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get table utilization:', error);
      return null;
    }
  }

  // Table Layout Management

  // Get table layout
  async getTableLayout(venueId: string): Promise<TableLayout | null> {
    try {
      const response = await apiService.get<TableLayout>(`/tables/venues/${venueId}/layout`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get table layout:', error);
      return null;
    }
  }

  // Update table layout
  async updateTableLayout(venueId: string, layoutData: Omit<TableLayout, 'venue_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<TableLayout>> {
    try {
      return await apiService.put<TableLayout>(`/tables/venues/${venueId}/layout`, layoutData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table layout');
    }
  }

  // Utility Methods

  // Get table status color
  getTableStatusColor(status: TableStatus): string {
    const colors = {
      available: '#10b981',
      occupied: '#ef4444',
      reserved: '#f59e0b',
      cleaning: '#3b82f6',
      maintenance: '#8b5cf6',
      out_of_order: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  // Format table status for display
  formatTableStatus(status: TableStatus): string {
    const labels = {
      available: 'Available',
      occupied: 'Occupied',
      reserved: 'Reserved',
      cleaning: 'Cleaning',
      maintenance: 'Maintenance',
      out_of_order: 'Out of Order'
    };
    return labels[status] || status;
  }

  // Get reservation status color
  getReservationStatusColor(status: ReservationStatus): string {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      seated: '#3b82f6',
      completed: '#059669',
      cancelled: '#ef4444',
      no_show: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  // Format reservation status for display
  formatReservationStatus(status: ReservationStatus): string {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      seated: 'Seated',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show'
    };
    return labels[status] || status;
  }

  // Check if table is available for reservation
  isTableAvailableForReservation(table: Table, reservationTime: string, durationMinutes: number = 120): boolean {
    if (table.table_status !== 'available' || !table.is_active) {
      return false;
    }

    // Additional logic would check existing reservations
    // This is a simplified version
    return true;
  }

  // Calculate table capacity utilization
  calculateCapacityUtilization(tables: Table[]): {
    total_capacity: number;
    occupied_capacity: number;
    utilization_rate: number;
  } {
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    const occupiedCapacity = tables
      .filter(table => table.table_status === 'occupied')
      .reduce((sum, table) => sum + table.capacity, 0);
    
    const utilizationRate = totalCapacity > 0 ? (occupiedCapacity / totalCapacity) * 100 : 0;

    return {
      total_capacity: totalCapacity,
      occupied_capacity: occupiedCapacity,
      utilization_rate: Math.round(utilizationRate * 100) / 100
    };
  }

  // Get tables by section
  getTablesBySection(tables: Table[]): Record<string, Table[]> {
    return tables.reduce((sections, table) => {
      const section = table.location.section || 'Main';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(table);
      return sections;
    }, {} as Record<string, Table[]>);
  }

  // Get available tables for party size
  getAvailableTablesForPartySize(tables: Table[], partySize: number): Table[] {
    return tables.filter(table => 
      table.table_status === 'available' && 
      table.is_active && 
      table.capacity >= partySize
    ).sort((a, b) => a.capacity - b.capacity); // Sort by capacity (smallest suitable first)
  }

  // Format table display name
  formatTableDisplayName(table: Table): string {
    if (table.table_name) {
      return `${table.table_name} (Table ${table.table_number})`;
    }
    return `Table ${table.table_number}`;
  }

  // Validate table data
  validateTableData(tableData: TableCreate | TableUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('table_number' in tableData && tableData.table_number !== undefined) {
      if (tableData.table_number <= 0) {
        errors.push('Table number must be greater than 0');
      }
    }

    if ('capacity' in tableData && tableData.capacity !== undefined) {
      if (tableData.capacity <= 0) {
        errors.push('Table capacity must be greater than 0');
      }
      if (tableData.capacity > 20) {
        errors.push('Table capacity cannot exceed 20 people');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

export const tableService = new TableService();