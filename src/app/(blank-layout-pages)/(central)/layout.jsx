'use client'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

const Layout = ({ children }) => {
  return (
    <Providers>
      <BlankLayout systemMode='light'>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
