import React from 'react';
import WorkspaceDebug from '../components/debug/WorkspaceDebug';

const DebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Page</h1>
        <WorkspaceDebug />
      </div>
    </div>
  );
};

export default DebugPage;