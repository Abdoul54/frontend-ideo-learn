'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from './translationContext';

// Create the context
const MetadataContext = createContext(null);

/**
 * Provider component that manages page metadata based on the current path
 * and data stored in app_translations localStorage
 */
export const MetadataProvider = ({
  children,
  defaultTitle = 'IDEO SAAS',
  defaultDescription = 'Welcome to IDEO SAAS'
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const { language, metadata, updateMetadata, isLoading } = useTranslation();
  const prevLanguageRef = useRef(language);
  const prevLoadingRef = useRef(isLoading);

  const [currentMetadata, setCurrentMetadata] = useState({
    title: defaultTitle,
    description: defaultDescription,
    path: ''
  });

  // Set initial current path once on client-side
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Update metadata for current path whenever path or metadata changes
  useEffect(() => {
    if (!currentPath) return;

    // Check if we have metadata and should update
    if (Array.isArray(metadata) && metadata.length > 0) {
      updateMetadataForCurrentPath(metadata, currentPath);
    }
  }, [currentPath, metadata, defaultTitle, defaultDescription]);

  // Track language changes and update metadata when translations finish loading
  useEffect(() => {
    // When language changes, we'll need to update metadata once loading completes
    const languageChanged = prevLanguageRef.current !== language;
    const loadingFinished = prevLoadingRef.current && !isLoading;

    // Update refs for next comparison
    prevLanguageRef.current = language;
    prevLoadingRef.current = isLoading;

    // If language changed or loading just finished, and we have metadata and a path
    if ((languageChanged || loadingFinished) && !isLoading && currentPath && Array.isArray(metadata)) {
      // console.log('Language or loading state changed, updating metadata for path:', currentPath);
      updateMetadataForCurrentPath(metadata, currentPath);
    }
  }, [language, isLoading, metadata, currentPath]);

  // Update when path changes
  useEffect(() => {
    // Skip initial empty path
    if (!currentPath) return;

    const handleLocationChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        updateMetadataForCurrentPath(metadata, newPath);
      }
    };

    // Set up listeners for path changes
    window.addEventListener('popstate', handleLocationChange);

    // Observe history changes via proxying pushState and replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleLocationChange();
    };

    window.history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [currentPath, metadata]);

  // Update metadata based on the current path
  const updateMetadataForCurrentPath = (pagesArray, path) => {
    if (!path || !Array.isArray(pagesArray)) return;

    // Find the page that matches the current path
    const matchingPage = pagesArray.find(page => page.path === path);

    if (matchingPage) {
      setCurrentMetadata(matchingPage);

      // Update document title and description
      document.title = matchingPage.title;

      // Update meta description tag
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = matchingPage.description;
    } else {
      // Use defaults if no matching page is found
      const defaultMetadata = {
        title: defaultTitle,
        description: defaultDescription,
        path: path
      };

      setCurrentMetadata(defaultMetadata);

      document.title = defaultTitle;

      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = defaultDescription;
    }
  };

  const value = {
    // Current metadata
    currentMetadata,

    // All pages metadata
    pages: metadata,

    // Current language
    language,

    // Methods to update metadata programmatically
    setMetadata: (path, title, description) => {
      updateMetadata(path, title, description);
    },

    removePage: (path) => {
      // This would need to be implemented in the translation context
      // For now, we'll log a warning
      console.warn('removePage is not implemented. Use updateMetadata instead.');
    },

    // Set metadata for current page
    setCurrentPageMetadata: (title, description) => {
      updateMetadata(currentPath, title, description);
    }
  };

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
};

// Hook to use the metadata context
export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};