import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Simple demo components
const DemoLogin: React.FC = () => {
  const handleDemoLogin = () => {
    // Set demo user in localStorage
    const demoUser = {
      id: 'demo-user-1',
      email: 'admin@demo.com',
      firstName: 'Demo',
      lastName: 'Admin',
      first_name: 'Demo',
      last_name: 'Admin',
      role: 'admin',
      permissions: [],
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceId: 'demo-workspace',
      workspace_id: 'demo-workspace',
      venue_id: 'demo-venue'
    };
    
    localStorage.setItem('dino_user', JSON.stringify(demoUser));
    localStorage.setItem('dino_token', 'demo-token');
    localStorage.setItem('dino_demo_mode', 'true');
    
    // Reload to trigger auth state change
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🦕 Dino</h1>
          <h2 className="text-xl text-gray-600">Restaurant Management System</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Demo Mode</h3>
            <p className="text-sm text-gray-600 mt-2">
              Experience the full restaurant management system with sample data
            </p>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enter Demo Mode
          </button>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500">
              <p className="font-medium">Demo Features:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Complete restaurant dashboard</li>
                <li>• Order management system</li>
                <li>• Menu and table management</li>
                <li>• Real-time notifications</li>
                <li>• Analytics and reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoDashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🦕 Dino Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Mode</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Today's Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">24</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">₹12,450</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🪑</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tables Occupied
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">8/12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">⭐</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Rating
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">4.8★</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🎭 Demo Mode Active
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Welcome to the Dino Restaurant Management System!</strong>
                </p>
                <p>
                  This is a comprehensive demo showcasing all the features of our restaurant management platform:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-3">
                  <li>Real-time order tracking and management</li>
                  <li>Table management with QR code generation</li>
                  <li>Menu management with categories and items</li>
                  <li>User management with role-based permissions</li>
                  <li>Analytics and reporting dashboard</li>
                  <li>Multi-workspace and venue support</li>
                  <li>Real-time notifications and updates</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> This demo uses mock data and simulates real-time updates. 
                    In production, this would connect to a live backend API with real restaurant data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const isLoggedIn = localStorage.getItem('dino_token');

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <DemoLogin />} 
          />
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <DemoDashboard /> : <Navigate to="/" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;