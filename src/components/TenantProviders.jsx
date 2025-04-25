'use client'

import { useEffect, useState } from 'react'
import { NextAuthProvider } from '@/providers/NextAuthProviders'
import { QueryProvider } from '@/providers/QueryProvider'
import { MuiLocalizationProvider } from '@/providers/MuiLocalizationProvider'
import { SettingsProvider } from '@/@core/contexts/settingsContext'
import { AdvancedSettingsProvider } from '@/@core/contexts/advancedSettingsContext'
import AuthWrapper from '@/providers/AuthWrapper'
import ThemeProviderWrapper from '@/providers/ThemeProviderWrapper'
import { VerticalNavProvider } from '@/@menu/contexts/verticalNavContext'
import { Toaster } from 'react-hot-toast'
import { SSOProvider } from '@/providers/SSOProvider'
import LanguageProvider from '@/providers/LanguageProvider'
import { UserProvider } from '@/@core/contexts/userContext'
import { TranslationProvider } from '@/@core/contexts/translationContext'
export default function TenantProviders({ children }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return loading state or empty component during server rendering
    return null
  }

  return (
    <QueryProvider>
      <VerticalNavProvider>
        <SettingsProvider>
          <TranslationProvider>

            <AdvancedSettingsProvider>
              <ThemeProviderWrapper>
                <LanguageProvider>
                  <MuiLocalizationProvider>
                    <NextAuthProvider>
                      <AuthWrapper redirectPath='/login'>
                        <UserProvider>
                          <SSOProvider>
                            {children}
                            <Toaster />
                          </SSOProvider>
                        </UserProvider>
                      </AuthWrapper>
                    </NextAuthProvider>
                  </MuiLocalizationProvider>
                </LanguageProvider>
              </ThemeProviderWrapper>
            </AdvancedSettingsProvider>
          </TranslationProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </QueryProvider>
  )
}