"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { Message } from "../models/message.model";
import { subscribeToUnreadMessages } from "../firebase/message";

// notificationcontext type
interface ChatNotificationContextType{
    unreadMessages: Message[];
    unreadCount: number;
}

// context
export const ChatNotificationContext = createContext<ChatNotificationContextType | null>(null);

// provider
export function ChatNotificationProvider(
    {children} : {
        children : React.ReactNode
    }
){
    const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);

    useEffect(()=>{
        console.log("subscribed To Unread Msgs");

        const unsubscribe = subscribeToUnreadMessages((msgs)=>{
            console.log("unread updates: ", msgs.length);

            // keep latest msg by order
            const latestByOrder = Object.values(
                msgs.reduce((acc,msg)=>{
                    if(!acc[msg.orderId]){
                        acc[msg.orderId]= msg;
                    }
                    return acc;
                },{} as Record<string, Message>)
            );
            setUnreadMessages(latestByOrder);
        });

        return ()=>{
            console.log("Unsubscribed to notifications");
            unsubscribe();
        }
    },[]);

    const value = useMemo(()=>({
        unreadMessages,
        unreadCount: unreadMessages.length
    }),[unreadMessages])

    return (
        <ChatNotificationContext.Provider value={value}>
            {children}
        </ChatNotificationContext.Provider>
    )

}