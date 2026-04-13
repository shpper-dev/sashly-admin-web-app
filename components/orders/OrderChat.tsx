"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon, BellOff, Check, CheckCheck, Paperclip, Send } from "lucide-react";
import { Message } from "@/lib/models/message.model";
import { createMessage, subscribeToMessages } from "@/lib/firebase/message";
import { getCurrentUser } from "@/lib/firebase/admin.auth";


export default function OrderChat({ orderId }: { orderId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [showNotifs, setShowNotifs] = useState<boolean>(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
   
  useEffect(()=>{
    
  })
  //Real-time sync
  useEffect(() => {
    // subscribe and pass our setMessages state as the callback
    const unsubscribe = subscribeToMessages(orderId, (newMessages) => {
      setMessages(newMessages);
    });

    // Clean up the connection when the user leaves the page
    return () => unsubscribe();
  }, [orderId]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //Sending to Database
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setText(""); 
      const admin = await getCurrentUser();
      await createMessage({
        orderId: orderId,
        text: trimmed,
        role: "admin",
        senderId: admin?.uid, 
        readByAdmin: true,
        readByUser: false,
      });
    } catch (error) {
      console.error("Failed to send:", error);
    }
    
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* <div className="flex justify-end items-center gap-3 bg-slate-50 py-2 px-3 border border-slate-200/30">
          <span className="text-xs text-slate-700 font-medium">Show Notifications</span>
          <button
             onClick={() => setShowNotifs((v) => !v)}
             className="text-[#02d0ff]"
           >
             {showNotifs ? (
               <><BellIcon className="h-4 w-4 " /></>
             ): (
               <><BellOff className="h-4 w-4" /></>
             )}
           </button>
        </div> */}
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 min-h-40">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === "admin" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-sm">
              <div className={`rounded-2xl px-4 py-2.5 text-sm text-slate-800 shadow-sm leading-snug ${
                msg.role === "admin" ? "rounded-br-sm bg-cyan-50" : "rounded-bl-sm bg-slate-100"
              }`}>
                {msg.text}
              </div>
              
              <div className="flex items-center justify-end gap-1 mt-1">
                <p className="text-[10px] text-slate-400">
                  {formatTime(new Date(msg.createdAt))}
                </p>            

                {/* read reciepts*/}
                {msg.role === "admin" && (
                  <span className="ml-1">
                    {msg.readByUser ? (
                      <CheckCheck className="w-3 h-3 text-cyan-500" /> /* Blue double check */
                    ) : (
                      <Check className="w-3 h-3 text-slate-300" /> /* Single gray check */
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ── */}
      <div className="border-t border-slate-100 px-6 rounded-xl py-4 space-y-3 bg-[#FAFAFA] ">

        {/* Attachment row */}
        {/* <div className="flex items-center gap-3">
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-10 flex items-center justify-center text-slate-400 text-xs gap-2 w-full hover:border-slate-300 transition-colors cursor-pointer">
            <Paperclip className="w-3.5 h-3.5" />
            Click or drag & drop to attach images
          </div>
        </div> */}

        {/* Send row */}
        <div className="flex gap-3 items-start">
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

// helpers
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
