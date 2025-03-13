'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import settingConfig from '@/configs/settingConfig';
import { axiosInstance } from '@/lib/axios';
import { getCentralDomains } from '@/utils/getters/getCentralDomains';
import { settingsMerger } from '@/utils/settingsMerger';
import centralChecker from '@/utils/workers/centralChecker';

const defaultThemeConfig = settingConfig;
const STORAGE_KEY = 'app_settings';
const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const loadSavedSettings = async () => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const domains = await getCentralDomains();
      const url = new URL(window.location.href);
      const isCentral = domains.centralDomains.includes(url.host);

      if (isCentral) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settingConfig));
        return settingConfig;
      }

      const res = await axiosInstance.get('/settings');
      const settings = res?.data;
      if (settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        return settings;
      }
    }

    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
};

const saveSettings = (settings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const SettingsProvider = ({ children, type }) => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(defaultThemeConfig);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCentralChecked, setIsCentralChecked] = useState(false);
  const [isCentral, setIsCentral] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialSettingsApplied = useRef(false);
  const currentFavicon = useRef(null);

  // Handle central check
  useEffect(() => {
    const checkCentral = async () => {
      try {
        const result = await centralChecker();
        setIsCentral(result);
        setIsCentralChecked(true);
      } catch (error) {
        console.error('Central check failed:', error);
        setIsCentralChecked(true);
      }
    };

    checkCentral();
  }, []);

  // Query for settings
  const { data: querySettings, isLoading: isQueryLoading } = useQuery({
    queryKey: ['settings', { isCentral, type }],
    queryFn: async () => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          const url = isCentral
            ? '/api/getters/central-settings'
            : `/tenant/helpers/v1/settings${type ? `?type=${type}` : ''}`;

          const { data } = await axiosInstance.get(url);
          if (!data) {
            throw new Error('No data received from settings endpoint');
          }

          const mergedSettings = settingsMerger(data?.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSettings));
          return mergedSettings;
        }
        return null;
      } catch (error) {
        throw new Error(`Failed to fetch settings: ${error.message}`);
      }
    },
    enabled: isCentralChecked,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const savedSettings = await loadSavedSettings();
        if (savedSettings) {
          setSettings(savedSettings);
          applySettings(savedSettings);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing settings:', error);
        setIsInitialized(true);
      }
    };

    initializeSettings();
  }, []);

  // Update settings when query data changes
  useEffect(() => {
    if (querySettings && !initialSettingsApplied.current) {
      setSettings(prev => ({ ...prev, ...querySettings }));
      applySettings({ ...settings, ...querySettings });
      initialSettingsApplied.current = true;
    }
  }, [querySettings, settings]);

  // Storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newSettings = e.newValue ? JSON.parse(e.newValue) : defaultThemeConfig;
          setSettings(newSettings);
          applySettings(newSettings);
        } catch (error) {
          console.error('Failed to parse settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Settings changed event listener
  useEffect(() => {
    const handleSettingsChanged = (e) => {
      const newSettings = e.detail;
      applySettings(newSettings);
    };

    window.addEventListener('settingsChanged', handleSettingsChanged);
    return () => window.removeEventListener('settingsChanged', handleSettingsChanged);
  }, []);

  // Route change listener to reapply favicon
  useEffect(() => {
    const handleRouteChange = () => {
      if (settings?.header?.favicon && currentFavicon.current) {
        updateFavicon(currentFavicon.current);
      }
    };

    // Next.js App Router doesn't have an event system like pages router
    // Using a MutationObserver to detect navigation changes
    const observer = new MutationObserver(() => {
      handleRouteChange();
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [settings]);

  const updateFavicon = useCallback((faviconUrl) => {
    if (!faviconUrl) return;

    const faviconElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    faviconElement.type = 'image/x-icon';
    faviconElement.rel = 'shortcut icon';
    faviconElement.href = faviconUrl;

    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(faviconElement);
    }
  }, []);

  const applySettings = useCallback((newSettings) => {
    if (!newSettings) return;

    // Apply language and direction settings
    document.documentElement.lang = newSettings.language?.locale;
    document.documentElement.dir = newSettings.language?.direction;

    // Update favicon if provided
    if (newSettings.header?.favicon) {
      currentFavicon.current = newSettings.header.favicon;
      updateFavicon(newSettings.header.favicon);
    }
  }, [updateFavicon]);

  const updateSettings = useCallback((updates) => {
    setSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        ...updates
      };

      if (!['light', 'dark', 'system'].includes(newSettings.mode)) {
        newSettings.mode = defaultThemeConfig.mode;
      }

      if (!['default', 'bordered'].includes(newSettings.skin)) {
        newSettings.skin = defaultThemeConfig.skin;
      }

      saveSettings(newSettings);
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: newSettings }));

      return newSettings;
    });
  }, []);

  const saveAndUpdateLanguage = useCallback((locale, direction = 'ltr') => {
    setSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        language: {
          locale: locale || prevSettings.language?.locale,
          direction: direction || prevSettings.language?.direction
        }
      };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultThemeConfig);
    saveSettings(defaultThemeConfig);
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Invalidate the settings query cache
      await queryClient.invalidateQueries(['settings', { isCentral, type }]);

      // Fetch fresh settings
      const url = isCentral
        ? '/api/getters/central-settings'
        : `/tenant/helpers/v1/settings${type ? `?type=${type}` : ''}`;

      const { data } = await axiosInstance.get(url);
      if (!data) {
        throw new Error('No data received from settings endpoint');
      }

      const mergedSettings = settingsMerger(data?.data);

      // Update local storage and state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSettings));
      setSettings(mergedSettings);
      applySettings(mergedSettings);

      // Dispatch settings changed event
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: mergedSettings }));

      return mergedSettings;
    } catch (error) {
      console.error('Failed to refresh settings:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [isCentral, type, queryClient, applySettings]);

  const value = {
    settings,
    updateSettings,
    saveAndUpdateLanguage,
    resetSettings,
    refreshSettings,
    isInitialized,
    isLoading: !isCentralChecked || isQueryLoading,
    isRefreshing,
    isCentral
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};