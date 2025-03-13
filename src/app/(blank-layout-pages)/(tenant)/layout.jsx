'use client'

// Component Imports
import TenantProviders from '@/components/TenantProviders'
import BlankLayout from '@layouts/BlankLayout'

const Layout = ({ children }) => {
  return (
    <TenantProviders>
      <BlankLayout systemMode='light'>{children}</BlankLayout>
    </TenantProviders>
  )
}

export default Layout
