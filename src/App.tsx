import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PromptCard } from './components/PromptCard';
import { PromptPage } from './pages/PromptPage';
import { Search, SlidersHorizontal, Moon, Sun, Github } from 'lucide-react';
import { loadPrompts } from './data/prompts';
import { useTheme } from './context/ThemeContext';
import { useUpvotes } from './hooks/useUpvotes';
import type { Prompt } from './data/prompts';

function HomePage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'popular' | 'recent'>('popular');
  const [prompts, setPrompts] = React.useState<Prompt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { theme, toggleTheme } = useTheme();
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Loading prompts...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GPT Prompt Library</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Discover and share powerful GPT prompts</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => setSortBy(prev => prev === 'popular' ? 'recent' : 'popular')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <SlidersHorizontal size={16} />
              <span>{sortBy === 'popular' ? 'Popular' : 'Recent'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Want to contribute?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add your own prompts by creating a pull request on GitHub.
              </p>
            </div>
            <a
              href="https://github.com/justmiles/gpt-prompts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <Github size={16} />
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
      </Routes>
    </Router>
  );
}

export default App;