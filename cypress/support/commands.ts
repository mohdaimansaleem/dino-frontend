/// <reference types="cypress" />

// Custom commands for Dino E-Menu testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('admin@test.com', 'password')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to login as a specific role
       * @example cy.loginAs('admin')
       */
      loginAs(role: 'superadmin' | 'admin' | 'operator'): Chainable<void>;
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to wait for dashboard to load
       * @example cy.waitForDashboard()
       */
      waitForDashboard(): Chainable<void>;
      
      /**
       * Custom command to mock API responses
       * @example cy.mockApiResponse('GET', '/auth/me', { fixture: 'user.json' })
       */
      mockApiResponse(method: string, url: string, response: any): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for redirect to dashboard
  cy.url().should('include', '/admin');
});

// Login as specific role
Cypress.Commands.add('loginAs', (role: 'superadmin' | 'admin' | 'operator') => {
  const credentials = {
    superadmin: { email: 'superadmin@test.com', password: 'password' },
    admin: { email: 'admin@test.com', password: 'password' },
    operator: { email: 'operator@test.com', password: 'password' },
  };
  
  const { email, password } = credentials[role];
  cy.login(email, password);
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Wait for dashboard to load
Cypress.Commands.add('waitForDashboard', () => {
  cy.get('[data-testid="dashboard-content"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Mock API response
Cypress.Commands.add('mockApiResponse', (method: string, url: string, response: any) => {
  cy.intercept(method, `${Cypress.env('apiUrl')}${url}`, response).as(`mock${method}${url.replace(/\//g, '_')}`);
});

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // You can customize this to only ignore specific errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});