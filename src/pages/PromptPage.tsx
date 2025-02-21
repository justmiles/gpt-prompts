import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Share2, ArrowBigUp, Pencil, Copy, Check, MessageSquare } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { loadPrompts } from '../data/prompts';
import { useUpvotes } from '../hooks/useUpvotes';
import { OpenAISetup } from '../components/OpenAISetup';
import { ChatInterface } from '../components/ChatInterface';
import { CodeBlock } from '../components/CodeBlock';
import { Header } from '../components/Header';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import type { Prompt } from '../data/types';

export function PromptPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState<Prompt | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { upvotes, upvotePrompt } = useUpvotes();
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [showShareConfirm, setShowShareConfirm] = React.useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = React.useState(false);
  const [showOpenAISetup, setShowOpenAISetup] = React.useState(false);
  const [showChat, setShowChat] = React.useState(false);
  const shareConfirmTimeout = React.useRef<number>();
  const copyConfirmTimeout = React.useRef<number>();

  React.useEffect(() => {
    loadPrompts()
      .then(prompts => {
        const foundPrompt = prompts.find(p => p.slug === slug);
        setPrompt(foundPrompt || null);
        if (foundPrompt) {
          setIsUpvoted(Cookies.get(`upvote-${foundPrompt.slug}`) === 'true');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load prompt:', error);
        setLoading(false);
      });
  }, [slug]);

  React.useEffect(() => {
    return () => {
      if (shareConfirmTimeout.current) window.clearTimeout(shareConfirmTimeout.current);
      if (copyConfirmTimeout.current) window.clearTimeout(copyConfirmTimeout.current);
    };
  }, []);

  const handleUpvote = () => {
    if (prompt && !isUpvoted) {
      setIsUpvoted(true);
      Cookies.set(`upvote-${prompt.slug}`, 'true', { expires: 365 });
      upvotePrompt(prompt.slug);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareConfirm(true);
    if (shareConfirmTimeout.current) window.clearTimeout(shareConfirmTimeout.current);
    shareConfirmTimeout.current = window.setTimeout(() => {
      setShowShareConfirm(false);
    }, 2000);
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    const promptText = `${prompt.title}\n\n${prompt.content}`;
    navigator.clipboard.writeText(promptText);
    setShowCopyConfirm(true);
    if (copyConfirmTimeout.current) window.clearTimeout(copyConfirmTimeout.current);
    copyConfirmTimeout.current = window.setTimeout(() => {
      setShowCopyConfirm(false);
    }, 2000);
  };

  const handleChatClick = () => {
    const apiKey = sessionStorage.getItem('openai_api_key');
    if (!apiKey) {
      setShowOpenAISetup(true);
    } else {
      navigate(`/prompt/${slug}/chat`);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-dark-100 mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-dark-100 mb-4">Prompt not found</h1>
            <Link to="/" className="text-olive-600 dark:text-olive-400 hover:text-olive-700 dark:hover:text-olive-300">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sourceCodeUrl = `http://github.com/justmiles/gpt-prompts/blob/main/prompts/${prompt.slug}.md`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100"
            >
              <FontAwesomeIcon icon={faHome} className="mr-1" size="lg" />
              <span>Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={clsx(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-sm",
                isUpvoted
                  ? "bg-olive-100 dark:bg-olive-900/30 text-olive-600 dark:text-olive-400"
                  : "bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
              )}
              disabled={isUpvoted}
            >
              <ArrowBigUp size={16} />
              <span>{upvotes[prompt.slug] || 0}</span>
            </button>
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
              title="Copy prompt"
            >
              {showCopyConfirm ? <Check size={16} /> : <Copy size={16} />}
              <span>{showCopyConfirm ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleChatClick}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
              title="Chat with OpenAI"
            >
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
            <a
              href={sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
            >
              <Pencil size={16} />
              <span>Edit</span>
            </a>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
              title="Share prompt"
            >
              {showShareConfirm ? <Check size={16} /> : <Share2 size={16} />}
              <span>{showShareConfirm ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <span className="text-xs font-medium text-olive-600 dark:text-olive-400 bg-olive-50 dark:bg-olive-900/30 px-2 py-0.5 rounded-full">
              {prompt.category}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-3">
            {prompt.title}
          </h1>
          <p className="text-base text-gray-600 dark:text-dark-300 mb-6">{prompt.description}</p>

          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {prompt.content}
            </ReactMarkdown>
          </div>

          {prompt.author && (
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-dark-600">
              <div className="text-sm text-gray-600 dark:text-dark-300 flex items-center gap-1">
                <span>Created by</span>
                {prompt.author.startsWith('[') ? (
                  <div className="inline prose dark:prose-invert prose-sm [&_p]:inline [&_a]:text-olive-600 dark:[&_a]:text-olive-400 [&_a]:no-underline hover:[&_a]:underline">
                    <ReactMarkdown>{prompt.author}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-gray-900 dark:text-dark-100">{prompt.author}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showOpenAISetup && (
        <OpenAISetup
          onClose={() => {
            setShowOpenAISetup(false);
            const apiKey = sessionStorage.getItem('openai_api_key');
            if (apiKey) {
              navigate(`/prompt/${slug}/chat`);
            }
          }}
        />
      )}

      {showChat && prompt && (
        <ChatInterface
          prompt={prompt.content}
          title={prompt.title}
          promptSlug={prompt.slug}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}