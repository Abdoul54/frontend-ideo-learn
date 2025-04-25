'use client'
// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'

// Util Imports
// import { getDemoName, getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'
import { NextAuthProvider } from '@/providers/NextAuthProviders'
import { QueryProvider } from '@/providers/QueryProvider'
import ThemeProviderWrapper from '@/providers/ThemeProviderWrapper'
import { MuiLocalizationProvider } from '@/providers/MuiLocalizationProvider'
import { Toaster } from 'react-hot-toast'
import AuthWrapper from '@/providers/AuthWrapper'
import LanguageProvider from '@/providers/LanguageProvider'

const Providers = props => {
  // Props
  const { children } = props


  return (
    <NextAuthProvider>
      <AuthWrapper redirectPath='/auth/login'>
        <QueryProvider>
          <VerticalNavProvider>
            <SettingsProvider>
              <ThemeProviderWrapper>
                <LanguageProvider>
                  <MuiLocalizationProvider>
                    {children}
                    <Toaster />
                  </MuiLocalizationProvider>
                </LanguageProvider>
              </ThemeProviderWrapper>
            </SettingsProvider>
          </VerticalNavProvider>
        </QueryProvider>
      </AuthWrapper>
    </NextAuthProvider>
  )
}

export default Providers
