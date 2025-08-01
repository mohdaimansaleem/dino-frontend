describe('Dashboard Functionality', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    
    // Mock authentication
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
          { name: 'menu:view', resource: 'menu', action: 'view' },
          { name: 'tables:view', resource: 'tables', action: 'view' },
        ]
      }
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
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
          recent_orders: [
            {
              id: '1',
              order_number: 'ORD-001',
              table_number: 5,
              total_amount: 850,
              status: 'preparing',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              order_number: 'ORD-002',
              table_number: 3,
              total_amount: 1200,
              status: 'ready',
              created_at: new Date().toISOString(),
            }
          ],
          hourly_performance: [],
          popular_items: []
        }
      });
      
      cy.login('admin@test.com', 'password');
    });

    it('should display admin dashboard with correct data', () => {
      cy.waitForDashboard();
      
      // Check dashboard title
      cy.get('h4').should('contain', 'Admin Dashboard');
      
      // Check summary statistics
      cy.get('[data-testid="today-orders"]').should('contain', '25');
      cy.get('[data-testid="today-revenue"]').should('contain', '₹12,500');
      cy.get('[data-testid="occupied-tables"]').should('contain', '12/20');
      cy.get('[data-testid="active-menu-items"]').should('contain', '40/45');
    });

    it('should display recent orders', () => {
      cy.waitForDashboard();
      
      // Check recent orders section
      cy.get('[data-testid="recent-orders"]').should('be.visible');
      cy.get('[data-testid="order-ORD-001"]').should('contain', 'ORD-001');
      cy.get('[data-testid="order-ORD-002"]').should('contain', 'ORD-002');
    });

    it('should have working quick action buttons', () => {
      cy.waitForDashboard();
      
      // Test navigation to orders page
      cy.get('button').contains('View Orders').click();
      cy.url().should('include', '/admin/orders');
      
      // Go back to dashboard
      cy.go('back');
      
      // Test navigation to menu page
      cy.get('button').contains('Manage Menu').click();
      cy.url().should('include', '/admin/menu');
    });

    it('should refresh data when refresh button is clicked', () => {
      cy.waitForDashboard();
      
      // Mock updated data
      cy.mockApiResponse('GET', '/dashboard/admin', {
        success: true,
        data: {
          summary: {
            today_orders: 30, // Updated value
            today_revenue: 15000,
            total_tables: 20,
            occupied_tables: 15,
            total_menu_items: 45,
            active_menu_items: 40,
            total_staff: 8,
          },
          recent_orders: [],
          hourly_performance: [],
          popular_items: []
        }
      });
      
      // Click refresh button
      cy.get('[data-testid="refresh-button"]').click();
      
      // Check updated data
      cy.get('[data-testid="today-orders"]').should('contain', '30');
    });
  });

  describe('Operator Dashboard', () => {
    beforeEach(() => {
      // Mock operator user
      cy.mockApiResponse('POST', '/auth/login', {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'user-2',
          email: 'operator@test.com',
          first_name: 'Operator',
          last_name: 'User',
          role: 'operator',
          workspace_id: 'workspace-1',
          venue_id: 'venue-1',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      });
      
      cy.mockApiResponse('GET', '/dashboard/operator', {
        success: true,
        data: {
          summary: {
            active_orders: 8,
            pending_orders: 3,
            preparing_orders: 4,
            ready_orders: 1,
            occupied_tables: 12,
            total_tables: 20,
          },
          active_orders: [
            {
              id: '1',
              order_number: 'ORD-001',
              table_number: 5,
              total_amount: 850,
              status: 'preparing',
              created_at: new Date().toISOString(),
              items_count: 3,
            }
          ]
        }
      });
      
      cy.login('operator@test.com', 'password');
    });

    it('should display operator dashboard with order management focus', () => {
      cy.waitForDashboard();
      
      // Check dashboard title
      cy.get('h4').should('contain', 'Operator Dashboard');
      
      // Check order statistics
      cy.get('[data-testid="pending-orders"]').should('contain', '3');
      cy.get('[data-testid="preparing-orders"]').should('contain', '4');
      cy.get('[data-testid="ready-orders"]').should('contain', '1');
    });

    it('should allow updating order status', () => {
      cy.waitForDashboard();
      
      // Mock order status update
      cy.mockApiResponse('PUT', '/orders/1/status', {
        success: true,
        data: { id: '1', status: 'ready' }
      });
      
      // Find order and update status
      cy.get('[data-testid="order-1"]').within(() => {
        cy.get('button').contains('Mark Ready').click();
      });
      
      // Should show success message
      cy.get('.MuiAlert-root').should('contain', 'Order status updated');
    });
  });

  describe('SuperAdmin Dashboard', () => {
    beforeEach(() => {
      // Mock superadmin user
      cy.mockApiResponse('POST', '/auth/login', {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'user-3',
          email: 'superadmin@test.com',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'superadmin',
          workspace_id: 'workspace-1',
          venue_id: 'venue-1',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      });
      
      cy.mockApiResponse('GET', '/dashboard/superadmin', {
        success: true,
        data: {
          summary: {
            total_workspaces: 5,
            total_venues: 12,
            total_users: 45,
            total_orders: 1250,
            total_revenue: 125000,
            active_venues: 10,
          },
          workspaces: [
            {
              id: '1',
              name: 'Pizza Palace Group',
              venue_count: 3,
              user_count: 12,
              is_active: true,
              created_at: new Date().toISOString(),
            }
          ]
        }
      });
      
      cy.login('superadmin@test.com', 'password');
    });

    it('should display superadmin dashboard with platform overview', () => {
      cy.waitForDashboard();
      
      // Check dashboard title
      cy.get('h4').should('contain', 'Super Admin Dashboard');
      
      // Check platform statistics
      cy.get('[data-testid="total-workspaces"]').should('contain', '5');
      cy.get('[data-testid="total-venues"]').should('contain', '12');
      cy.get('[data-testid="total-users"]').should('contain', '45');
      cy.get('[data-testid="total-revenue"]').should('contain', '₹1,25,000');
    });

    it('should display workspaces overview table', () => {
      cy.waitForDashboard();
      
      // Check workspaces table
      cy.get('[data-testid="workspaces-table"]').should('be.visible');
      cy.get('[data-testid="workspace-Pizza Palace Group"]').should('be.visible');
    });
  });

  describe('Dashboard Error Handling', () => {
    beforeEach(() => {
      cy.login('admin@test.com', 'password');
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.mockApiResponse('GET', '/dashboard/admin', {
        statusCode: 500,
        body: { detail: 'Internal server error' }
      });
      
      cy.visit('/admin');
      
      // Should show error message
      cy.get('.MuiAlert-root').should('contain', 'Failed to load dashboard data');
      
      // Should have retry button
      cy.get('button').contains('Retry').should('be.visible');
    });

    it('should show loading state while fetching data', () => {
      // Add delay to API response
      cy.mockApiResponse('GET', '/dashboard/admin', {
        delay: 2000,
        success: true,
        data: { summary: {}, recent_orders: [] }
      });
      
      cy.visit('/admin');
      
      // Should show loading spinner
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      // Should hide loading spinner after data loads
      cy.get('[data-testid="loading-spinner"]', { timeout: 5000 }).should('not.exist');
    });
  });
});