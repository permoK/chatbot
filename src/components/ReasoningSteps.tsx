import React, { useState } from 'react';
import { ReasoningStep } from '../types/ollama';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface ReasoningStepsProps {
  steps: ReasoningStep[];
}

const ReasoningSteps: React.FC<ReasoningStepsProps> = ({ steps }) => {
  const [expanded, setExpanded] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  const getIconForStepType = (type: string) => {
    switch (type) {
      case 'thinking':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'search':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        );
      case 'calculation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'reference':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getColorForStepType = (type: string) => {
    switch (type) {
      case 'thinking':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'search':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'calculation':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'code':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'reference':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const components: Components = {
    code(props) {
      const { className, children } = props;
      const match = /language-(\w+)/.exec(className || '');

      if (match && typeof children === 'string') {
        return (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-md my-2 text-sm"
          >
            {children.replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }

      return (
        <code className={`${className} px-1 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700`}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="mt-2 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 mr-2 transition-transform duration-200 ${expanded ? 'transform rotate-90' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Reasoning Steps ({steps.length})</span>
        </div>
        <div className="flex space-x-1">
          {Array.from(new Set(steps.map(step => step.type))).map(type => (
            <span
              key={type}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorForStepType(type)}`}
            >
              {type}
            </span>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {steps.map((step, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center mb-2">
                <div className={`p-1.5 rounded-full mr-2 ${getColorForStepType(step.type)}`}>
                  {getIconForStepType(step.type)}
                </div>
                <h4 className="font-medium capitalize">{step.type}</h4>
                {step.metadata?.source && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Source: {step.metadata.source}
                  </span>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none pl-9">
                <ReactMarkdown components={components}>
                  {step.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReasoningSteps;
