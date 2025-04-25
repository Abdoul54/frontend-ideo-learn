'use client'

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling navigation history with breadcrumbs
 * @param {Object} initialItem - The initial/root item in history
 * @param {Function} onChange - Callback when navigation changes
 * @param {Array} initialHistory - Optional initial history array
 * @returns Navigation history state and methods
 */
export const useHistoryNavigation = (initialItem, onChange, initialHistory = []) => {
  // Validate initialItem - ensure it has at least an id property
  const validInitialItem = initialItem && initialItem.id !== undefined ? initialItem : null;

  // Initialize history - if initialHistory is provided and valid, use it
  // Otherwise, start with just the initialItem
  const [history, setHistory] = useState(() => {
    if (Array.isArray(initialHistory) && initialHistory.length > 0) {
      // Validate and filter out any items without an id
      const validHistory = initialHistory.filter(item => item && item.id !== undefined);
      // Make a deep copy to avoid reference issues
      return validHistory.length > 0 ? JSON.parse(JSON.stringify(validHistory)) :
        validInitialItem ? [validInitialItem] : [];
    }
    return validInitialItem ? [validInitialItem] : [];
  });

  // Current item is always the last item in history
  const [currentItem, setCurrentItem] = useState(() => {
    if (Array.isArray(initialHistory) && initialHistory.length > 0) {
      const lastItem = initialHistory[initialHistory.length - 1];
      return lastItem && lastItem.id !== undefined ? { ...lastItem } : validInitialItem;
    }
    return validInitialItem;
  });

  // If initialItem changes and it's valid, update history if empty
  useEffect(() => {
    if (validInitialItem && (history.length === 0 || !history[0] || history[0]?.id === undefined)) {
      setHistory([{ ...validInitialItem }]);
      if (!currentItem || currentItem.id === undefined) {
        setCurrentItem({ ...validInitialItem });
      }
    }
  }, [validInitialItem, history, currentItem]);

  // Go forward by adding a new item to history
  const goForward = useCallback((item) => {
    if (!item || item.id === undefined) return;

    // Create a deep copy of the item to avoid reference issues
    const itemCopy = { ...item };

    setHistory(prevHistory => [...prevHistory, itemCopy]);
    setCurrentItem(itemCopy);

    if (typeof onChange === 'function') {
      onChange(itemCopy, 'forward');
    }
  }, [onChange]);

  // Go back by removing the last item from history
  const goBack = useCallback(() => {
    setHistory(prevHistory => {
      // Ensure we always keep at least one item in history
      if (prevHistory.length <= 1) return prevHistory;

      // Create a new array without the last item
      const newHistory = prevHistory.slice(0, -1);
      // Update current item with a copy to avoid reference issues
      const newCurrentItem = { ...newHistory[newHistory.length - 1] };
      setCurrentItem(newCurrentItem);

      if (typeof onChange === 'function') {
        onChange(newCurrentItem, 'back');
      }

      return newHistory;
    });
  }, [onChange]);

  // Go to specific breadcrumb by truncating history
  const goToBreadcrumb = useCallback((item) => {
    if (!item || item.id === undefined) return;

    setHistory(prevHistory => {
      // Find index of the item
      const index = prevHistory.findIndex(historyItem =>
        historyItem.id === item.id
      );

      // If not found, don't change anything
      if (index === -1) return prevHistory;

      // Truncate history up to and including the clicked item
      const newHistory = prevHistory.slice(0, index + 1);
      // Create a copy of the item to avoid reference issues
      const itemCopy = { ...item };
      setCurrentItem(itemCopy);

      if (typeof onChange === 'function') {
        onChange(itemCopy, 'breadcrumb');
      }

      return newHistory;
    });
  }, [onChange]);

  // Safe setter for currentItem that ensures it's a valid object
  const safeSetCurrentItem = useCallback((item) => {
    if (!item || item.id === undefined) return;
    setCurrentItem({ ...item });
  }, []);

  // Safe setter for history that ensures it contains valid items
  const safeSetHistory = useCallback((newHistory) => {
    if (!Array.isArray(newHistory) || newHistory.length === 0) return;

    // Filter out invalid items and create deep copies to avoid reference issues
    const validHistory = newHistory
      .filter(item => item && item.id !== undefined)
      .map(item => ({ ...item }));

    if (validHistory.length === 0) return;

    setHistory(validHistory);
    // Also update currentItem to the last item in history
    setCurrentItem({ ...validHistory[validHistory.length - 1] });
  }, []);

  // Return stable API
  return {
    history,
    currentItem,
    goForward,
    goBack,
    goToBreadcrumb,
    setCurrentItem: safeSetCurrentItem,
    setHistory: safeSetHistory
  };
};

export default useHistoryNavigation;