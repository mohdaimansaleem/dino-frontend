/**
 * Tour Service - Manages dashboard tour API interactions
 */
import { apiService } from '../../utils/api';

export interface TourStatus {
  user_id: string;
  first_login_completed: boolean;
  tour_completed: boolean;
  tour_completed_at?: string;
  tour_skipped: boolean;
  should_show_tour: boolean;
}

// API response interfaces are handled with generic 'any' type
// to allow flexible response handling and proper type mapping

class TourService {
  private baseUrl = '/tour';

  /**
   * Get current user's tour status
   */
  async getTourStatus(): Promise<TourStatus> {
    try {
      const response = await apiService.get<any>(`${this.baseUrl}/status`);
      
      if (response.success && response.data) {
        // Ensure the response data matches TourStatus interface
        const tourStatus: TourStatus = {
          user_id: response.data.user_id,
          first_login_completed: response.data.first_login_completed || false,
          tour_completed: response.data.tour_completed || false,
          tour_completed_at: response.data.tour_completed_at,
          tour_skipped: response.data.tour_skipped || false,
          should_show_tour: response.data.should_show_tour || false,
        };
        return tourStatus;
      }
      
      throw new Error(response.message || 'Failed to get tour status');
    } catch (error: any) {
      console.error('Error getting tour status:', error);
      throw new Error(error.message || 'Failed to get tour status');
    }
  }

  /**
   * Mark tour as completed
   */
  async completeTour(): Promise<void> {
    try {
      const response = await apiService.post<any>(`${this.baseUrl}/complete`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to complete tour');
      }
      
      console.log('✅ Tour completed successfully');
    } catch (error: any) {
      console.error('Error completing tour:', error);
      throw new Error(error.message || 'Failed to complete tour');
    }
  }

  /**
   * Mark tour as skipped
   */
  async skipTour(): Promise<void> {
    try {
      const response = await apiService.post<any>(`${this.baseUrl}/skip`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to skip tour');
      }
      
      console.log('⏭️ Tour skipped successfully');
    } catch (error: any) {
      console.error('Error skipping tour:', error);
      throw new Error(error.message || 'Failed to skip tour');
    }
  }

  /**
   * Reset tour status to allow retaking
   */
  async restartTour(): Promise<void> {
    try {
      const response = await apiService.post<any>(`${this.baseUrl}/restart`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to restart tour');
      }
      
      console.log('🔄 Tour restarted successfully');
    } catch (error: any) {
      console.error('Error restarting tour:', error);
      throw new Error(error.message || 'Failed to restart tour');
    }
  }

  /**
   * Mark first login as completed
   */
  async completeFirstLogin(): Promise<void> {
    try {
      const response = await apiService.post<any>(`${this.baseUrl}/first-login-complete`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to complete first login');
      }
      
      console.log('✅ First login completed successfully');
    } catch (error: any) {
      console.error('Error completing first login:', error);
      throw new Error(error.message || 'Failed to complete first login');
    }
  }

  /**
   * Check if user should see tour (convenience method)
   */
  async shouldShowTour(): Promise<boolean> {
    try {
      const status = await this.getTourStatus();
      return status.should_show_tour;
    } catch (error) {
      console.error('Error checking tour status:', error);
      return false; // Default to not showing tour on error
    }
  }
}

export const tourService = new TourService();
export default tourService;