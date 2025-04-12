/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { PostType } from '@/constants/post'
import { useAppContext } from '@/contexts/app-context'
import { useUploadImagesMutation } from '@/queries/media'
import { useCreatePostMutation } from '@/queries/post'
import { PostSchema } from '@/schema-validations/post'
import moment from 'moment'

import { Credential } from '@/types/credentials'
import { ImagePreview } from '@/types/media'
import { CreatePostRequest } from '@/types/post'
import { handleErrorApi } from '@/lib/utils'
import { usePostForm } from '@/hooks/use-post-form'
import { useRecurringSchedule } from '@/hooks/use-recurring-schedule'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'

import { CredentialsPanel } from './components/credentials-panel'
import { FormPanel } from './components/form-panel'
import { PreviewPanel } from './components/preview-panel'
import ImageSlider from './image-slider'

export interface CreatePostModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  credentials: Credential[]
  time: {
    start: Date
    end: Date
  }
}

export default function CreatePostModal({ open, setOpen, credentials, time }: CreatePostModalProps) {
  const { post } = useAppContext()
  const [showImageSlider, setShowImageSlider] = useState(false)
  const form = usePostForm(post, time)
  const recurringSchedule = useRecurringSchedule()
  const [preview, setPreview] = useState({
    description: '',
    time: moment(time.start).format('HH:mm'),
    images: [] as ImagePreview[]
  })

  const createPostMutation = useCreatePostMutation()
  const uploadImagesMutation = useUploadImagesMutation()

  // Effect handlers
  useEffect(() => {
    if (post) {
      form.setValue('scheduledDate', new Date(post.publicationTime))
      form.setValue('scheduledTime', moment(post?.publicationTime).format('HH:mm'))
      form.setValue('description', post?.metadata.content || '')
      form.setValue(
        'images',
        post?.metadata.assets.map((asset) => ({
          file: new File([asset.url], asset.url),
          preview: asset.url
        })) || []
      )
      form.setValue('type', post?.metadata.type || PostType.POST)
      form.setValue('selectedPages', [post.socialCredentialID])
    }
  }, [post])

  useEffect(() => {
    form.setValue('scheduledTime', moment(time.start).format('HH:mm'))
    form.setValue('scheduledDate', time.start)
  }, [time])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'images' && value.images) {
        const newPreviews = value.images.map((image) => ({
          file: image?.file,
          preview: image?.preview
        }))
        setPreview((prev) => ({ ...prev, images: newPreviews.filter(Boolean) as ImagePreview[] }))
      } else {
        setPreview((prev) => ({
          ...prev,
          description: value.description || '',
          time: value.scheduledTime || moment().format('HH:mm')
        }))
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleScheduleAll = (checked: boolean) => {
    form.setValue('scheduleAll', checked)
    if (checked) {
      form.setValue(
        'selectedPages',
        credentials.map((credential) => credential.id)
      )
    } else {
      form.setValue('selectedPages', [])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentImages = form.getValues('images') || []
    const newImages = [...currentImages, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]
    form.setValue('images', newImages)
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images')
    currentImages?.splice(index, 1)
    form.setValue('images', currentImages || [])
  }

  const onSubmit = async (data: PostSchema) => {
    if (createPostMutation.isPending || uploadImagesMutation.isPending) return
    if (form.getValues('selectedPages')?.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one page',
        variant: 'destructive'
      })
      return
    }
    if (moment(data.scheduledTime, 'HH:mm').isBefore(moment()) && moment(data.scheduledDate).isSame(moment(), 'day')) {
      form.setError('scheduledTime', {
        message: 'You cannot schedule posts in the past'
      })
      return
    }

    try {
      const scheduledDate = moment(data.scheduledDate).format('YYYY-MM-DD')
      const files = data.images?.map((image) => image.file)
      const uploadImagesResponse = await uploadImagesMutation.mutateAsync(files as File[])

      const body: CreatePostRequest = {
        publicationTime: moment(`${scheduledDate} ${data.scheduledTime}`).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        socialPosts: credentials
          .filter((credential) => data?.selectedPages?.includes(credential.id))
          .map((credential) => ({
            platform: credential.platform,
            socialCredentialID: credential.id,
            metadata: {
              type: credential.platform === 'facebook' ? data.type : 'post',
              content: data.description,
              assets:
                uploadImagesResponse.data.data.map((image) => ({
                  type: image.type,
                  url: image.url
                })) || []
            }
          }))
      }

      await createPostMutation.mutateAsync(body)
      setOpen(false)
      form.reset()
      setPreview({
        description: '',
        time: moment(time.start).format('HH:mm'),
        images: []
      })
      toast({
        title: 'Success',
        description: 'Post scheduled successfully'
      })
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          form.reset()
          setPreview({
            description: '',
            time: moment(time.start).format('HH:mm'),
            images: []
          })
          recurringSchedule.setIsRecurring(false)
        }
        setOpen(open)
      }}
    >
      <DialogContent className='max-w-[95vw] xl:max-w-screen-xl max-h-[90vh] overflow-y-auto p-0 gap-0'>
        <DialogHeader className='p-6 pb-0'>
          <DialogTitle>Schedule Post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col lg:flex-row'>
            <CredentialsPanel form={form} credentials={credentials} onScheduleAll={handleScheduleAll} />
            <FormPanel form={form} recurringSchedule={recurringSchedule} onImageUpload={handleImageUpload} />
            <PreviewPanel
              preview={preview}
              credentials={credentials}
              post={post}
              isSubmitting={createPostMutation.isPending || uploadImagesMutation.isPending}
              onRemoveImage={removeImage}
              onClose={() => setOpen(false)}
              onShowSlider={() => setShowImageSlider(true)}
            />
          </form>
        </Form>
      </DialogContent>
      <ImageSlider
        showImageSlider={showImageSlider}
        setShowImageSlider={setShowImageSlider}
        preview={{ images: preview.images.map((img) => ({ preview: img.preview })) }}
      />
    </Dialog>
  )
}
