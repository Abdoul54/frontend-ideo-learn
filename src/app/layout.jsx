'use client'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'swiper/css'
import { useEffect, useState } from 'react'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

const RootLayout = ({ children }) => {
  const [language, setLanguage] = useState({
    locale: 'en',
    direction: 'ltr'
  })

  useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('app_settings'))
      if (settings?.language) {
        setLanguage(settings.language)
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }
  }, [])

  return (
    <html id='__next' lang={language?.locale} dir={language?.direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
    </html>
  )
}

export default RootLayout