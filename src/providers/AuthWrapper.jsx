'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { PUBLIC_TENANT_PAGES } from '@/utils/middleware/routes'
import { hasTenantAuthParams } from '@/utils/middleware/auth'

export default function AuthWrapper({ children, redirectPath = '/login' }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const isPublicTenantPage = (path) =>
    PUBLIC_TENANT_PAGES.some(p => path.startsWith(p))
  const isPublicPage = isPublicTenantPage(pathname)

  useEffect(() => {
    const isExpired = session?.error === 'SessionExpired' || !session?.user

    if (isPublicPage) {
      return
    }

    if ((status === 'unauthenticated' && isExpired) && hasTenantAuthParams(new URLSearchParams(window.location.search))) {
      return
    }

    if (status === 'authenticated' && isExpired) {

      console.warn('Session expired or invalid. Logging out...')
      signOut({ redirect: false }).then(() => {
        router.push(redirectPath)
      })
    }

    if (status === 'unauthenticated') {
      router.push(redirectPath)
    }
  }, [session, status, router, redirectPath])

  return <>{children}</>
}
