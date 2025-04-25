// Create a new client component for language settings
'use client'
// app/components/LanguageProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react'

// Create context to expose language settings to child components
export const LanguageContext = createContext({
    language: {
        locale: 'en',
        direction: 'ltr'
    },
    setLanguage: () => { }
})

export const useLanguage = () => useContext(LanguageContext)

export default function LanguageProvider({ children }) {
    const [language, setLanguage] = useState({
        locale: 'en',
        direction: 'ltr'
    })

    useEffect(() => {
        try {
            const settings = JSON.parse(localStorage.getItem('app_settings'))
            if (settings?.language) {
                setLanguage(settings.language)

                // Directly update HTML attributes
                const htmlElement = document.documentElement
                if (htmlElement) {
                    htmlElement.lang = settings.language.locale
                    htmlElement.dir = settings.language.direction
                }
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error)
        }
    }, [])

    // When language changes, update HTML attributes
    useEffect(() => {
        const htmlElement = document.documentElement
        if (htmlElement) {
            htmlElement.lang = language.locale
            htmlElement.dir = language.direction
        }
    }, [language])

    // Provide both the language state and setter to children
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}