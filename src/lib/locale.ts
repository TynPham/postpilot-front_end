'use server'

import { cookies } from 'next/headers'
import { defaultLocale, Locale } from '@/i18n/config'

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE'

export async function getUserLocale() {
  const cookiesStore = await cookies()
  return cookiesStore.get(COOKIE_NAME)?.value || defaultLocale
}

export async function setUserLocale(locale: Locale) {
  const cookiesStore = await cookies()
  cookiesStore.set(COOKIE_NAME, locale)
}
