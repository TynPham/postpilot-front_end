import { PostType } from '@/constants/post'
import { postSchema, PostSchema } from '@/schema-validations/post'
import { zodResolver } from '@hookform/resolvers/zod'
import moment from 'moment'
import { useForm } from 'react-hook-form'

import { Post } from '@/types/post'

export const usePostForm = (post: Post | undefined, time: { start: Date; end: Date }) => {
  const form = useForm<PostSchema>({
    defaultValues: {
      type: post?.metadata.type || PostType.POST,
      description: post?.metadata.content || '',
      scheduleAll: false,
      scheduledDate: post?.publicationTime ? new Date(post.publicationTime) : time.start,
      scheduledTime: post?.publicationTime
        ? moment(post.publicationTime).format('HH:mm')
        : moment(time.start).format('HH:mm'),
      images:
        post?.metadata.assets.map((asset) => ({
          file: new File([asset.url], asset.url),
          preview: asset.url
        })) || [],
      selectedPages: []
    },
    resolver: zodResolver(postSchema)
  })

  return form
}
