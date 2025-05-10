import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Artifact {
  type: 'image' | 'code' | 'table' | 'chart' | 'file' | 'link';
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    mimeType?: string;
    [key: string]: any;
  };
}

interface ArtifactsProps {
  artifacts: Artifact[];
}

const Artifacts: React.FC<ArtifactsProps> = ({ artifacts }) => {
  const [activeArtifact, setActiveArtifact] = useState<number | null>(0);

  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  // Get icon for artifact type
  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'table':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        );
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'file':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'link':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
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

  const renderArtifactContent = (artifact: Artifact) => {
    switch (artifact.type) {
      case 'image':
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <img
              src={artifact.content}
              alt={artifact.metadata?.title || 'Image'}
              className="max-w-full h-auto rounded shadow-lg"
            />
            {artifact.metadata?.description && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                {artifact.metadata.description}
              </p>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="p-0 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
              <span className="font-mono text-sm">
                {artifact.metadata?.language || 'code'}
              </span>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
            <SyntaxHighlighter
              language={artifact.metadata?.language || 'javascript'}
              style={vscDarkPlus}
              showLineNumbers={true}
              customStyle={{ margin: 0, borderRadius: 0 }}
            >
              {artifact.content}
            </SyntaxHighlighter>
          </div>
        );

      case 'table':
        return (
          <div className="p-4 overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{artifact.content}</ReactMarkdown>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="flex flex-col items-center justify-center p-4">
            <img
              src={artifact.content}
              alt={artifact.metadata?.title || 'Chart'}
              className="max-w-full h-auto rounded shadow-lg"
            />
            {artifact.metadata?.description && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                {artifact.metadata.description}
              </p>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h3 className="text-lg font-medium">{artifact.metadata?.title || 'Link'}</h3>
            </div>
            {artifact.metadata?.description && (
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {artifact.metadata.description}
              </p>
            )}
            <a
              href={artifact.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Visit Link
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        );

      case 'file':
        return (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-medium">{artifact.metadata?.title || 'File'}</h3>
                <p className="text-sm text-gray-500">{artifact.content}</p>
              </div>
            </div>
            {artifact.metadata?.description && (
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {artifact.metadata.description}
              </p>
            )}
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Download
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{artifact.content}</ReactMarkdown>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mt-4 mb-6 animate-fadeIn">
      {/* Claude-style artifact display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Tabs for artifacts */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {artifacts.map((artifact, index) => (
            <button
              key={index}
              onClick={() => setActiveArtifact(index)}
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeArtifact === index
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">
                {getArtifactIcon(artifact.type)}
              </span>
              <span>
                {artifact.metadata?.title || `${artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)} ${index + 1}`}
              </span>
            </button>
          ))}
        </div>

        {/* Active artifact content */}
        <div className="p-1">
          {activeArtifact !== null && renderArtifactContent(artifacts[activeArtifact])}
        </div>
      </div>
    </div>
  );
};

export default Artifacts;
