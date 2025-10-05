/**
 * Token Refresh Scheduler
 * Automatically refreshes tokens before they expire
 */

import { authService } from '../services/auth';

class TokenRefreshScheduler {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Start the token refresh scheduler
   */
  start(): void {
    if (this.refreshInterval) {
      this.stop();
    }

    // Check every minute
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 60 * 1000);

    console.log('🔄 Token refresh scheduler started');
  }

  /**
   * Stop the token refresh scheduler
   */
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Token refresh scheduler stopped');
    }
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return; // Already refreshing
    }

    if (!authService.isAuthenticated()) {
      this.stop(); // Stop scheduler if not authenticated
      return;
    }

    const { isExpired, expiresIn } = authService.getTokenExpiryInfo();

    if (isExpired) {
      console.log('🚨 Token has expired, attempting refresh...');
      await this.performRefresh();
    } else if (expiresIn < 10 * 60 * 1000) { // Less than 10 minutes
      console.log('⏰ Token expires soon, refreshing proactively...');
      await this.performRefresh();
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        console.log('✅ Token refreshed successfully by scheduler');
      } else {
        console.warn('⚠️ Token refresh failed, stopping scheduler');
        this.stop();
      }
    } catch (error) {
      console.error('❌ Scheduled token refresh failed:', error);
      this.stop();
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Force refresh token immediately
   */
  async forceRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress...');
      return false;
    }

    await this.performRefresh();
    return true;
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    isRefreshing: boolean;
    tokenInfo: ReturnType<typeof authService.getTokenExpiryInfo>;
  } {
    return {
      isRunning: this.refreshInterval !== null,
      isRefreshing: this.isRefreshing,
      tokenInfo: authService.getTokenExpiryInfo(),
    };
  }
}

// Export singleton instance
export const tokenRefreshScheduler = new TokenRefreshScheduler();

// Auto-start scheduler when module loads (if authenticated)
if (typeof window !== 'undefined' && authService.isAuthenticated()) {
  tokenRefreshScheduler.start();
}

export default tokenRefreshScheduler;