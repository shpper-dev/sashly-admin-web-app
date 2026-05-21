import { ChatNotificationContext } from "@/lib/providers/ChatNotificationProvider";
import { useContext } from "react";

export function useChatNotifications(){
    const context = useContext(ChatNotificationContext);

    if(!context){
        throw new Error("useChatNotications must be used inside ChatNotificationProvider")
    }

    return context;
}