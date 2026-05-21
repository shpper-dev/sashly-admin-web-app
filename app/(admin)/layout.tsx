import SideBar from '@/components/SideBar'
import { ChatNotificationProvider } from '@/lib/providers/ChatNotificationProvider'
import { ToastProvider } from '@/lib/providers/ToastProvider'
import React from 'react'

export default function layout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <div>
        <ChatNotificationProvider>
          <SideBar />
          <ToastProvider>
             {children}
          </ToastProvider>
        </ChatNotificationProvider>
    </div>
  )
}
