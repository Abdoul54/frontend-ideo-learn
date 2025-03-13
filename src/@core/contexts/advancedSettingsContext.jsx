'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import advancedSettingConfig from '@/configs/advancedSettingConfig';
import { axiosInstance } from '@/lib/axios';
import { advancedSettingsMerger } from '@/utils/advancedSettingsMerger';

const defaultAdvancedConfig = advancedSettingConfig;
const STORAGE_KEY = 'app_advanced_settings';
const AdvancedSettingsContext = createContext();

export const useAdvancedSettings = () => {
  const context = useContext(AdvancedSettingsContext);
  if (!context) {
    throw new Error('useAdvancedSettings must be used within an AdvancedSettingsProvider');
  }
  return context;
};

const loadSavedAdvancedSettings = async () => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      try {
        const res = await axiosInstance.get('/tenant/helpers/v1/advanced-settings');
        const settings = res?.data?.data;
        if (settings) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
          return settings;
        }
      } catch (error) {
        console.error('Failed to fetch advanced settings:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdvancedConfig));
        return defaultAdvancedConfig;
      }
    }

    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load advanced settings:', error);
    return null;
  }
};

const saveAdvancedSettings = (settings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save advanced settings:', error);
  }
};

export const AdvancedSettingsProvider = ({ children, type }) => {
  const queryClient = useQueryClient();
  const [advancedSettings, setAdvancedSettings] = useState(defaultAdvancedConfig);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialSettingsApplied = useRef(false);

  // Query for advanced settings
  const { data: queryAdvancedSettings, isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ['advancedSettings', { type }],
    queryFn: async () => {
      try {
        const url = `/tenant/helpers/v1/advanced-settings${type ? `?type=${type}` : ''}`;
        const { data } = await axiosInstance.get(url);

        if (!data) {
          throw new Error('No data received from advanced settings endpoint');
        }

        const mergedSettings = advancedSettingsMerger(data?.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSettings));
        return mergedSettings;
      } catch (error) {
        throw new Error(`Failed to fetch advanced settings: ${error.message}`);
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  });

  // Initialize advanced settings
  useEffect(() => {
    const initializeAdvancedSettings = async () => {
      try {
        const savedSettings = await loadSavedAdvancedSettings();
        if (savedSettings) {
          setAdvancedSettings(savedSettings);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing advanced settings:', error);
        setIsInitialized(true);
      }
    };

    initializeAdvancedSettings();
  }, []);

  // Update settings when query data changes
  useEffect(() => {
    if (queryAdvancedSettings) {
      setAdvancedSettings(queryAdvancedSettings);
      initialSettingsApplied.current = true;
    }
  }, [queryAdvancedSettings]);

  // Storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newSettings = e.newValue ? JSON.parse(e.newValue) : defaultAdvancedConfig;
          setAdvancedSettings(newSettings);
        } catch (error) {
          console.error('Failed to parse advanced settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Settings changed event listener
  useEffect(() => {
    const handleAdvancedSettingsChanged = (e) => {
      const newSettings = e.detail;
      setAdvancedSettings(newSettings);
    };

    window.addEventListener('advancedSettingsChanged', handleAdvancedSettingsChanged);
    return () => window.removeEventListener('advancedSettingsChanged', handleAdvancedSettingsChanged);
  }, []);

  const updateAdvancedSettings = useCallback((updates) => {
    setAdvancedSettings(prevSettings => {
      const newSettings = {
        ...prevSettings,
        ...updates
      };

      saveAdvancedSettings(newSettings);
      window.dispatchEvent(new CustomEvent('advancedSettingsChanged', { detail: newSettings }));

      return newSettings;
    });
  }, []);

  const resetAdvancedSettings = useCallback(() => {
    setAdvancedSettings(defaultAdvancedConfig);
    saveAdvancedSettings(defaultAdvancedConfig);
  }, []);

  const refreshAdvancedSettings = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Use React Query's refetch mechanism instead of manual fetching
      const result = await refetch();

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        console.log('Advanced settings refreshed:', result);

        // Update state with fresh data
        setAdvancedSettings(result.data);

        // Dispatch settings changed event
        window.dispatchEvent(
          new CustomEvent('advancedSettingsChanged', { detail: result.data })
        );
      }

      return result.data;
    } catch (error) {
      console.error('Failed to refresh advanced settings:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const value = {
    advancedSettings,
    updateAdvancedSettings,
    resetAdvancedSettings,
    refreshAdvancedSettings,
    isInitialized,
    isLoading: isQueryLoading,
    isRefreshing
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AdvancedSettingsContext.Provider value={value}>
      {children}
    </AdvancedSettingsContext.Provider>
  );
};

export { defaultAdvancedConfig };