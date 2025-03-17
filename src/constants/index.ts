import path from '@/constants/path'
import { CalendarCheck, CreditCard, FileText, Settings2 } from 'lucide-react'
import { FaFacebook, FaInstagram, FaReddit, FaUserPlus } from 'react-icons/fa'

export const SIDE_BAR = {
  navMain: [
    {
      title: 'schedules',
      url: path.schedules,
      icon: CalendarCheck
    },
    {
      title: 'posts',
      url: path.posts,
      icon: FileText,
      isActive: true,
      items: [
        {
          title: 'Facebook',
          url: path.posts_facebook,
          icon: FaFacebook
        },
        {
          title: 'Instagram',
          url: path.posts_instagram,
          icon: FaInstagram
        },
        {
          title: 'Reddit',
          url: path.posts_reddit,
          icon: FaReddit
        }
      ]
    },
    {
      title: 'connect',
      url: path.connect,
      icon: FaUserPlus
    },
    {
      title: 'settings',
      url: path.settings,
      icon: Settings2
    },
    {
      title: 'subscription',
      url: path.subscription,
      icon: CreditCard
    }
  ]
}

export const PLATFORM_COLORS = {
  FACEBOOK: '--facebook',
  THREADS: '--threads',
  INSTAGRAM: '--instagram',
  REDDIT: '--reddit',
  TWITTER: '--twitter'
}
export const PLATFORM_TYPE = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  REDDIT: 'reddit',
  THREADS: 'threads',
  TWITTER: 'twitter'
} as const

export const DEFAULT_NUMBER_OF_SKELETON = 3
