import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { NextIntlClientProvider } from 'next-intl'
import NextTopLoader from 'nextjs-toploader'

import './globals.css'

import { cookies } from 'next/headers'
import { TokenType } from '@/constants/token'
import AppProvider from '@/providers/app-provider'
import ReactQueryClientProvider from '@/providers/query-client-provider'
import { SocketProvider } from '@/providers/socket-provider'
import { getMessages } from 'next-intl/server'

import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Post pilot',
  description: 'Post pilot - AI powered social media post generator'
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'vi' }]
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let accessToken = undefined
  let isSyncAuthenticated = false

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(TokenType.ACCESS_TOKEN)?.value
  if (cookieToken) {
    accessToken = cookieToken
    isSyncAuthenticated = true
  } else {
    try {
      const { getToken } = await auth()
      const asyncToken = await getToken({ template: 'post-pilot' })
      accessToken = asyncToken
    } catch (error) {
      console.log(error)
    }
  }

  const messages = await getMessages()

  return (
    <ClerkProvider>
      <html suppressHydrationWarning>
        <body className={`${inter.className} antialiased overflow-x-hidden`}>
          <ThemeProvider attribute='class' defaultTheme='system'>
            <ReactQueryClientProvider>
              <SocketProvider>
                <AppProvider accessToken={accessToken} isSyncAuthenticated={isSyncAuthenticated}>
                  <NextIntlClientProvider messages={messages}>
                    <NextTopLoader />
                    {children}
                  </NextIntlClientProvider>
                  <Toaster />
                </AppProvider>
              </SocketProvider>
            </ReactQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
