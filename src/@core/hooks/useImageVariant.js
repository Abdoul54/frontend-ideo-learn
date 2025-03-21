// React Imports
import { useMemo } from 'react'

// Third-party imports
import { useColorScheme } from '@mui/material'
import { useSettings } from '../contexts/settingsContext'

// Hook Imports

export const useImageVariant = (mode, imgLight, imgDark, imgLightBordered, imgDarkBordered) => {
  // Hooks
  const { settings } = useSettings()
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()

  return useMemo(() => {
    const isServer = typeof window === 'undefined'

    const currentMode = (() => {
      if (isServer) return mode

      return muiMode === 'system' ? muiSystemMode : muiMode
    })()

    const isBordered = settings?.skin === 'bordered'
    const isDarkMode = currentMode === 'dark'

    if (isBordered && imgLightBordered && imgDarkBordered) {
      return isDarkMode ? imgDarkBordered : imgLightBordered
    }

    return isDarkMode ? imgDark : imgLight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, muiMode, muiSystemMode])
}
