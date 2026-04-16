"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Paperclip, Send, X, ImageIcon, Loader2 } from "lucide-react";
import { Message } from "@/lib/models/message.model";
import { createMessage, subscribeToMessages } from "@/lib/firebase/message";
import { getCurrentUser } from "@/lib/firebase/admin.auth";
import { uploadImage } from "@/lib/utils";


export default function OrderChat({ orderId }: { orderId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToMessages(orderId, (newMessages) => {
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, [orderId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (imageUrl?: string) => {
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;

    try {
      setText(""); 
      const admin = await getCurrentUser();
      
      await createMessage({
        orderId: orderId,
        text: trimmed || (imageUrl ? "Sent an image" : ""), 
        role: "admin",
        senderId: admin?.uid, 
        photoUrl: imageUrl || null,
        readByAdmin: true,
        readByUser: false,
      });
    } catch (error) {
      console.error("Failed to send:", error);
    }
    textareaRef.current?.focus();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageUpload(file);
  };

  const processImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadImage(file, `orders/${orderId}/chat`);
      await handleSend(url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
            <div className="max-w-[75%]">
              <div className={`rounded-2xl px-4 py-2.5 text-sm text-slate-800 shadow-sm leading-snug ${
                msg.role === "admin" ? "rounded-br-sm bg-cyan-50" : "rounded-bl-sm bg-slate-100"
              }`}>
                {/* Image Display Logic */}
                {msg.photoUrl && (
                  <div className="mb-2">
                    <img 
                      src={msg.photoUrl} 
                      alt="Attachment" 
                      className="rounded-lg w-full h-auto object-cover max-h-60 border border-slate-200"
                    />
                  </div>
                )}
                {msg.text && <p>{msg.text}</p>}
              </div>
              
              <div className="flex items-center justify-end gap-1 mt-1">
                <p className="text-[10px] text-slate-400">
                  {formatTime(new Date(msg.createdAt))}
                </p> 
                {msg.role === "admin" && (
                  <span className="ml-1">
                    {msg.readByUser ? (
                      <CheckCheck className="w-3 h-3 text-cyan-500" />
                    ) : (
                      <Check className="w-3 h-3 text-slate-300" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-slate-100 px-6 py-4 space-y-3 bg-[#FAFAFA]">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={onFileChange}
        />

        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-200 rounded-xl h-10 flex items-center justify-center text-slate-400 text-xs gap-2 w-full hover:border-slate-300 transition-colors cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isUploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
          ) : (
            <><Paperclip className="w-3.5 h-3.5" /> Click to attach images</>
          )}
        </div>

        <div className="flex gap-3 items-start">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 h-12 rounded-xl border border-slate-200 bg-white px-4 py-2.5 resize-none text-xs text-slate-700 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!text.trim() || isUploading}
            className="h-12 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-200 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}