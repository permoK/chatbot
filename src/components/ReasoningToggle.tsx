import React from 'react';

interface ReasoningToggleProps {
  reasoning: boolean;
  setReasoning: (value: boolean) => void;
  reasoningDepth: 'basic' | 'detailed' | 'comprehensive';
  setReasoningDepth: (value: 'basic' | 'detailed' | 'comprehensive') => void;
}

const ReasoningToggle: React.FC<ReasoningToggleProps> = ({
  reasoning,
  setReasoning,
  reasoningDepth,
  setReasoningDepth
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Main toggle button */}
      <button
        onClick={() => setReasoning(!reasoning)}
        className={`relative p-2 rounded-full transition-all duration-300 ${
          reasoning 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
        title={reasoning ? 'Disable reasoning' : 'Enable reasoning'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        
        {/* Animated pulse indicator when reasoning is enabled */}
        {reasoning && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800 animate-pulse-slow"></span>
        )}
      </button>
      
      {/* Depth selector - only visible when reasoning is enabled */}
      {reasoning && (
        <div className="flex bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setReasoningDepth('basic')}
            className={`rounded-full p-1.5 text-xs font-medium transition-colors ${
              reasoningDepth === 'basic'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Basic reasoning"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <button
            onClick={() => setReasoningDepth('detailed')}
            className={`rounded-full p-1.5 text-xs font-medium transition-colors ${
              reasoningDepth === 'detailed'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Detailed reasoning"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={() => setReasoningDepth('comprehensive')}
            className={`rounded-full p-1.5 text-xs font-medium transition-colors ${
              reasoningDepth === 'comprehensive'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Comprehensive reasoning"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReasoningToggle;
