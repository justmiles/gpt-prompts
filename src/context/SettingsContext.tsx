import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SettingsContext.Provider value={{ showSettings, setShowSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}