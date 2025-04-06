import authApis from '@/apis/auth.api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: (token: string) => authApis.login(token)
  })
}

export const useAuthLogout = () => {
  return useMutation({
    mutationFn: () => authApis.logout()
  })
}

export const useGetTelegramStatus = () => {
  return useQuery({
    queryKey: ['telegram-status'],
    queryFn: () => authApis.getTelegramStatus()
  })
}
