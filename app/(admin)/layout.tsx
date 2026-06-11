import SideBar from '@/components/SideBar'
import { ChatNotificationProvider } from '@/lib/providers/ChatNotificationProvider'
import { AdminNotificationProvider } from '@/lib/providers/NotificationProvider'
import { ToastProvider } from '@/lib/providers/ToastProvider'
import React from 'react'

export default function layout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <div>
        <ToastProvider>
         <AdminNotificationProvider>
           <ChatNotificationProvider>
             <SideBar />
             {children}
           </ChatNotificationProvider>
         </AdminNotificationProvider>
       </ToastProvider>
    </div>
  )
}
