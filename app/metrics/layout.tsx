
import MetricsSidebar from '@/components/metrics/MetricsSideBar';
import { ChatNotificationProvider } from '@/lib/providers/ChatNotificationProvider';
import React from 'react';

export default function layout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <div>
        <ChatNotificationProvider>
          <MetricsSidebar />
           {children}
        </ChatNotificationProvider>
    </div>
  )
}
