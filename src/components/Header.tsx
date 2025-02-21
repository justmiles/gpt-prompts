import React from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { SettingsMenu } from './SettingsMenu';

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { showSettings, setShowSettings } = useSettings();

  return (
    <>
      <header className="bg-white dark:bg-dark-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="block">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">GPT Prompt Library</h1>
                <p className="text-base text-gray-600 dark:text-dark-300 mt-2">Discover and share powerful GPT prompts</p>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
                title="Settings"
              >
                <SettingsIcon size={20} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} className="text-olive-500" /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}