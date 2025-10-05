import { apiService } from '../../utils/api';
import { 
  Table, 
  TableCreate, 
  TableUpdate, 
  TableQRCode,
  QRCodeVerification,
  TableStatus,
  PaginatedResponse,
  ApiResponse,
  TableFilters
} from '../../types/api';

class TableService {
  // =============================================================================
  // TABLE MANAGEMENT
  // =============================================================================

  /**
   * Get tables with pagination and filtering
   */
  async getTables(filters?: TableFilters): Promise<PaginatedResponse<Table>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.venue_id) params.append('venue_id', filters.venue_id);
      if (filters?.table_status) params.append('table_status', filters.table_status);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

      const response = await apiService.get<PaginatedResponse<Table>>(`/tables?${params.toString()}`);
      
      console.log('🔍 tableService.getTables() - Raw response:', response);
      console.log('🔍 tableService.getTables() - Response.data:', response.data);
      console.log('🔍 tableService.getTables() - Response structure:', {
        hasSuccess: 'success' in response,
        hasData: 'data' in response,
        responseKeys: Object.keys(response),
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data)
      });
      
      // Handle different response structures from apiService
      if (response.data && typeof response.data === 'object') {
        // Case 1: response.data is already the PaginatedResponse
        if ('data' in response.data && Array.isArray(response.data.data)) {
          console.log('✅ Case 1: response.data is PaginatedResponse');
          return response.data;
        }
        // Case 2: response.data is the array directly
        else if (Array.isArray(response.data)) {
          console.log('✅ Case 2: response.data is array, wrapping in PaginatedResponse');
          return {
            success: true,
            data: response.data,
            total: response.data.length,
            page: 1,
            page_size: response.data.length,
            total_pages: 1,
            has_next: false,
            has_prev: false
          };
        }
      }
      
      console.log('⚠️ Fallback: Using empty PaginatedResponse');
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    } catch (error) {
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  /**
   * Get table by ID
   */
  async getTable(tableId: string): Promise<Table | null> {
    try {
      const response = await apiService.get<Table>(`/tables/${tableId}`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new table with QR code
   */
  async createTable(tableData: TableCreate): Promise<ApiResponse<Table>> {
    try {
      return await apiService.post<Table>('/tables', tableData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create table');
    }
  }

  /**
   * Update table information
   */
  async updateTable(tableId: string, tableData: TableUpdate): Promise<ApiResponse<Table>> {
    try {
      return await apiService.put<Table>(`/tables/${tableId}`, tableData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table');
    }
  }

  /**
   * Deactivate table
   */
  async deleteTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/tables/${tableId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete table');
    }
  }

  // =============================================================================
  // TABLE STATUS MANAGEMENT
  // =============================================================================

  /**
   * Update table status
   */
  async updateTableStatus(tableId: string, newStatus: TableStatus): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/tables/${tableId}/status?new_status=${newStatus}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update table status');
    }
  }

  /**
   * Mark table as occupied
   */
  async occupyTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/tables/${tableId}/occupy`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to occupy table');
    }
  }

  /**
   * Mark table as available
   */
  async freeTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<void>(`/tables/${tableId}/free`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to free table');
    }
  }

  // =============================================================================
  // QR CODE MANAGEMENT
  // =============================================================================

  /**
   * Get table QR code data
   */
  async getTableQRCode(tableId: string): Promise<TableQRCode | null> {
    try {
      const response = await apiService.get<TableQRCode>(`/tables/${tableId}/qr-code`);
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Regenerate QR code for table
   */
  async regenerateQRCode(tableId: string): Promise<ApiResponse<TableQRCode>> {
    try {
      return await apiService.post<TableQRCode>(`/tables/${tableId}/regenerate-qr`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to regenerate QR code');
    }
  }

  /**
   * Verify and decode table QR code
   */
  async verifyQRCode(qrCode: string): Promise<QRCodeVerification | null> {
    try {
      const response = await apiService.post<QRCodeVerification>('/tables/verify-qr', { qr_code: qrCode });
      return response.data || null;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // VENUE-SPECIFIC TABLE OPERATIONS
  // =============================================================================

  /**
   * Get all tables for a venue
   */
  async getVenueTables(venueId: string, status?: TableStatus): Promise<Table[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await apiService.get<Table[]>(`/tables/venues/${venueId}/tables${params}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Create multiple tables at once
   */
  async bulkCreateTables(
    venueId: string,
    startNumber: number,
    count: number,
    capacity: number = 4,
    location?: string
  ): Promise<ApiResponse<Table[]>> {
    try {
      const params = new URLSearchParams();
      params.append('venue_id', venueId);
      params.append('start_number', startNumber.toString());
      params.append('count', count.toString());
      params.append('capacity', capacity.toString());
      if (location) params.append('location', location);

      return await apiService.post<Table[]>(`/tables/bulk-create?${params.toString()}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create tables');
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get table status color for UI
   */
  getTableStatusColor(status: TableStatus): string {
    const colors = {
      available: '#10b981', // green
      reserved: '#f59e0b',    // yellow
      occupied: '#ef4444',  // red
      maintenance: '#6b7280', // gray
      out_of_service: '#374151' // dark gray
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Get table status icon
   */
  getTableStatusIcon(status: TableStatus): string {
    const icons = {
      available: '✅',
      reserved: '📅',
      occupied: '👥',
      maintenance: '🔧',
      out_of_service: '❌'
    };
    return icons[status] || '❓';
  }

  /**
   * Format table status for display
   */
  formatTableStatus(status: TableStatus): string {
    const labels = {
      available: 'Available',
      reserved: 'Reserved',
      occupied: 'Occupied',
      maintenance: 'Maintenance',
      out_of_service: 'Out of Service'
    };
    return labels[status] || status;
  }

  /**
   * Check if table can be occupied
   */
  canOccupyTable(table: Table): boolean {
    return table.is_active && ['available'].includes(table.table_status);
  }

  /**
   * Check if table can be freed
   */
  canFreeTable(table: Table): boolean {
    return table.is_active && ['occupied', 'reserved'].includes(table.table_status);
  }

  /**
   * Check if table can be edited
   */
  canEditTable(table: Table): boolean {
    return table.is_active && table.table_status !== 'occupied';
  }

  /**
   * Check if table can be deleted
   */
  canDeleteTable(table: Table): boolean {
    return table.table_status === 'available' || table.table_status === 'out_of_service';
  }

  /**
   * Validate table data before creation/update
   */
  validateTableData(tableData: TableCreate | TableUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('table_number' in tableData) {
      if (!tableData.table_number || tableData.table_number.trim() === '') {
        errors.push('Table number is required');
      }
      if (tableData.table_number && tableData.table_number.length > 10) {
        errors.push('Table number must be less than 10 characters');
      }
    }

    if ('capacity' in tableData) {
      if (!tableData.capacity || tableData.capacity < 1) {
        errors.push('Table capacity must be at least 1');
      }
      if (tableData.capacity && tableData.capacity > 50) {
        errors.push('Table capacity must be less than 50');
      }
    }

    if ('location' in tableData && tableData.location) {
      if (tableData.location.length > 100) {
        errors.push('Location description must be less than 100 characters');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Generate QR code URL for display
   */
  generateQRCodeURL(qrCode: string, size: number = 200): string {
    // This would typically use a QR code generation service
    // For now, return a placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrCode)}`;
  }

  /**
   * Get table capacity options for forms
   */
  getCapacityOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: '1 person' },
      { value: 2, label: '2 people' },
      { value: 4, label: '4 people' },
      { value: 6, label: '6 people' },
      { value: 8, label: '8 people' },
      { value: 10, label: '10 people' },
      { value: 12, label: '12 people' }
    ];
  }

  /**
   * Get table status options for forms
   */
  getStatusOptions(): Array<{ value: TableStatus; label: string; color: string }> {
    return [
      { value: 'available', label: 'Available', color: this.getTableStatusColor('available') },
      { value: 'reserved', label: 'Reserved', color: this.getTableStatusColor('reserved') },
      { value: 'occupied', label: 'Occupied', color: this.getTableStatusColor('occupied') },
      { value: 'maintenance', label: 'Maintenance', color: this.getTableStatusColor('maintenance') },
      { value: 'out_of_service', label: 'Out of Service', color: this.getTableStatusColor('out_of_service') }
    ];
  }

  /**
   * Sort tables by number
   */
  sortTablesByNumber(tables: Table[]): Table[] {
    return [...tables].sort((a, b) => {
      const aNum = parseInt(a.table_number) || 0;
      const bNum = parseInt(b.table_number) || 0;
      return aNum - bNum;
    });
  }

  /**
   * Group tables by status
   */
  groupTablesByStatus(tables: Table[]): Record<TableStatus, Table[]> {
    const grouped = tables.reduce((groups, table) => {
      const status = table.table_status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(table);
      return groups;
    }, {} as Record<TableStatus, Table[]>);

    // Ensure all statuses are present
    const allStatuses: TableStatus[] = ['available', 'reserved', 'occupied', 'maintenance', 'out_of_service'];
    allStatuses.forEach(status => {
      if (!grouped[status]) {
        grouped[status] = [];
      }
    });

    return grouped;
  }

  /**
   * Get table statistics
   */
  getTableStatistics(tables: Table[]): {
    total: number;
    active: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
    outOfService: number;
    totalCapacity: number;
    averageCapacity: number;
  } {
    const active = tables.filter(t => t.is_active);
    const available = tables.filter(t => t.table_status === 'available');
    const occupied = tables.filter(t => t.table_status === 'occupied');
    const reserved = tables.filter(t => t.table_status === 'reserved');
    const maintenance = tables.filter(t => t.table_status === 'maintenance');
    const outOfService = tables.filter(t => t.table_status === 'out_of_service');
    
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    const averageCapacity = tables.length > 0 ? totalCapacity / tables.length : 0;

    return {
      total: tables.length,
      active: active.length,
      available: available.length,
      occupied: occupied.length,
      reserved: reserved.length,
      maintenance: maintenance.length,
      outOfService: outOfService.length,
      totalCapacity,
      averageCapacity: Math.round(averageCapacity * 100) / 100
    };
  }

  /**
   * Check for table number conflicts
   */
  checkTableNumberConflict(tables: Table[], tableNumber: string, excludeTableId?: string): boolean {
    return tables.some(table => 
      table.table_number === tableNumber && 
      table.id !== excludeTableId &&
      table.is_active
    );
  }

  /**
   * Suggest next available table number
   */
  suggestNextTableNumber(tables: Table[]): string {
    const activeTables = tables.filter(t => t.is_active);
    const usedNumbers = activeTables.map(t => parseInt(t.table_number) || 0).sort((a, b) => a - b);
    
    // Find the first gap in the sequence
    for (let i = 1; i <= usedNumbers.length + 1; i++) {
      if (!usedNumbers.includes(i)) {
        return i.toString();
      }
    }
    
    return (usedNumbers.length + 1).toString();
  }

  /**
   * Toggle table availability (for backward compatibility)
   */
  async toggleTableAvailability(tableId: string): Promise<Table> {
    try {
      const table = await this.getTable(tableId);
      if (!table) {
        throw new Error('Table not found');
      }

      const newStatus: TableStatus = table.table_status === 'available' ? 'occupied' : 'available';
      const response = await this.updateTableStatus(tableId, newStatus);
      
      if (response.success) {
        return { ...table, table_status: newStatus };
      } else {
        throw new Error(response.message || 'Failed to toggle table status');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle table availability');
    }
  }

  /**
   * Get table areas (for backward compatibility)
   */
  async getAreas(venueId: string): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/table-areas/venues/${venueId}/areas`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Create area (for backward compatibility)
   */
  async createArea(areaData: any, venueId?: string): Promise<any> {
    try {
      const response = await apiService.post<any>('/table-areas/areas', {
        ...areaData,
        venue_id: venueId || areaData.venue_id
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create area');
    }
  }

  /**
   * Update area (for backward compatibility)
   */
  async updateArea(areaData: any): Promise<any> {
    try {
      const response = await apiService.put<any>(`/table-areas/areas/${areaData.id}`, areaData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update area');
    }
  }

  /**
   * Delete area (for backward compatibility)
   */
  async deleteArea(areaId: string): Promise<any> {
    try {
      const response = await apiService.delete<any>(`/table-areas/areas/${areaId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete area');
    }
  }
}

export const tableService = new TableService();

// Export types for components
export type { Table } from '../../types/api';