import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ReasoningStep } from '../types/ollama';
import { generateChatCompletion } from '../services/ollamaService';
import Message from './Message';
import ReasoningToggle from './ReasoningToggle';

// Helper function to fix duplicated words in the response
const fixDuplicatedWords = (text: string): string => {
  // Simple regex to catch repeated words with optional punctuation
  return text.replace(/\b(\w+)\b(\s+\1\b)+/gi, '$1');
};

interface ChatInterfaceProps {
  selectedModel: string | null;
}

const ChatInterface = ({ selectedModel }: ChatInterfaceProps) => {
  // State for messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Reasoning options
  const [reasoning, setReasoning] = useState(false);
  const [reasoningDepth, setReasoningDepth] = useState<'basic' | 'detailed' | 'comprehensive'>('basic');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [calculationEnabled, setCalculationEnabled] = useState(false);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !selectedModel) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Add empty assistant message that will be updated as the response streams in
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    setIsGenerating(true);
    setIsTyping(true);

    try {
      // Keep track of the accumulated response for post-processing
      let accumulatedResponse = '';

      // Prepare reasoning options
      const reasoningOptions = {
        reasoning: reasoning,
        reasoning_depth: reasoningDepth,
        search_enabled: searchEnabled,
        calculation_enabled: calculationEnabled,
      };

      await generateChatCompletion(
        selectedModel,
        [...messages, userMessage],
        (chunk) => {
          // Process the chunk to fix any duplicated words
          const processedChunk = fixDuplicatedWords(chunk);
          accumulatedResponse += processedChunk;

          // Update the assistant message as chunks come in
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];

            // Apply the fix to the entire accumulated content
            const fixedContent = fixDuplicatedWords(accumulatedResponse);
            lastMessage.content = fixedContent;

            return newMessages;
          });
        },
        (fullResponse) => {
          // Final post-processing of the complete response
          const finalProcessedResponse = fixDuplicatedWords(fullResponse);

          // Extract reasoning steps if enabled
          let reasoningSteps: ReasoningStep[] = [];
          if (reasoning) {
            const reasoningRegex = /\[(REASONING|THINKING|SEARCH|CALCULATION|CODE|REFERENCE):\s*([\s\S]*?)\]/gi;
            const matches = [...finalProcessedResponse.matchAll(reasoningRegex)];

            if (matches.length > 0) {
              reasoningSteps = matches.map(match => ({
                type: match[1].toLowerCase() as 'thinking' | 'search' | 'calculation' | 'code' | 'reference',
                content: match[2].trim()
              }));
            }
          }

          // Update with the fully processed response
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content = finalProcessedResponse;

            // Add reasoning steps if available
            if (reasoningSteps.length > 0) {
              lastMessage.reasoning = reasoningSteps;
            }

            return newMessages;
          });

          setIsGenerating(false);
          setTimeout(() => setIsTyping(false), 500); // Keep typing indicator a bit longer for effect
        },
        reasoningOptions
      );
    } catch (error) {
      console.error('Error generating chat completion:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content = 'Error: Failed to generate response. Please try again.';
        return newMessages;
      });
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome to Ollama Chat</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Chat with your locally hosted AI models. Select a model from the dropdown above to get started.</p>

              {selectedModel ? (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <p className="text-indigo-700 dark:text-indigo-300 font-medium">Ready to chat with <span className="font-bold">{selectedModel}</span>!</p>
                  <p className="text-indigo-600/70 dark:text-indigo-400/70 text-sm mt-1">Type your message below to begin the conversation.</p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                  <p className="text-amber-700 dark:text-amber-300 font-medium">Please select a model first</p>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm mt-1">Use the dropdown above to choose an AI model to chat with.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start mb-6 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mr-3 mt-1 shadow-md">
                  AI
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-end">
          {/* Reasoning Toggle */}
          <div className="mr-2">
            <ReasoningToggle
              reasoning={reasoning}
              setReasoning={setReasoning}
              reasoningDepth={reasoningDepth}
              setReasoningDepth={setReasoningDepth}
            />
          </div>

          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 transition-all duration-200">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedModel || isGenerating}
              placeholder={
                !selectedModel
                  ? 'Please select a model first'
                  : isGenerating
                  ? 'Generating response...'
                  : 'Type your message here... (Shift+Enter for new line)'
              }
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none max-h-32 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedModel || !input.trim() || isGenerating}
            className="ml-2 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            {selectedModel ? `Chatting with ${selectedModel}` : 'Select a model to start chatting'}
          </div>

          {/* Additional capabilities toggles */}
          {reasoning && (
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchEnabled}
                  onChange={(e) => setSearchEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">Search</span>
              </label>

              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={calculationEnabled}
                  onChange={(e) => setCalculationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">Calc</span>
              </label>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
