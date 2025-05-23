// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@/views/auth/NotFound'

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
