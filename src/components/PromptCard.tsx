import React from 'react';
import { ArrowBigUp, Share2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import type { Prompt } from '../data/types';

interface PromptCardProps {
  prompt: Prompt;
  upvotes: number;
  onUpvote: (slug: string) => void;
}

export function PromptCard({ prompt, upvotes, onUpvote }: PromptCardProps) {
  const navigate = useNavigate();
  const [isUpvoted, setIsUpvoted] = React.useState(() => {
    return Cookies.get(`upvote-${prompt.slug}`) === 'true';
  });

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when upvoting
    if (!isUpvoted) {
      setIsUpvoted(true);
      Cookies.set(`upvote-${prompt.slug}`, 'true', { expires: 365 });
      onUpvote(prompt.slug);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when sharing
    const url = `${window.location.origin}/prompt/${prompt.slug}`;
    navigator.clipboard.writeText(url);
    alert('Prompt URL copied to clipboard!');
  };

  return (
    <div 
      onClick={() => navigate(`/prompt/${prompt.slug}`)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
            {prompt.category}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpvote}
              className={clsx(
                "flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1",
                isUpvoted && "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              )}
              disabled={isUpvoted}
            >
              <ArrowBigUp size={16} />
              <span className="text-sm">{upvotes}</span>
            </button>
            <button
              onClick={handleShare}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          {prompt.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {prompt.description}
        </p>
      </div>
    </div>
  );
}