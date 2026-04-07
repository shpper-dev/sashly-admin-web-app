"use client";

import { createContext, useContext, useState } from "react";
import { Toast } from "../types";
import { ToastContainer } from "@/components/ToastContainer";

type ToastContextType = {
  showToast: (message: string, type?: Toast["type"]) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export  function ToastProvider({children}: {children: React.ReactNode}) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = (id: number) => {
        // trigger exit animation
        setToasts((prev) => 
        prev.map((toast) => (toast.id === id ? {...toast, leaving: true}: toast))
      );
      setTimeout(()=>{
        setToasts((prev)=> prev.filter((toast) => toast.id !== id));
      }, 300);
    }

    const showToast = (message: string, type: Toast["type"] = "info") =>{
        const id = Date.now();
        setToasts((prev) => [
            ...prev.slice(-3), //keep max 3 toasts
            {id, message, type}
        ]);
        setTimeout(() => {
        removeToast(id);
    }, 3000);
    } 

    return(
        <ToastContext.Provider value={{showToast}}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast}/>
        </ToastContext.Provider>
    )
}

export function useToast(){
    const context = useContext(ToastContext);
    if(!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}