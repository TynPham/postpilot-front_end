'use client'

import { Fragment, use, useEffect, useState } from 'react'
import Link from 'next/link'
import postApi from '@/apis/posts.api'
import { PLATFORM_TYPE } from '@/constants'
import { FADE_IN_ANIMATION, FADE_IN_STAGGER_ANIMATION, fadeInChildVariants } from '@/constants/effects'
import { POST_STATUS, PostStatus, PostType } from '@/constants/post'
import { useAppContext } from '@/contexts/app-context'
import { useDeletePostMutation } from '@/queries/post'
import { format } from 'date-fns'
import { Clock, Loader2, MoreVertical, Trash2 } from 'lucide-react'

import { Post } from '@/types/post'
import { SuccessResponse } from '@/types/utils'
import { handleErrorApi } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ElementEffect from '@/components/effects/element-effect'
import ElementEffectStagger from '@/components/effects/element-effect-stagger'

import CreatePostModal from '../../schedules/create-post-modal'
import EmptyPost from './empty-post'

export function PostList({
  status,
  postsPromise,
  platform,
  accessToken
}: {
  status: PostStatus
  postsPromise: Promise<SuccessResponse<Post[]>>
  platform: (typeof PLATFORM_TYPE)[keyof typeof PLATFORM_TYPE]
  accessToken: string
}) {
  const postResolve = use(postsPromise)

  const [posts, setPosts] = useState<SuccessResponse<Post[]>>(
    postResolve ?? {
      data: [],
      message: 'Success'
    }
  )

  const scheduledPosts = posts?.data.filter((post) => post.status === status)

  const deletePostMutation = useDeletePostMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDeletePost = async (postId: string) => {
    if (deletePostMutation.isPending) return
    try {
      await deletePostMutation.mutateAsync(postId)
      toast({
        title: 'Success',
        description: 'Delete Post Successfully!'
      })
      setIsModalOpen(false)
      const updatedPosts = await postApi.getPostsServer(accessToken, { platform })
      setPosts(updatedPosts.data)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  // Group posts by date
  const groupedPosts = scheduledPosts?.reduce(
    (groups, post) => {
      const date = format(post.publicationTime, 'yyyy-MM-dd')

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push({
        ...post
      })
      return groups
    },
    {} as Record<string, Post[]>
  )

  const { openCreateScheduleModal, setOpenCreateScheduleModal } = useAppContext()

  return (
    <div className='space-y-8'>
      {groupedPosts &&
        Object.entries(groupedPosts).map(([date, datePosts]) => (
          <ElementEffect key={date} animationProps={FADE_IN_ANIMATION}>
            <div className='space-y-4'>
              <h2 className='text-2xl font-semibold sticky top-0 bg-background/95 backdrop-blur py-2 z-10 w-max'>
                {format(new Date(date), 'EEEE, MMMM d yyyy')}
              </h2>
              <ScrollArea className='rounded-md border'>
                <Table className='overflow-hidden relative table-fixed'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[250px] whitespace-nowrap'>Post</TableHead>
                      <TableHead className='w-[100px] whitespace-nowrap'>Type</TableHead>
                      <TableHead className='w-[200px] whitespace-nowrap'>Author</TableHead>
                      <TableHead className='w-[150px] whitespace-nowrap'>Scheduled Time</TableHead>
                      <TableHead className='w-[100px] text-right whitespace-nowrap'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <ElementEffectStagger
                    ElementType={TableBody}
                    ElementChildrenType={TableRow}
                    animationProps={FADE_IN_STAGGER_ANIMATION}
                    childVariants={fadeInChildVariants}
                  >
                    {datePosts.map((post) => (
                      <Fragment key={post.id}>
                        <TableCell>
                          <div>
                            <h3 className='font-medium'>{post?.metadata?.page_name}</h3>
                            <p className='text-sm text-muted-foreground line-clamp-1'>{post?.metadata?.content}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.metadata.type === PostType.POST
                                ? 'default'
                                : post.metadata.type === PostType.STORY
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className='capitalize'
                          >
                            {post.metadata.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            <Avatar className='size-8'>
                              <AvatarImage src={post?.socialCredential.metadata.avatar_url} />
                              <AvatarFallback>{post?.socialCredential.metadata.name.charAt(0) ?? 'A'}</AvatarFallback>
                            </Avatar>
                            <span className='text-sm font-medium'>{post?.socialCredential.metadata.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2 text-sm'>
                            <Clock className='size-4 text-muted-foreground' />
                            <span>{format(post?.publicationTime ?? '', 'h:mm a')}</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className='size-8 p-0'>
                                <span className='sr-only'>Open menu</span>
                                <MoreVertical className='size-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Link href={`/posts/${post.platform}/${post.id}`}>View details</Link>
                              </DropdownMenuItem>
                              {post.status === POST_STATUS.SCHEDULED && (
                                <>
                                  <DropdownMenuItem>
                                    <Link href={`/schedules`}>Edit post</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem asChild>
                                    <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                      <AlertDialogTrigger asChild>
                                        {/* To make a button looks like dropdown menu item */}
                                        <Button
                                          size='sm'
                                          variant='ghost'
                                          className='w-full flex items-center justify-start gap-2 px-2 py-1.5 text-sm text-red-500 hover:text-red-500'
                                        >
                                          <Trash2 className='size-4' />
                                          Delete
                                        </Button>
                                        {/* Show Dialog */}
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account and
                                            remove your data from our servers.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            disabled={deletePostMutation.isPending}
                                            className={buttonVariants({ variant: 'destructive' })}
                                            onClick={(e) => {
                                              e.preventDefault()
                                              handleDeletePost(post.id)
                                            }}
                                          >
                                            Continue
                                            {deletePostMutation.isPending && (
                                              <Loader2 className='size-4 animate-spin ml-2' />
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </Fragment>
                    ))}
                  </ElementEffectStagger>
                </Table>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
          </ElementEffect>
        ))}
      {groupedPosts && Object.keys(groupedPosts).length === 0 && (
        <div className='text-center py-12'>
          <EmptyPost />
        </div>
      )}
    </div>
  )
}
