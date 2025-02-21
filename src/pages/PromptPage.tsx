import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Moon, Sun, ArrowBigUp, Pencil, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { loadPrompts } from '../data/prompts';
import { useTheme } from '../context/ThemeContext';
import { useUpvotes } from '../hooks/useUpvotes';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import type { Prompt } from '../data/types';

export function PromptPage() {
  const { slug } = useParams<{ slug: string }>();
  const [prompt, setPrompt] = React.useState<Prompt | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { theme, toggleTheme } = useTheme();
  const { upvotes, upvotePrompt } = useUpvotes();
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [showShareConfirm, setShowShareConfirm] = React.useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = React.useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Prompt not found</h1>
          <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const sourceCodeUrl = `http://github.com/justmiles/gpt-prompts/blob/main/prompts/${prompt.slug}.md`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to prompts
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={clsx(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-sm",
                isUpvoted
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
              disabled={isUpvoted}
            >
              <ArrowBigUp size={16} />
              <span>{upvotes[prompt.slug] || 0}</span>
            </button>
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Copy prompt"
            >
              {showCopyConfirm ? <Check size={16} /> : <Copy size={16} />}
              <span>{showCopyConfirm ? 'Copied!' : 'Copy'}</span>
            </button>
            <a
              href={sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Pencil size={16} />
              <span>Edit</span>
            </a>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Share prompt"
            >
              {showShareConfirm ? <Check size={16} /> : <Share2 size={16} />}
              <span>{showShareConfirm ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
              {prompt.category}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {prompt.title}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-6">{prompt.description}</p>

          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown>{prompt.content}</ReactMarkdown>
          </div>

          {prompt.author && (
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span>Created by</span>
                {prompt.author.startsWith('[') ? (
                  <div className="inline prose dark:prose-invert prose-sm [&_p]:inline [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:no-underline hover:[&_a]:underline">
                    <ReactMarkdown>{prompt.author}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-gray-900 dark:text-gray-200">{prompt.author}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}