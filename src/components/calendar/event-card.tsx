/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import '@radix-ui/react-avatar'

interface Props {
  event: any
}

export default function EventCard({ event }: Props) {
  return (
    <div className='flex justify-between items-center size-full'>
      <div className='px-1'>
        <span className='block mb-1 !line-clamp-1'>{event.socialCredential.metadata.name}</span>
        <span className='capitalize font-bold'>{event.platform}</span>
      </div>
      <Avatar className='size-8 border-2 border-primary/10'>
        <AvatarImage src={event.socialCredential.metadata.avatar_url || ''} />
        <AvatarFallback className='text-black'>{event.socialCredential.metadata.name.charAt(0) || 'A'}</AvatarFallback>
      </Avatar>
    </div>
  )
}
