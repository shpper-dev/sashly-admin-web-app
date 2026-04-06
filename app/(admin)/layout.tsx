import SideBar from '@/components/SideBar'
import { ToastProvider } from '@/lib/providers/ToastProvider'
import React from 'react'

export default function layout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <div>
        <SideBar />
        <ToastProvider>
          {children}
        </ToastProvider>
    </div>
  )
}
