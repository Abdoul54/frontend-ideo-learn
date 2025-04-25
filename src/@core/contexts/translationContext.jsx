'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from './settingsContext';
import { axiosInstance } from '@/lib/axios';

// Create the context
const TranslationContext = React.createContext();

// Available languages
const AVAILABLE_LANGUAGES = ['en', 'es', 'fr', 'ar'];
const DEFAULT_LANGUAGE = 'en'; // Fallback default language

// Storage key for translations cache
const STORAGE_KEY = 'app_translations';

// Translation provider component
export const TranslationProvider = ({ children }) => {
  // Get language from settings
  const { settings } = useSettings();
  const settingsLanguage = settings?.language?.locale;

  // State for translations data
  const [translations, setTranslations] = useState({});
  const [language, setLanguage] = useState(() => {
    const defaultLang = settingsLanguage && AVAILABLE_LANGUAGES.includes(settingsLanguage)
      ? settingsLanguage
      : DEFAULT_LANGUAGE;
    return defaultLang;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load translations function - follows the pattern of loadSavedAdvancedSettings
  const loadTranslations = useCallback(async (lang) => {
    setLoading(true);
    setError(null);

    try {
      // First check for cached translations in localStorage
      const cachedData = localStorage.getItem(STORAGE_KEY);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        // Use cache if it's for the requested language and is still fresh (24 hours)
        if (parsed.language === lang &&
          Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          // console.log('Using cached translations for:', lang);
          setTranslations(parsed.data);
          setLoading(false);
          return;
        }
      }

      // No valid cache, fetch from API
      // console.log('Fetching translations for:', lang);

      try {
        const res = await axiosInstance.get(`/api/getters/translations/${lang}`);
        const data = res?.data?.data || res?.data;

        // console.log('Fetched translations:', data);

        if (data) {
          // Store in localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            language: lang,
            data,
            timestamp: Date.now()
          }));

          setTranslations(data);
        }
      } catch (apiError) {
        console.error('Failed to fetch translations:', apiError);

        // Check if we have any cached data for this language as fallback
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (parsed.language === lang) {
            // console.log('Using stale cached translations as fallback');
            setTranslations(parsed.data);
          } else {
            setError('Failed to load translations for ' + lang);
          }
        } else {
          setError('Failed to load translations for ' + lang);
        }
      }
    } catch (error) {
      console.error('Error in loadTranslations:', error);
      setError('Failed to load translations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  // Update language when settings change
  useEffect(() => {
    if (settingsLanguage &&
      AVAILABLE_LANGUAGES.includes(settingsLanguage) &&
      settingsLanguage !== language) {
      // console.log('Language changed from settings:', settingsLanguage);
      setLanguage(settingsLanguage);
    }
  }, [settingsLanguage, language]);

  // Function to change language
  const changeLanguage = (newLang) => {
    if (AVAILABLE_LANGUAGES.includes(newLang)) {
      console.log('Changing language to:', newLang);
      setLanguage(newLang);
    } else {
      console.warn(`Language ${newLang} is not supported, using default`);
      setLanguage(DEFAULT_LANGUAGE);
    }
  };

  // Function to update metadata for a specific path
  const updateMetadata = (path, title, description) => {
    if (!translations.metadata) return;

    const updatedMetadata = [...translations.metadata];
    const existingIndex = updatedMetadata.findIndex(item => item.path === path);

    if (existingIndex >= 0) {
      updatedMetadata[existingIndex] = { path, title, description };
    } else {
      updatedMetadata.push({ path, title, description });
    }

    const updatedTranslations = {
      ...translations,
      metadata: updatedMetadata
    };

    setTranslations(updatedTranslations);

    // Update localStorage with the new data
    try {
      const storageItem = {
        language,
        data: updatedTranslations,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageItem));
    } catch (err) {
      console.error('Error updating metadata in localStorage:', err);
    }
  };

  // Translate function with placeholder support
  const translate = (key, placeholders = {}) => {
    if (loading || !translations || !translations[key]) {
      return key; // Return key if translation not available
    }

    let text = translations[key];

    // Replace placeholders like {name} with actual values
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      text = text.replace(new RegExp(`{${placeholder}}`, 'g'), value);
    });

    return text;
  };

  // Force refresh translations
  const forceRefreshTranslations = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared translations cache');
      loadTranslations(language);
    } catch (error) {
      console.error('Error clearing translations cache:', error);
    }
  };

  // Context value to provide
  const contextValue = {
    language,
    changeLanguage,
    translate,
    metadata: translations?.metadata || [],
    updateMetadata,
    isLoading: loading,
    error: error,
    availableLanguages: AVAILABLE_LANGUAGES,
    refreshTranslations: () => loadTranslations(language),
    forceRefreshTranslations
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the translation context
export const useTranslation = () => {
  const context = React.useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};