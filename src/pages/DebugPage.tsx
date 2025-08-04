import React from 'react';
import WorkspaceDebug from '../components/debug/WorkspaceDebug';
import ApiDebugger from '../components/debug/ApiDebugger';

const DebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Page</h1>
        <ApiDebugger />
        <div style={{ marginTop: '2rem' }}>
          <WorkspaceDebug />
        </div>
      </div>
    </div>
  );
};

export default DebugPage;