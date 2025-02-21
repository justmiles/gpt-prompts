import React from 'react';
import { Settings, X, Trash2, Key } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAT_STORAGE_PREFIX = 'chat_history_';

export function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const [apiKey, setApiKey] = React.useState(() => sessionStorage.getItem('openai_api_key') || '');
  const [showPurgeConfirm, setShowPurgeConfirm] = React.useState(false);
  const [selectedDays, setSelectedDays] = React.useState<number | 'all'>(7);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem('openai_api_key', apiKey.trim());
    } else {
      sessionStorage.removeItem('openai_api_key');
    }
  };

  const handlePurgeChats = () => {
    if (selectedDays === 'all') {
      // Purge all chats
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CHAT_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Purge chats older than selected days
      const now = Date.now();
      const cutoffTime = now - (selectedDays * 24 * 60 * 60 * 1000);

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CHAT_STORAGE_PREFIX)) {
          try {
            const chatHistory = JSON.parse(localStorage.getItem(key) || '');
            if (chatHistory.lastUpdated < cutoffTime) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            console.error('Error parsing chat history:', error);
            // Remove invalid entries
            localStorage.removeItem(key);
          }
        }
      });
    }

    setShowPurgeConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-700 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-olive-600 dark:text-olive-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-dark-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* OpenAI API Key Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Key size={18} className="text-olive-600 dark:text-olive-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">OpenAI API Key</h3>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:ring-2 focus:ring-olive-500 dark:focus:ring-olive-400 focus:border-transparent"
              />
              <button
                onClick={handleSaveApiKey}
                className="w-full px-4 py-2 text-base font-medium text-white bg-olive-600 rounded-lg hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500"
              >
                Save API Key
              </button>
            </div>
          </div>

          {/* Chat History Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trash2 size={18} className="text-olive-600 dark:text-olive-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">Chat History</h3>
            </div>
            <div className="space-y-3">
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 focus:ring-2 focus:ring-olive-500 dark:focus:ring-olive-400 focus:border-transparent"
              >
                <option value="all">All chats</option>
                <option value={1}>Older than 1 day</option>
                <option value={7}>Older than 7 days</option>
                <option value={14}>Older than 14 days</option>
              </select>
              <button
                onClick={() => setShowPurgeConfirm(true)}
                className="w-full px-4 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {selectedDays === 'all' ? 'Purge All Chats' : 'Purge Old Chats'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showPurgeConfirm}
        onClose={() => setShowPurgeConfirm(false)}
        onConfirm={handlePurgeChats}
        title={selectedDays === 'all' ? 'Purge All Chats' : 'Purge Old Chats'}
        message={selectedDays === 'all' 
          ? 'Are you sure you want to delete all chat histories? This action cannot be undone.'
          : `Are you sure you want to delete all chat histories older than ${selectedDays} ${selectedDays === 1 ? 'day' : 'days'}? This action cannot be undone.`
        }
      />
    </div>
  );
}