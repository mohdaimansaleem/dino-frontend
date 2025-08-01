describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Mock API responses
    cy.mockApiResponse('POST', '/auth/login', {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'user-1',
        email: 'admin@test.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        workspace_id: 'workspace-1',
        venue_id: 'venue-1',
        is_active: true,
        created_at: new Date().toISOString(),
      }
    });
    
    cy.mockApiResponse('GET', '/auth/permissions', {
      success: true,
      data: {
        permissions: [
          { name: 'dashboard:view', resource: 'dashboard', action: 'view' },
          { name: 'orders:view', resource: 'orders', action: 'view' },
        ]
      }
    });
    
    cy.mockApiResponse('GET', '/dashboard/admin', {
      success: true,
      data: {
        summary: {
          today_orders: 25,
          today_revenue: 12500,
          total_tables: 20,
          occupied_tables: 12,
          total_menu_items: 45,
          active_menu_items: 40,
          total_staff: 8,
        },
        recent_orders: []
      }
    });
  });

  it('should display login page', () => {
    cy.visit('/login');
    
    cy.get('h4').should('contain', 'Dino E-Menu');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('should show validation errors for empty fields', () => {
    cy.visit('/login');
    
    cy.get('button[type="submit"]').click();
    
    // Should show validation error
    cy.get('.MuiAlert-root').should('contain', 'Email and password are required');
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('admin@test.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/admin');
    
    // Should show dashboard content
    cy.get('h4').should('contain', 'Dashboard');
  });

  it('should handle login failure', () => {
    // Mock failed login
    cy.mockApiResponse('POST', '/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid credentials' }
    });
    
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('admin@test.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('.MuiAlert-root').should('contain', 'Invalid credentials');
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should redirect to login when accessing protected route without authentication', () => {
    cy.visit('/admin');
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    // Login first
    cy.login('admin@test.com', 'password');
    
    // Should be on dashboard
    cy.url().should('include', '/admin');
    
    // Logout (assuming there's a logout button in the header)
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('should persist authentication across page refreshes', () => {
    // Login first
    cy.login('admin@test.com', 'password');
    
    // Should be on dashboard
    cy.url().should('include', '/admin');
    
    // Refresh page
    cy.reload();
    
    // Should still be authenticated and on dashboard
    cy.url().should('include', '/admin');
    cy.get('h4').should('contain', 'Dashboard');
  });

  it('should navigate to registration page', () => {
    cy.visit('/login');
    
    cy.get('button').contains('Create Restaurant Account').click();
    
    cy.url().should('include', '/register');
    cy.get('h4').should('contain', 'Create Your Dino Workspace');
  });
});