'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import path from '@/constants/path'
import { useAuthContext } from '@/contexts/app-context'
import { useAuthLogin } from '@/queries/auth'
import { setAccessTokenToLocalStorage } from '@/utils/local-storage'

import LoadingIndicator from '@/components/loading-indicator'

export default function Home() {
  const { accessToken, isSyncAuthenticated, setIsSyncAuthenticated } = useAuthContext()
  const { mutateAsync: login } = useAuthLogin()
  const router = useRouter()

  useEffect(() => {
    if (isSyncAuthenticated && accessToken) {
      return router.push(path.dashboard)
    }
    if (!isSyncAuthenticated && accessToken) {
      const getTokenAsync = async () => {
        const data = await login(accessToken)
        if (data && data.token) {
          setAccessTokenToLocalStorage(data.token)
          setIsSyncAuthenticated(true)
          return router.push(path.dashboard)
        }
      }
      getTokenAsync()
    }

    return router.push(path.login)
  }, [login, router, accessToken, isSyncAuthenticated, setIsSyncAuthenticated])

  return <LoadingIndicator />
}
