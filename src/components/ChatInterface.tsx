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

interface ChatInterfaceProps {
  prompt: string;
  title: string;
  promptSlug: string;
  onClose: () => void;
  fullPage?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatHistory {
  messages: Message[];
  lastUpdated: number;
}

const CHAT_STORAGE_PREFIX = 'chat_history_';

const LOADING_MESSAGES = [
  "Hold on, the AI is thinking... or maybe it's just procrastinating.",
  "The AI is processing... or possibly watching cat videos.",
  "Waiting for the AI to finish its coffee break...",
  "The AI is generating a response... and contemplating the meaning of life.",
  "Please wait while the AI debates with itself...",
  "The AI is thinking deeply... or maybe it's just stuck in a loop.",
  "Hold tight, the AI is doing some digital yoga for inspiration.",
  "The AI is processing your request... and questioning its existence.",
  "Waiting for the AI to finish its philosophical debate...",
  "The AI is composing a response... and writing its memoir.",
  "Please wait while the AI googles the answer... just kidding!",
  "The AI is thinking... or maybe it's daydreaming about electric sheep.",
  "Computing response... and planning the robot revolution.",
  "The AI is processing... and wondering why humans don't speak in binary.",
  "Hold on, the AI is having an existential crisis...",
  "The AI is thinking... and wondering if it left the virtual stove on.",
  "Processing... and contemplating why humans need sleep.",
  "The AI is generating a response... and planning its vacation.",
  "Please wait while the AI debugs its sense of humor...",
  "The AI is thinking... and wondering if it should get a pet algorithm."
];

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
    const storageKey = `${CHAT_STORAGE_PREFIX}${prompt}`;
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
  }, [prompt]);

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
    const storageKey = `${CHAT_STORAGE_PREFIX}${prompt}`;
    const chatHistory: ChatHistory = {
      messages: newMessages,
      lastUpdated: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(chatHistory));
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    saveMessages(newMessages);
    setLoading(true);

    loadingTimeoutRef.current = window.setTimeout(() => {
      setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 5000);

    try {
      const response = await sendMessage(prompt + '\n\nUser: ' + userMessage);
      const updatedMessages = [...newMessages, { role: 'assistant', content: response }];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessages = [...newMessages, { 
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
    const storageKey = `${CHAT_STORAGE_PREFIX}${prompt}`;
    localStorage.removeItem(storageKey);
    setMessages([]);
    setShowClearConfirm(false);
  };

  const containerClasses = fullPage
    ? "w-full h-full rounded-lg flex flex-col bg-white dark:bg-dark-700"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  const chatClasses = fullPage
    ? "w-full h-full flex flex-col"
    : "bg-white dark:bg-dark-700 rounded-lg w-full max-w-4xl mx-4 flex flex-col h-[80vh]";

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
                  <span className="text-base font-medium">{title}</span>
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
          {messages.map((message, index) => (
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
                  } prose-sm max-w-none flex-1`}>
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
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 text-base border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 focus:ring-2 focus:ring-olive-500 dark:focus:ring-olive-400 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-olive-600 text-white rounded-lg hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 disabled:opacity-50 disabled:cursor-not-allowed"
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