'use client'

import { useState, useEffect, useCallback } from 'react';
import { useCategories } from '@/hooks/api/tenant/learn/course/useCategories';

/**
 * Custom hook for managing category navigation with API integration
 * @param {Object} initialRootCategory - The initial root category (may be updated from API)
 * @param {Function} onChange - Callback when navigation changes
 * @param {Array} initialHistory - Optional initial history array
 * @returns Navigation history state, methods, and loading state
 */
export const useCategoriesNavigation = (initialRootCategory, onChange, initialHistory = []) => {
  // State for root category that might be updated from API
  const [rootCategory, setRootCategory] = useState(initialRootCategory || { id: 2, title: 'Root' });
  
  // Initialize history with initial values or empty
  const [history, setHistory] = useState(() => {
    if (Array.isArray(initialHistory) && initialHistory.length > 0) {
      return [...initialHistory];
    }
    return rootCategory ? [rootCategory] : [];
  });

  // Current item is always the last item in history
  const [currentItem, setCurrentItem] = useState(() => {
    if (Array.isArray(initialHistory) && initialHistory.length > 0) {
      return initialHistory[initialHistory.length - 1];
    }
    return rootCategory || null;
  });

  // When rootCategory updates from API, update history and currentItem if at root level
  useEffect(() => {
    if (rootCategory && rootCategory.id) {
      // If history is empty or we're at root level, update with the new root
      if (history.length === 0) {
        setHistory([rootCategory]);
        setCurrentItem(rootCategory);
      } 
      // If we're at the root level (first item in history has same ID as root)
      else if (history.length > 0 && history[0].id === rootCategory.id) {
        const newHistory = [...history];
        newHistory[0] = rootCategory;
        setHistory(newHistory);
        
        // If current item is the root, update that too
        if (currentItem && currentItem.id === rootCategory.id) {
          setCurrentItem(rootCategory);
        }
      }
    }
  }, [rootCategory]);

  // Go forward by adding a new item to history
  const goForward = useCallback((item) => {
    if (!item) return;

    setHistory(prevHistory => [...prevHistory, item]);
    setCurrentItem(item);

    if (typeof onChange === 'function') {
      onChange(item, 'forward');
    }
  }, [onChange]);

  // Go back by removing the last item from history
  const goBack = useCallback(() => {
    setHistory(prevHistory => {
      // Ensure we always keep at least one item in history
      if (prevHistory.length <= 1) return prevHistory;

      // Create a new array without the last item
      const newHistory = prevHistory.slice(0, -1);
      // Update current item
      const newCurrentItem = newHistory[newHistory.length - 1];
      setCurrentItem(newCurrentItem);

      if (typeof onChange === 'function') {
        onChange(newCurrentItem, 'back');
      }

      return newHistory;
    });
  }, [onChange]);

  // Go to specific breadcrumb by truncating history
  const goToBreadcrumb = useCallback((item) => {
    if (!item) return;

    setHistory(prevHistory => {
      // Find index of the item
      const index = prevHistory.findIndex(historyItem =>
        historyItem.id === item.id
      );

      // If not found, don't change anything
      if (index === -1) return prevHistory;

      // Truncate history up to and including the clicked item
      const newHistory = prevHistory.slice(0, index + 1);
      setCurrentItem(item);

      if (typeof onChange === 'function') {
        onChange(item, 'breadcrumb');
      }

      return newHistory;
    });
  }, [onChange]);

  // Fetch the current category data if needed (especially the root category)
  const { data: rootCategoryData, isLoading: isRootLoading } = useCategories({
    page: 1,
    page_size: 1,
    with_extra_data: 1,
    parent_id: undefined, // Not specifying a parent to get the root info
  });

  // Update root category from API data
  useEffect(() => {
    if (rootCategoryData?.data?.extra_data) {
      const extraData = rootCategoryData.data.extra_data;
      if (extraData && extraData.id) {
        setRootCategory({
          id: extraData.id,
          title: extraData.title || extraData.code || 'Root'
        });
      }
    }
  }, [rootCategoryData]);

  // Return stable API
  return {
    history,
    currentItem,
    rootCategory,
    goForward,
    goBack,
    goToBreadcrumb,
    setCurrentItem,
    setHistory,
    setRootCategory,
    isLoading: isRootLoading
  };
};

export default useCategoriesNavigation;