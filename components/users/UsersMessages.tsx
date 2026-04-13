"use client"

import {
  Bell,
  Camera,
  Check,
  FileText,
  Mail,
  MessageSquare,
  Paperclip,
  Send,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

// Types 
type Channel = "SMS" | "Email" | "Push" | "Internal Note"

interface Message {
  id: number
  text: string
  channel: Channel
  timestamp: Date
}

// Channel config 
const CHANNELS: { label: Channel; icon: React.ReactNode }[] = [
  { label: "SMS",           icon: <MessageSquare size={14} /> },
  { label: "Email",         icon: <Mail          size={14} /> },
  { label: "Push",          icon: <Bell          size={14} /> },
  { label: "Internal Note", icon: <FileText      size={14} /> },
]

const CHANNEL_COLORS: Record<Channel, string> = {
  SMS:             "bg-green-500",
  Email:           "bg-cyan-500",
  Push:            "bg-[#7F50F4]",
  "Internal Note": "bg-amber-500",
}

// Seed messages 
const SEED_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Pickup Order Created (4750)",
    channel: "Email",
    timestamp: new Date("2026-02-21T16:33:00"),
  },
  {
    id: 2,
    text: "Driver on the way for Pickup (4750)",
    channel: "Push",
    timestamp: new Date("2026-02-21T16:34:00"),
  },
]

// Helpers 
function formatTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Component 
export default function UsersMessages() {
  const [channel, setChannel]       = useState<Channel>("Push")
  const [messages, setMessages]     = useState<Message[]>(SEED_MESSAGES)
  const [text, setText]             = useState("")
  const [showNotifs, setShowNotifs] = useState(true)
  const bottomRef                   = useRef<HTMLDivElement>(null)
  const textareaRef                 = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send 
  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        channel,
        timestamp: new Date(),
      },
    ])
    setText("")
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      
        {/* Show Notifications toggle */}
        <div className="flex justify-end items-center gap-3 bg-slate-50 py-2 px-3 border border-slate-200/30">
          <span className="text-xs text-slate-700 font-medium">Show Notifications</span>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
              showNotifs ? "bg-cyan-500" : "bg-slate-200"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${
                showNotifs ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">


        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-end gap-3 justify-end">
            {/* Channel badge */}
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full text-white font-bold uppercase tracking-wide shrink-0 ${
                CHANNEL_COLORS[msg.channel]
              }`}
            >
              {msg.channel}
            </span>

            {/* Bubble */}
            <div className="max-w-sm">
              <div className="bg-slate-100 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-slate-800 shadow-sm leading-snug">
                {msg.text}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ── */}
      <div className="border-t border-slate-100 px-6 py-4 space-y-3 bg-[#FAFAFA]">

        {/* Attachment row */}
        <div className="flex items-center gap-3">
          <button className="flex gap-2 items-center text-xs bg-white px-5 h-10 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm">
            <Camera className="h-3.5 w-3.5" />
            Use Camera
          </button>
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-10 flex items-center justify-center text-slate-400 text-xs gap-2 w-full hover:border-slate-300 transition-colors cursor-pointer">
            <Paperclip className="w-3.5 h-3.5" />
            Click or drag & drop to attach images
          </div>
        </div>

        {/* Send row */}
        <div className="flex gap-3 items-start">

          {/* shadcn DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 px-4 rounded-xl border-2 border-cyan-400 text-slate-700 flex items-center gap-2 text-xs font-bold hover:border-cyan-500 transition-colors bg-white shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${CHANNEL_COLORS[channel]}`}
                />
                {channel}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-52 rounded-2xl shadow-xl p-1.5 border border-slate-100"
            >
              {CHANNELS.map(({ label, icon }) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => setChannel(label)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-colors ${
                    channel === label
                      ? "bg-purple-50 text-[#7F50F4]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={channel === label ? "text-[#7F50F4]" : "text-slate-400"}>
                      {icon}
                    </span>
                    {label}
                  </div>
                  {channel === label && (
                    <Check className="w-3.5 h-3.5 text-[#7F50F4]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="flex-1 h-15 rounded-xl border border-slate-200 bg-white px-4 py-2.5 resize-none text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="h-15 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}