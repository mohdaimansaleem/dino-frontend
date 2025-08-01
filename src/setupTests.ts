// Polyfills for Node.js test environment
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

// Add TextEncoder/TextDecoder polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Add additional polyfills for MSW
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}

if (typeof global.Request === 'undefined') {
  global.Request = require('node-fetch').Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = require('node-fetch').Response;
}

if (typeof global.Headers === 'undefined') {
  global.Headers = require('node-fetch').Headers;
}

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock WebSocket for tests
global.WebSocket = jest.fn(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
})) as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Use Object.defineProperty to avoid redefinition errors
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock window.location
delete (window as any).location;
window.location = {
  ...window.location,
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock environment variables
process.env.REACT_APP_API_BASE_URL = 'http://localhost:8000/api/v1';
process.env.REACT_APP_WS_BASE_URL = 'ws://localhost:8000';

// Setup MSW (Mock Service Worker) for API mocking
// Temporarily disabled due to TextEncoder issues in test environment
/*
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Mock authentication endpoints
  rest.post('http://localhost:8000/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'admin',
          workspace_id: 'workspace-1',
          venue_id: 'venue-1',
          is_active: true,
          created_at: new Date().toISOString(),
        }
      })
    );
  }),

  // Mock dashboard endpoints
  rest.get('http://localhost:8000/api/v1/dashboard/admin', (req, res, ctx) => {
    return res(
      ctx.json({
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
      })
    );
  }),

  // Mock user permissions
  rest.get('http://localhost:8000/api/v1/auth/permissions', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          permissions: [
            { name: 'dashboard:view', resource: 'dashboard', action: 'view' },
            { name: 'orders:view', resource: 'orders', action: 'view' },
          ]
        }
      })
    );
  }),
);

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
*/

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
  })
) as jest.Mock;