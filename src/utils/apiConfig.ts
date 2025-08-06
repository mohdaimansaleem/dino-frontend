/**
 * API configuration utilities
 */

/**
 * Get the base API URL
 */
export function getApiBaseUrl(): string {
  // Check for environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
    
  // In production, use current origin
  return window.location.origin;
}

/**
 * Create full API URL
 */
export function createApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Default fetch options with common headers
 */
export function getDefaultFetchOptions(): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Fetch with authentication
 */
export function getAuthenticatedFetchOptions(token: string): RequestInit {
  return {
    ...getDefaultFetchOptions(),
    headers: {
      ...getDefaultFetchOptions().headers,
      'Authorization': `Bearer ${token}`,
    },
  };
}