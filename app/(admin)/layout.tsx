import SideBar from '@/components/SideBar'
import React from 'react'

export default function layout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <div>
        <SideBar />
        {children}
    </div>
  )
}
