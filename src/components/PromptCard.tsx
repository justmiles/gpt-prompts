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
    e.stopPropagation();
    if (!isUpvoted) {
      setIsUpvoted(true);
      Cookies.set(`upvote-${prompt.slug}`, 'true', { expires: 365 });
      onUpvote(prompt.slug);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/prompt/${prompt.slug}`;
    navigator.clipboard.writeText(url);
    alert('Prompt URL copied to clipboard!');
  };

  return (
    <div 
      onClick={() => navigate(`/prompt/${prompt.slug}`)}
      className="bg-white dark:bg-dark-700 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-olive-600 dark:text-olive-400 bg-olive-50 dark:bg-olive-900/30 px-3 py-1 rounded-full">
            {prompt.category}
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUpvote}
              className={clsx(
                "flex items-center space-x-2 text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 transition-colors p-1.5",
                isUpvoted && "text-olive-600 dark:text-olive-400 hover:text-olive-700 dark:hover:text-olive-300"
              )}
              disabled={isUpvoted}
            >
              <ArrowBigUp size={18} />
              <span className="text-base">{upvotes}</span>
            </button>
            <button
              onClick={handleShare}
              className="text-olive-500 dark:text-olive-400 hover:text-olive-600 dark:hover:text-olive-300 transition-colors p-1.5"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-3">
          {prompt.title}
        </h3>
        <p className="text-base text-gray-600 dark:text-dark-300">
          {prompt.description}
        </p>
      </div>
    </div>
  );
}