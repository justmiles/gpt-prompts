import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PromptCard } from './components/PromptCard';
import { PromptPage } from './pages/PromptPage';
import { ChatPage } from './pages/ChatPage';
import { Search, SlidersHorizontal, Github } from 'lucide-react';
import { loadPrompts } from './data/prompts';
import { useUpvotes } from './hooks/useUpvotes';
import { Header } from './components/Header';
import type { Prompt } from './data/prompts';

function HomePage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'popular' | 'recent'>('popular');
  const [prompts, setPrompts] = React.useState<Prompt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { upvotes, loading: upvotesLoading, upvotePrompt } = useUpvotes();

  React.useEffect(() => {
    loadPrompts()
      .then(setPrompts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = React.useMemo(() => {
    return Array.from(new Set(prompts.map(prompt => prompt.category)));
  }, [prompts]);

  const filteredPrompts = React.useMemo(() => {
    return prompts
      .filter(prompt => {
        const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (upvotes[b.slug] || 0) - (upvotes[a.slug] || 0);
        }
        return b.slug.localeCompare(a.slug);
      });
  }, [prompts, searchTerm, selectedCategory, sortBy, upvotes]);

  if (loading || upvotesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-dark-100 mb-4">Loading prompts...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-800 flex flex-col">
      <Header showSearch />

      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400" size={20} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:ring-2 focus:ring-olive-500 dark:focus:ring-olive-600 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 focus:ring-2 focus:ring-olive-500 dark:focus:ring-olive-600 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => setSortBy(prev => prev === 'popular' ? 'recent' : 'popular')}
              className="flex items-center gap-2 px-4 py-2.5 text-base border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-600"
            >
              <SlidersHorizontal size={20} className="text-olive-500" />
              <span>{sortBy === 'popular' ? 'Popular' : 'Recent'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(prompt => (
            <PromptCard
              key={prompt.slug}
              prompt={prompt}
              upvotes={upvotes[prompt.slug] || 0}
              onUpvote={() => upvotePrompt(prompt.slug)}
            />
          ))}
        </div>
      </main>

      <footer className="bg-white dark:bg-dark-700 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3">Want to contribute?</h2>
              <p className="text-base text-gray-600 dark:text-dark-300">
                Add your own prompts by creating a pull request on GitHub.
              </p>
            </div>
            <a
              href="https://github.com/justmiles/gpt-prompts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 text-base font-medium text-white bg-olive-600 dark:bg-olive-700 rounded-lg hover:bg-olive-700 dark:hover:bg-olive-600 transition-colors"
            >
              <Github size={20} />
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/prompt/:slug" element={<PromptPage />} />
        <Route path="/prompt/:slug/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;