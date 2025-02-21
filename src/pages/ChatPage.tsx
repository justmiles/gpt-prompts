import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadPrompts } from '../data/prompts';
import { OpenAISetup } from '../components/OpenAISetup';
import { ChatInterface } from '../components/ChatInterface';
import { Header } from '../components/Header';
import type { Prompt } from '../data/types';

export function ChatPage() {
  const { slug } = useParams<{ slug: string }>();
  const [prompt, setPrompt] = React.useState<Prompt | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showOpenAISetup, setShowOpenAISetup] = React.useState(false);

  React.useEffect(() => {
    loadPrompts()
      .then(prompts => {
        const foundPrompt = prompts.find(p => p.slug === slug);
        setPrompt(foundPrompt || null);
        setLoading(false);

        // Check for OpenAI API key and show setup if needed
        const apiKey = sessionStorage.getItem('openai_api_key');
        if (!apiKey) {
          setShowOpenAISetup(true);
        }
      })
      .catch(error => {
        console.error('Failed to load prompt:', error);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Prompt not found</h1>
            <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 w-[80%] mx-auto px-4 py-6">
        {showOpenAISetup ? (
          <OpenAISetup
            onClose={() => setShowOpenAISetup(false)}
          />
        ) : (
          <ChatInterface
            prompt={prompt.content}
            title={prompt.title}
            promptSlug={prompt.slug}
            onClose={() => {}} // Not used in full page mode
            fullPage
          />
        )}
      </div>
    </div>
  );
}