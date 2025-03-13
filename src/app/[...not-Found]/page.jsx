// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@/views/auth/NotFound'

// Util Imports
import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'
import NotFound404 from '@/components/illustrations/NotFound'

const NotFoundPage = () => {
  // Vars
  const direction = 'ltr'
  const mode = getServerMode()
  const systemMode = getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <NotFound />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
