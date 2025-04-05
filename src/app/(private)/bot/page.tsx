'use client'

import { useEffect } from 'react'
import configs from '@/configs'
import axios from 'axios'
import { BellRing, MessageSquare, Users } from 'lucide-react'
import { FaTelegram } from 'react-icons/fa'
import TelegramLoginButton, { TelegramUser } from 'telegram-login-button'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const BOT_NAME = configs.telegramBotName

export default function ConnectPage() {
  const handleTelegramResponse = async (response: TelegramUser) => {
    console.log(response)
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Connect Platforms</h1>
        <Button variant='outline'>
          <Users className='mr-2 size-4' />
          Manage Connections
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <Card className=' hover:border-blue-600 transition-colors cursor-pointer h-full'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center'>
                <FaTelegram className='mr-2 size-7 text-blue-500' />
                Telegram
              </CardTitle>
              <span className='px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500'>Connected</span>
            </div>
            <CardDescription>Receive notifications via Telegram bot</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm '>
              Connect your Telegram account to receive instant notifications about your scheduled posts.
            </p>
          </CardContent>
          <CardFooter>
            <TelegramLoginButton
              dataOnauth={handleTelegramResponse}
              botName={BOT_NAME}
              dataAuthUrl='https://postpilot-front-end.vercel.app'
              className='w-64 h-12 flex items-center justify-center rounded-md text-lg font-semibold focus:outline-none'
            />
          </CardFooter>
        </Card>

        <Card className=' hover:border-purple-600 transition-colors cursor-pointer'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center'>
                <MessageSquare className='mr-2 size-5 text-purple-500' />
                Discord
              </CardTitle>
              <span className='px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400'>Not Connected</span>
            </div>
            <CardDescription>Receive notifications via Discord</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm '>
              Connect your Discord server to receive notifications and manage your posts through Discord.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant='default' className='w-full'>
              Connect
            </Button>
          </CardFooter>
        </Card>

        <Card className=' hover:border-orange-600 transition-colors cursor-pointer'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center'>
                <BellRing className='mr-2 size-5 text-orange-500' />
                Slack
              </CardTitle>
              <span className='px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400'>Not Connected</span>
            </div>
            <CardDescription>Receive notifications via Slack</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm '>
              Connect your Slack workspace to receive notifications and collaborate with your team.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant='default' className='w-full'>
              Connect
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
