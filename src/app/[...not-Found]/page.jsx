// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@/views/auth/NotFound'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

const NotFoundPage = () => {
  return (
    <Providers>
      <BlankLayout>
        <NotFound />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
