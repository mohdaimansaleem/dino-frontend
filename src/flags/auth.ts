/**
 * Authentication Page Feature Flags
 * 
 * This file controls all features and components visible on authentication pages.
 * Set any flag to false to hide that feature from users in production.
 */

import { AuthFlags } from './types';

export const authFlags: AuthFlags = {
  // Global flags
  enableDebugMode: false,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,

  // Login features - Control login page functionality
  showRememberMe: true,            // Shows "Remember Me" checkbox on login
  showForgotPassword: true,        // Shows "Forgot Password" link and functionality
  showSocialLogin: false,          // Shows social media login options (Google, Facebook)
  showPasswordStrength: true,      // Shows password strength indicator

  // Registration features - Control registration page functionality
  showRegistration: true,          // Shows registration page and signup functionality
  showEmailVerification: true,     // Shows email verification requirement
  showTermsAndConditions: true,    // Shows terms and conditions acceptance
  showPrivacyPolicy: true,         // Shows privacy policy link and acceptance

  // Security features - Control security-related functionality
  enableTwoFactorAuth: false,      // Enables two-factor authentication setup
  enableCaptcha: false,            // Enables CAPTCHA verification for forms
  enablePasswordHistory: false,    // Prevents reusing recent passwords
  enableAccountLockout: true,      // Enables account lockout after failed attempts
};

/**
 * Login Feature Descriptions:
 * 
 * showRememberMe: Allows users to stay logged in across browser sessions
 * showForgotPassword: Password reset functionality via email
 * showSocialLogin: Login with Google, Facebook, or other social providers
 * showPasswordStrength: Visual indicator of password strength during input
 */

/**
 * Registration Feature Descriptions:
 * 
 * showRegistration: User registration and account creation functionality
 * showEmailVerification: Requires email verification before account activation
 * showTermsAndConditions: Requires acceptance of terms and conditions
 * showPrivacyPolicy: Shows privacy policy and requires acceptance
 */

/**
 * Security Feature Descriptions:
 * 
 * enableTwoFactorAuth: Two-factor authentication using SMS or authenticator apps
 * enableCaptcha: CAPTCHA verification to prevent automated attacks
 * enablePasswordHistory: Prevents users from reusing recent passwords
 * enableAccountLockout: Temporarily locks accounts after multiple failed login attempts
 */

/**
 * Security Recommendations:
 * 
 * - enableAccountLockout should generally be true for security
 * - enableTwoFactorAuth is recommended for admin accounts
 * - showPasswordStrength helps users create secure passwords
 * - enableCaptcha can help prevent brute force attacks
 */

export default authFlags;