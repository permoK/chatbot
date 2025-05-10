import React, { useState } from 'react';

const EnvDebug: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  const envVars = {
    'VITE_OLLAMA_API_URL': import.meta.env.VITE_OLLAMA_API_URL || 'Not set',
    'NODE_ENV': import.meta.env.MODE || 'Not set',
    'PROD': import.meta.env.PROD ? 'true' : 'false',
    'DEV': import.meta.env.DEV ? 'true' : 'false',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-xs hover:bg-gray-700"
      >
        {showDetails ? 'Hide Env Debug' : 'Show Env Debug'}
      </button>
      
      {showDetails && (
        <div className="mt-2 p-4 bg-gray-800 text-white rounded-md text-xs max-w-xs">
          <h3 className="font-bold mb-2">Environment Variables:</h3>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EnvDebug;
