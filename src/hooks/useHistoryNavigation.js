'use client'

import { useState } from 'react'

export const useHistoryNavigation = (initialItem, onHistoryChange) => {
  const [history, setHistory] = useState([initialItem])
  const [currentItem, setCurrentItem] = useState(initialItem)

  const goForward = (newItem) => {
    // If passed as separate arguments (id, title)
    if (typeof newItem !== 'object') {
      const id = newItem;
      const title = arguments[1];
      newItem = { id, title };
    }
    
    // Ensure id is a number
    newItem.id = parseInt(newItem.id, 10);
    
    const newHistory = [...history, newItem];
    setHistory(newHistory);
    setCurrentItem(newItem);
    onHistoryChange?.(newItem, 'forward');
  };

  const goBack = () => {
    if (history.length <= 1) return

    const newHistory = [...history]

    newHistory.pop()

    const previousItem = newHistory[newHistory.length - 1]

    setHistory(newHistory)
    setCurrentItem(previousItem)
    onHistoryChange?.(previousItem, 'back')
  }

  const goToBreadcrumb = target => {
    const targetId = typeof target === 'object' ? target.id : parseInt(target, 10);
    const index = history.findIndex(item => item.id === target.id)

    if (index !== -1) {
      const newHistory = history.slice(0, index + 1);
      const targetItem = history[index];
      setHistory(newHistory);
      setCurrentItem(targetItem);
      onHistoryChange?.(targetItem, 'breadcrumb');
    }
  };

  return {
    history,
    currentItem,
    goForward,
    goBack,
    goToBreadcrumb,
    setCurrentItem
  }
}
