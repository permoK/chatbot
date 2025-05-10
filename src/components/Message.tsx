import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types/ollama';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReasoningSteps from './ReasoningSteps';
import Artifacts from './Artifacts';
import type { Components } from 'react-markdown';

interface MessageProps {
  message: ChatMessage;
}

const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';

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
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex items-start ${isUser ? 'max-w-[85%]' : 'max-w-[90%]'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mr-3 mt-1 shadow-md">
            AI
          </div>
        )}

        <div className="flex flex-col">
          {/* Message bubble */}
          <div
            className={`rounded-2xl p-4 shadow-md ${
              isUser
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none'
            }`}
          >
            <div className="font-semibold mb-1 flex items-center">
              {isUser ? (
                <>
                  <span>You</span>
                  <span className="ml-2 text-xs opacity-75">Just now</span>
                </>
              ) : (
                <>
                  <span>Assistant</span>
                  <span className="ml-2 text-xs opacity-75">Just now</span>
                </>
              )}
            </div>

            <div className={`prose ${isUser ? 'prose-invert' : 'dark:prose-invert'} max-w-none`}>
              <ReactMarkdown components={components}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Reasoning steps (only for assistant messages) */}
          {!isUser && message.reasoning && message.reasoning.length > 0 && (
            <div className="ml-4">
              <ReasoningSteps steps={message.reasoning} />
            </div>
          )}

          {/* Artifacts (only for assistant messages) */}
          {!isUser && message.artifacts && message.artifacts.length > 0 && (
            <div className="ml-4">
              <Artifacts artifacts={message.artifacts} />
            </div>
          )}
        </div>

        {/* User avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold ml-3 mt-1 shadow-md">
            You
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
