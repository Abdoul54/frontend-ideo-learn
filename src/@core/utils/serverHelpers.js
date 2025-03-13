import 'server-only'

// Next Imports
import { cookies, headers } from 'next/headers'

// Config Imports
import settingConfig from '@/configs/settingConfig'
import demoConfigs from '@configs/demoConfigs'

export const getDemoName = () => {
  const headersList = headers()

  return headersList.get('X-server-header')
}

export const getSettingsFromCookie = () => {
  const cookieStore = cookies()
  const demoName = getDemoName()

  const cookieName = settingConfig.settingsCookieName

  return JSON.parse(cookieStore.get(cookieName)?.value || '{}')
}

export const getMode = () => {
  const settingsCookie = getSettingsFromCookie()
  const demoName = getDemoName()

  // Get mode from cookie or fallback to theme config
  const _mode = settingsCookie.mode || (demoName && demoConfigs[demoName].mode) || settingConfig.mode

  return _mode
}

export const getSystemMode = () => {
  const cookieStore = cookies()
  const mode = getMode()
  const colorPrefCookie = cookieStore.get('colorPref')?.value || 'light'

  return (mode === 'system' ? colorPrefCookie : mode) || 'light'
}

export const getServerMode = () => {
  const mode = getMode()
  const systemMode = getSystemMode()

  return mode === 'system' ? systemMode : mode
}

export const getSkin = () => {
  const settingsCookie = getSettingsFromCookie()

  return settingsCookie.skin || 'default'
}

export const getLanguage = () => {
  const settingsCookie = getSettingsFromCookie()

  return settingsCookie.language || settingConfig.language
}

