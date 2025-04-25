'use client'

import { MetadataProvider } from '@/@core/contexts/metaDataContext'
import { TranslationProvider } from '@/@core/contexts/translationContext'
// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

const Layout = ({ children }) => {
  return (
    <Providers>
      {/* <TranslationProvider>
        <MetadataProvider> */}
          <BlankLayout systemMode='light'>{children}</BlankLayout>
        {/* </MetadataProvider>
      </TranslationProvider> */}
    </Providers>
  )
}

export default Layout
