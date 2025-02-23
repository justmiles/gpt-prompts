import React from 'react';
import { Send, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRobot, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { sendMessage } from '../lib/openai';
import { clsx } from 'clsx';
import { ConfirmModal } from './ConfirmModal';
import { CodeBlock } from './CodeBlock';
import { loadingMessages } from '../data/loading-messages';

interface ChatInterfaceProps {
  prompt: string;
  title: string;
  promptSlug: string;
  onClose: () => void;
  fullPage?: boolean;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatHistory {
  messages: Message[];
  lastUpdated: number;
}

const CHAT_STORAGE_PREFIX = 'chat_history_';

export function ChatInterface({ prompt, title, promptSlug, onClose, fullPage = false }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('');
  const [copiedMessageId, setCopiedMessageId] = React.useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const copyTimeoutRef = React.useRef<number>();
  const loadingTimeoutRef = React.useRef<number>();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const components = {
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return <code className={className} {...props}>{children}</code>;
      }
      return (
        <div className="not-prose">
          <CodeBlock className={className}>
            {String(children).replace(/\n$/, '')}
          </CodeBlock>
        </div>
      );
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    const storageKey = `${CHAT_STORAGE_PREFIX}${promptSlug}`;
    const savedChat = localStorage.getItem(storageKey);
    if (savedChat) {
      try {
        const chatHistory: ChatHistory = JSON.parse(savedChat);
        if (Date.now() - chatHistory.lastUpdated < 24 * 60 * 60 * 1000) {
          setMessages(chatHistory.messages);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, [promptSlug]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const saveMessages = React.useCallback((newMessages: Message[]) => {
    const storageKey = `${CHAT_STORAGE_PREFIX}${promptSlug}`;
    const chatHistory: ChatHistory = {
      messages: newMessages,
      lastUpdated: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(chatHistory));
  }, [promptSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Create the full conversation history for the API
    const conversationHistory: Message[] = [
      // System message with the initial prompt
      { role: 'system', content: prompt },
      // Include all previous messages
      ...messages,
      // Add the new user message
      { role: 'user', content: userMessage }
    ];

    setMessages(conversationHistory);
    saveMessages(conversationHistory);
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    loadingTimeoutRef.current = window.setTimeout(() => {
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 5000);

    try {
      const response = await sendMessage(conversationHistory);
      const updatedMessages = [...conversationHistory, { role: 'assistant', content: response }];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessages = [...conversationHistory, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }];
      setMessages(errorMessages);
      saveMessages(errorMessages);
    } finally {
      setLoading(false);
      setLoadingMessage('');
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
    }
  };

  const handleCopyMessage = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(index);
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleClearChat = () => {
    const storageKey = `${CHAT_STORAGE_PREFIX}${promptSlug}`;
    localStorage.removeItem(storageKey);
    setMessages([]);
    setShowClearConfirm(false);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    
    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const containerClasses = fullPage
    ? "w-full h-full rounded-lg flex flex-col bg-white dark:bg-dark-700"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4";

  const chatClasses = fullPage
    ? "w-full h-full flex flex-col"
    : "bg-white dark:bg-dark-700 rounded-lg w-full md:max-w-4xl mx-0 md:mx-4 flex flex-col h-screen md:h-[80vh]";

  // Filter out system messages from display
  const displayMessages = messages.filter(message => message.role !== 'system');

  return (
    <div className={containerClasses}>
      <div className={chatClasses}>
        <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="flex items-center gap-1 text-olive-500 hover:text-olive-600 dark:text-olive-400 dark:hover:text-olive-300"
                  title="Back to prompts"
                >
                  <FontAwesomeIcon icon={faHome} size="lg" />
                </Link>
                <Link
                  to={`/prompt/${promptSlug}`}
                  className="flex items-center gap-1 text-olive-500 hover:text-olive-600 dark:text-olive-400 dark:hover:text-olive-300"
                  title="Back to prompt"
                >
                  <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                  <span className="text-base font-medium truncate">{title}</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 text-olive-500 hover:text-olive-600 dark:text-olive-400 dark:hover:text-olive-300"
                title="Clear chat history"
              >
                <Trash2 size={16} />
              </button>
              {!fullPage && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-olive-500 hover:text-olive-600 dark:text-olive-400 dark:hover:text-olive-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-6xl mb-4">
                <FontAwesomeIcon icon={faRobot} className="text-olive-500 dark:text-olive-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-2">
                How can I help?
              </h2>
              <p className="text-gray-600 dark:text-dark-300 max-w-lg">
                I'm ready to help you with this prompt. Feel free to ask questions or request assistance.
                You can use Shift + Enter for new lines in your messages.
              </p>
            </div>
          )}
          {displayMessages.map((message, index) => (
            <div key={index} className="w-full">
              <div className={clsx(
                "w-full rounded-md p-3 relative group",
                message.role === 'user'
                  ? 'bg-olive-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-600 text-gray-900 dark:text-dark-100'
              )}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-1">
                    <FontAwesomeIcon
                      icon={message.role === 'user' ? faUser : faRobot}
                      className={message.role === 'user' ? 'text-white' : 'text-olive-500 dark:text-olive-400'}
                    />
                  </div>
                  <div className={`prose ${
                    message.role === 'user'
                      ? 'prose-invert'
                      : 'dark:prose-invert'
                  } prose-sm max-w-none flex-1 overflow-x-auto`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={components}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyMessage(index, message.content)}
                    className="absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-dark-500 hover:bg-gray-300 dark:hover:bg-dark-400"
                    title="Copy response"
                  >
                    {copiedMessageId === index ? (
                      <Check size={14} className="text-olive-600 dark:text-olive-400" />
                    ) : (
                      <Copy size={14} className="text-olive-600 dark:text-olive-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="w-full">
              <div className="bg-gray-100 dark:bg-dark-600 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-olive-500 dark:text-olive-400" />
                  <span className="text-sm text-gray-600 dark:text-dark-300">
                    {loadingMessage || "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-dark-600">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift + Enter for new line)"
                rows={1}
                className="w-full px-4 py-2.5 text-base border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 focus:ring-2 focus:ring-olive-500 dark:focus:ring-olive-400 focus:border-transparent resize-none min-h-[42px] max-h-[200px] overflow-y-auto"
                style={{ height: 'auto' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-olive-600 text-white rounded-lg hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearChat}
        title="Clear Chat History"
        message="Are you sure you want to clear the chat history? This action cannot be undone."
      />
    </div>
  );
}