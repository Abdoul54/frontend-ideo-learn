'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { axiosInstance } from '@/lib/axios'
import { useLanguage } from '@/providers/LanguageProvider'
import { usePathname } from 'next/navigation'
import { useSettings } from './settingsContext'
import { getPathKeys } from '@/utils/getters/getPathKeys'

const TranslationContext = React.createContext()
const DEFAULT_LANGUAGE = 'fr'
const STORAGE_KEY = 'app_translations'

export const TranslationProvider = ({ children }) => {
  const { language: activeLanguage, languages } = useLanguage()
  const currentLocale = activeLanguage?.locale || DEFAULT_LANGUAGE
  const { settings } = useSettings()
  const pathname = usePathname()

  const translationsApplied = useRef(false)

  const [metadataState, setMetadataState] = useState({
    title: '',
    description: '',
    favicon: settings?.header?.favicon || '/favicon.ico',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [translations, setTranslations] = useState(null)

  const translate = (key, placeholders = {}) => {
    if (!translations) return key;
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) result = result?.[k];
    if (!result || typeof result !== 'string') return key;

    if (placeholders && typeof placeholders === 'object') {
      Object.keys(placeholders).forEach((ph) => {
        if (ph === '' || ph === null || ph === undefined) return; // Skip invalid keys

        try {
          // Handle numeric placeholders specifically
          if (!isNaN(ph)) {
            // For numeric placeholders like {0}, use string replacement instead of regex
            result = result.replace(`{${ph}}`, String(placeholders[ph] || ''));
          } else {
            // For named placeholders, use the safer regex approach
            const escapedKey = String(ph).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`{${escapedKey}}`, 'g'), String(placeholders[ph] || ''));
          }
        } catch (e) {
          console.warn(`Error replacing placeholder ${ph} in translation ${key}:`, e);
        }
      });
    }

    return result;
  };

  const applyMetadataFromTranslations = useCallback((metadata, path) => {
    const pathKey = getPathKeys(path)

    let newMeta = {
      title: settings?.header?.page_title || 'IDEO SAAS',
      description: settings?.header?.header_message?.content || 'IDEO SAAS',
      favicon: settings?.header?.favicon || '/favicon.ico',
    }

    if (pathKey) {
      newMeta.title = translate('metadata.' + pathKey.title) || newMeta.title
      newMeta.description = translate('metadata.' + pathKey.description) || newMeta.description
    } else if (metadata && typeof metadata === 'object') {
      const item = Object.values(metadata).find(item => item.path === path)
      if (item) {
        newMeta.title = item.title || newMeta.title
        newMeta.description = item.description || newMeta.description
        newMeta.favicon = item.favicon || newMeta.favicon
      }
    }

    setMetadataState(prev => {
      if (
        prev.title === newMeta.title &&
        prev.description === newMeta.description &&
        prev.favicon === newMeta.favicon
      ) return prev
      return newMeta
    })
  }, [settings?.header, translate])

  const loadTranslations = useCallback(async (lang) => {
    if (!lang) return
    setLoading(true)
    setError(null)

    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (cached?.language === lang && cached?.data) {
        setTranslations(cached.data)
        return
      }

      const res = await axiosInstance.get(`/tenant/localization/v1/translations/${lang}`)
      // const res = await axiosInstance.get(`/api/getters/translations/fr`)
      const data = res?.data?.data || res?.data
      if (data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ language: lang, data, timestamp: Date.now() }))
        setTranslations(data)
      }
    } catch (err) {
      console.error('Translation fetch failed', err)
      setError('Failed to load translations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!translations?.metadata || !pathname) return
    const timeout = setTimeout(() => {
      applyMetadataFromTranslations(translations.metadata, pathname)
    }, 0)
    return () => clearTimeout(timeout)
  }, [pathname, translations?.metadata, applyMetadataFromTranslations])

  useEffect(() => {
    document.title = metadataState.title

    const descTag = document.querySelector('meta[name="description"]')
    if (descTag) {
      descTag.setAttribute('content', metadataState.description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = metadataState.description
      document.head.appendChild(meta)
    }

    const faviconUrl = metadataState.favicon
    if (faviconUrl) {
      const favLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      favLinks.forEach(link => { link.href = faviconUrl })
      if (favLinks.length === 0) {
        const link = document.createElement('link')
        link.rel = 'icon'
        link.href = faviconUrl
        link.type = faviconUrl.endsWith('.png') ? 'image/png' :
          faviconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/svg+xml'
        document.head.appendChild(link)
      }
    }
  }, [metadataState])

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (cached?.data) setTranslations(cached.data)
    } catch (e) {
      console.warn('Corrupted translation cache. Clearing it.', e)
      localStorage.removeItem(STORAGE_KEY)
    }
    loadTranslations(currentLocale)
  }, [currentLocale, loadTranslations])

  const forceRefreshTranslations = () => {
    localStorage.removeItem(STORAGE_KEY)
    loadTranslations(currentLocale)
  }

  return (
    <TranslationContext.Provider
      value={{
        language: currentLocale,
        translate,
        isLoading: loading,
        error,
        availableLanguages: languages?.map(lang => lang.code) || [],
        refreshTranslations: () => loadTranslations(currentLocale),
        forceRefreshTranslations,
        metadata: metadataState,
        setMetadata: (title, desc, fav) => setMetadataState({
          title: title || metadataState.title,
          description: desc || metadataState.description,
          favicon: fav || metadataState.favicon
        })
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const ctx = React.useContext(TranslationContext)
  if (!ctx) throw new Error('useTranslation must be used within TranslationProvider')
  return ctx
}
