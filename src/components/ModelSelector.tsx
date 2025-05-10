import { useEffect, useState, useRef } from 'react';
import { OllamaModel } from '../types/ollama';
import { fetchModels } from '../services/ollamaService';

interface ModelSelectorProps {
  onModelSelect: (model: string) => void;
  selectedModel: string | null;
}

const ModelSelector = ({ onModelSelect, selectedModel }: ModelSelectorProps) => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getModels = async () => {
      try {
        setLoading(true);
        const response = await fetchModels();
        setModels(response.models);

        // Auto-select the first model if none is selected
        if (!selectedModel && response.models.length > 0) {
          onModelSelect(response.models[0].name);
        }
      } catch (err) {
        setError('Failed to load models. Make sure Ollama is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getModels();
  }, [onModelSelect, selectedModel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the selected model details
  const selectedModelDetails = models.find(model => model.name === selectedModel);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        <span className="ml-2 font-medium">Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 backdrop-blur-sm text-red-700 dark:text-red-300 rounded-xl shadow-lg border border-red-200 dark:border-red-800">
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-2">
          API URL: {import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434/api'}
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Retry Connection
          </button>
          <a
            href="https://github.com/ollama/ollama#api-endpoints"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-center"
          >
            Ollama API Docs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div>
            <div className="font-medium">{selectedModel || "Select a model"}</div>
            {selectedModelDetails && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {selectedModelDetails.details.parameter_size} • {selectedModelDetails.details.quantization_level}
              </div>
            )}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300 animate-fadeIn">
          <div className="max-h-60 overflow-y-auto py-1">
            {models.map((model) => (
              <button
                key={model.name}
                className={`w-full text-left px-4 py-3 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  selectedModel === model.name
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => {
                  onModelSelect(model.name);
                  setIsOpen(false);
                }}
              >
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  selectedModel === model.name
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}></div>
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {model.details.parameter_size} • {model.details.quantization_level}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
