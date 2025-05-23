'use client'
// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'

// Util Imports
import { NextAuthProvider } from '@/providers/NextAuthProviders'
import { QueryProvider } from '@/providers/QueryProvider'
import ThemeProviderWrapper from '@/providers/ThemeProviderWrapper'
import { MuiLocalizationProvider } from '@/providers/MuiLocalizationProvider'
import { Toaster } from 'react-hot-toast'
import AuthWrapper from '@/providers/AuthWrapper'
import LanguageProvider from '@/providers/LanguageProvider'
import { TranslationProvider } from '@/@core/contexts/translationContext'
import { UserProvider } from '@/@core/contexts/userContext'

const Providers = props => {
  // Props
  const { children } = props


  return (
    <NextAuthProvider>
      <AuthWrapper redirectPath='/auth/login'>
        <QueryProvider>
          <VerticalNavProvider>
            <SettingsProvider>
              <UserProvider>
                <LanguageProvider>
                  <TranslationProvider>
                    <ThemeProviderWrapper>
                      <MuiLocalizationProvider>
                        {children}
                        <Toaster />
                      </MuiLocalizationProvider>
                    </ThemeProviderWrapper>
                  </TranslationProvider>
                </LanguageProvider>
              </UserProvider>
            </SettingsProvider>
          </VerticalNavProvider>
        </QueryProvider>
      </AuthWrapper>
    </NextAuthProvider>
  )
}

export default Providers
