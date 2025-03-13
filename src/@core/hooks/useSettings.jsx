'use client';
import settingConfig from '@/configs/settingConfig';
import { createContext, useContext, useEffect, useState } from 'react';

// Create the context
const SettingsContext = createContext();

// Custom hook to use settings
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(settingConfig);

  // Load settings from localStorage when the component mounts
  useEffect(() => {
    const storedSettings = localStorage.getItem(settingConfig?.settingsCookieName);

    if (storedSettings) {
      setSettings({ ...settings, ...JSON.parse(storedSettings) });
    }
  }, []);

  // Update localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(settingConfig?.settingsCookieName, {
      ...settings,
      language: {
        locale: settings.language.locale,
        direction: settings.language.direction
      }
    });
    document.documentElement.lang = settings.language.locale;
    document.documentElement.dir = settings.language.direction;
  }, [settings]);

  // Function to update settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
