
import MetricsSidebar from '@/components/metrics/MetricsSideBar';
import { ChatNotificationProvider } from '@/lib/providers/ChatNotificationProvider';
import { AdminNotificationProvider } from '@/lib/providers/NotificationProvider';
import { ToastProvider } from '@/lib/providers/ToastProvider';
import React from 'react';

export default function layout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <div>
       <ToastProvider>
        <AdminNotificationProvider>
          <ChatNotificationProvider>
            <MetricsSidebar />
            {children}
          </ChatNotificationProvider>
        </AdminNotificationProvider>
       </ToastProvider>
    </div>
  )
}
