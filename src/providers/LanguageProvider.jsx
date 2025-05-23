'use client'
import { useUser } from '@/@core/contexts/userContext'
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// Create context to expose language settings to child components
export const LanguageContext = createContext({
    language: {
        locale: 'en',
        direction: 'ltr'
    },
    setLanguage: () => { },
    refreshLanguage: () => { },
    languages: [],
    isLoading: true,
    error: null
})

export const useLanguage = () => useContext(LanguageContext)

export default function LanguageProvider({ children }) {
    const { data: languages, isLoading, error } = useActiveLanguages()
    const { user } = useUser()
    const userLang = user?.preferences?.language

    const [language, setLanguage] = useState({
        locale: 'en',
        direction: 'ltr'
    })

    // Track if refresh is needed
    const [refreshCounter, setRefreshCounter] = useState(0)

    // Function to determine and set the appropriate language
    const determineLanguage = useCallback(() => {
        if (isLoading || !languages || languages.length === 0) {
            return; // Wait until languages are loaded
        }

        try {
            // PRIORITY 1: User preference from account settings
            if (userLang) {
                const userLanguage = languages.find(lang => lang.code === userLang)
                if (userLanguage) {
                    const newLanguage = {
                        locale: userLanguage.code,
                        direction: userLanguage.direction
                    }
                    setLanguage(newLanguage)
                    updateHtmlAttributes(newLanguage)
                    saveToLocalStorage(newLanguage) // Update localStorage to match user preference
                    console.log('Using user preference language:', userLanguage.code)
                    return
                }
            }

            // PRIORITY 2: Saved preference in localStorage
            const savedLanguage = localStorage.getItem('app_language')
            if (savedLanguage) {
                const languageSettings = JSON.parse(savedLanguage)
                // Verify that this language still exists in available languages
                const isSavedLanguageAvailable = languages.some(lang => lang.code === languageSettings.locale)

                if (isSavedLanguageAvailable) {
                    setLanguage(languageSettings)
                    updateHtmlAttributes(languageSettings)
                    console.log('Using localStorage language:', languageSettings.locale)
                    return
                }
            }

            // PRIORITY 3: Default language from API
            const defaultLang = languages.find(lang => lang.is_default) || languages[0]
            const newLanguage = {
                locale: defaultLang.code,
                direction: defaultLang.direction
            }

            setLanguage(newLanguage)
            updateHtmlAttributes(newLanguage)
            saveToLocalStorage(newLanguage)
            console.log('Using default language:', defaultLang.code)
        } catch (error) {
            console.error('Error initializing language settings:', error)
        }
    }, [isLoading, languages, userLang])

    // Initialize language with proper priority
    useEffect(() => {
        determineLanguage()
    }, [determineLanguage, refreshCounter])

    // When language changes, update HTML attributes
    useEffect(() => {
        updateHtmlAttributes(language)
    }, [language])

    // Refresh function to force re-evaluation of language settings
    const refreshLanguage = useCallback(() => {
        console.log('Refreshing language settings')
        // Clear localStorage if needed
        // localStorage.removeItem('app_language')
        setRefreshCounter(prev => prev + 1)
    }, [])

    // Helper function to update HTML attributes
    const updateHtmlAttributes = (lang) => {
        const htmlElement = document.documentElement
        if (htmlElement) {
            htmlElement.lang = lang.locale
            htmlElement.dir = lang.direction
        }
    }

    // Helper function to save to localStorage
    const saveToLocalStorage = (newLanguage) => {
        try {
            localStorage.setItem('app_language', JSON.stringify(newLanguage))
        } catch (error) {
            console.error('Error saving to localStorage:', error)
        }
    }

    // Extended setLanguage function that also saves to localStorage
    const handleSetLanguage = useCallback((newLanguage) => {
        setLanguage(newLanguage)
        updateHtmlAttributes(newLanguage)
        saveToLocalStorage(newLanguage)
    }, [])

    // Provide language state, setter, refresh function, and available languages to children
    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: handleSetLanguage,
            refreshLanguage,
            languages,
            isLoading,
            error
        }}>
            {children}
        </LanguageContext.Provider>
    )
}