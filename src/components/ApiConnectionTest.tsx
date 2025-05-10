import React, { useState } from 'react';

const ApiConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const apiUrl = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434/api';
  
  const testConnection = async () => {
    setIsLoading(true);
    setTestResults(null);
    setShowResults(true);
    
    let results = '';
    
    try {
      // Test 1: Basic connectivity
      results += `Testing connection to: ${apiUrl}\n`;
      
      try {
        const baseUrl = apiUrl.replace(/\/api$/, '');
        results += `Checking base URL: ${baseUrl}\n`;
        
        const baseResponse = await fetch(baseUrl, {
          method: 'HEAD',
          mode: 'cors',
        });
        
        results += `Base URL response: ${baseResponse.status} ${baseResponse.statusText}\n`;
      } catch (error) {
        results += `Base URL error: ${error instanceof Error ? error.message : String(error)}\n`;
      }
      
      // Test 2: API tags endpoint
      try {
        results += `\nChecking API tags endpoint: ${apiUrl}/tags\n`;
        
        const tagsResponse = await fetch(`${apiUrl}/tags`, {
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        if (tagsResponse.ok) {
          const data = await tagsResponse.json();
          results += `Tags endpoint response: ${tagsResponse.status} ${tagsResponse.statusText}\n`;
          results += `Models found: ${data.models ? data.models.length : 'None'}\n`;
          
          if (data.models && data.models.length > 0) {
            results += `Available models: ${data.models.map((m: any) => m.name).join(', ')}\n`;
          }
        } else {
          results += `Tags endpoint error: ${tagsResponse.status} ${tagsResponse.statusText}\n`;
        }
      } catch (error) {
        results += `Tags endpoint error: ${error instanceof Error ? error.message : String(error)}\n`;
      }
      
      // Test 3: Browser info
      results += `\nBrowser information:\n`;
      results += `User Agent: ${navigator.userAgent}\n`;
      results += `Platform: ${navigator.platform}\n`;
      
      // Test 4: CORS headers check
      try {
        results += `\nChecking CORS headers:\n`;
        
        const corsResponse = await fetch(`${apiUrl}/tags`, {
          method: 'OPTIONS',
          mode: 'cors',
        });
        
        const corsHeaders = {
          'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers'),
        };
        
        results += `CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}\n`;
      } catch (error) {
        results += `CORS check error: ${error instanceof Error ? error.message : String(error)}\n`;
      }
      
    } catch (error) {
      results += `\nOverall test error: ${error instanceof Error ? error.message : String(error)}\n`;
    } finally {
      setTestResults(results);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={testConnection}
        disabled={isLoading}
        className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {showResults && (
        <div className="mt-2 p-4 bg-gray-800 text-white rounded-md text-xs max-w-md">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">API Connection Test Results:</h3>
            <button 
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Testing connection...
            </div>
          ) : testResults ? (
            <pre className="overflow-auto max-h-60 whitespace-pre-wrap">
              {testResults}
            </pre>
          ) : (
            <p>No results yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiConnectionTest;
