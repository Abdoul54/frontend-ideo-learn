'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import centralChecker from '@/utils/workers/centralChecker';
import { useSession } from 'next-auth/react';

// Define the storage key for user data
const STORAGE_KEY = 'app_user_profile';

// Create context
const UserContext = createContext(undefined);

// Helper function to load saved user data from localStorage
const loadSavedUserData = () => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON?.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load user data from localStorage:', error);
    return null;
  }
};

// Helper function to save user data to localStorage
const saveUserData = (userData) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
};

export function UserProvider({ children }) {
  const queryClient = useQueryClient();
  const session = useSession();
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialUserApplied = useRef(false);
  const [isCentralChecked, setIsCentralChecked] = useState(false);
  const [isCentral, setIsCentral] = useState(false);

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

  // Use React Query to fetch user data
  const { data: queryUserData, isLoading, refetch } = useQuery({
    queryKey: ['userData', { isCentral }],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(`/${isCentral ? "central" : "tenant"}/auth/v1/session`);

        if (!data) {
          throw new Error('No data received from user data endpoint');
        }

        // Extract just the user data from the response
        const userData = data.data;

        // Save to localStorage for persistence
        saveUserData(userData);

        return userData;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error(`Failed to fetch user data: ${error.message}`);
      }
    },
    enabled: isCentralChecked && session?.status === 'authenticated',
    retry: 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Initialize user data from localStorage on first render
  useEffect(() => {
    const initializeUserData = () => {
      try {
        const savedUserData = loadSavedUserData();
        if (savedUserData) {
          setUser(savedUserData);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing user data:', error);
        setIsInitialized(true);
      }
    };

    initializeUserData();
  }, []);

  // Update user state when query data changes
  useEffect(() => {
    if (queryUserData) {
      setUser(queryUserData);
      initialUserApplied.current = true;
    }
  }, [queryUserData]);

  // Listen for storage events (for multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newUserData = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUserData);
        } catch (error) {
          console.error('Failed to parse user data from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom user data changed events
  useEffect(() => {
    const handleUserDataChanged = (e) => {
      const newUserData = e.detail;
      setUser(newUserData);
    };

    window.addEventListener('userDataChanged', handleUserDataChanged);
    return () => window.removeEventListener('userDataChanged', handleUserDataChanged);
  }, []);

  // Update user data function
  const updateUser = useCallback((updates) => {
    setUser(prevUser => {
      const newUserData = {
        ...prevUser,
        ...updates
      };

      saveUserData(newUserData);
      window.dispatchEvent(new CustomEvent('userDataChanged', { detail: newUserData }));

      return newUserData;
    });
  }, []);

  // Reset user to initial state function
  const resetUser = useCallback(() => {
    setUser(null);
    saveUserData(null);
    window.dispatchEvent(new CustomEvent('userDataChanged', { detail: null }));
  }, []);

  // remove the local storage item
  const removeUserData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Function to refresh user data from API
  const refreshUserData = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Use React Query's refetch mechanism
      const result = await refetch();

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        // Update state with fresh data
        setUser(result.data);

        // Dispatch user data changed event
        window.dispatchEvent(
          new CustomEvent('userDataChanged', { detail: result.data })
        );
      }

      return result.data;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Function to check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return user && user.is_active && !user.is_expired;
  }, [user]);

  // Function to log out user
  const logout = useCallback(async () => {
    try {
      // You would typically call your logout API endpoint here
      // await axiosInstance.post('/tenant/auth/v1/logout');

      // Reset user state
      resetUser();

      // Invalidate user data in the query cache
      queryClient.invalidateQueries(['userData']);

      return true;
    } catch (err) {
      console.error('Error logging out:', err);
      return false;
    }
  }, [resetUser, queryClient]);

  // Create context value object
  const value = {
    user,
    updateUser,
    resetUser,
    removeUserData,
    refreshUserData,
    isInitialized,
    isLoading,
    isRefreshing,
    isAuthenticated,
    logout
  };

  // Don't render children until initialization is complete
  if (!isInitialized) {
    return null;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}