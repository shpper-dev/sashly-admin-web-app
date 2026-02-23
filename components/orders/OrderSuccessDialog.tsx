
import React, { Dispatch, SetStateAction } from 'react'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'

interface OrderSuccessDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export default function OrderSuccessDialog({
  open,
  onOpenChange,
}: OrderSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className='hidden'>Order Successfully Created</DialogTitle>
        <DialogContent className='max-w-95! rounded-xl py-10 px-8 text-center flex flex-col items-center gap-4'>
            <div className='px-1.5 py-1 bg-green-100 rounded-lg shadow-md'>
                <svg width="45" height="45" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M44.2363 14.7445L18.9586 40.0222L7.37305 28.4366L10.3432 25.4665L18.9586 34.0609L41.2661 11.7744L44.2363 14.7445Z" fill="#009600"/>
            </svg>
            </div>
            <h2 className='text-2xl font-bold text-slate-900'>Order Created Successfully</h2>
            <p className='text-slate-500 text-xs uppercase font-medium'>Record ID#2617 Has been securely indexed into the database</p>
            <button
              onClick={() => onOpenChange(false)}
              className='px-4 py-3 w-full bg-purple-500 text-white rounded-md text-xs font-medium hover:bg-purple-600 focus:bg-purple-600 transition-colors cursor-pointer'
            >
              DONE
            </button>
        </DialogContent>
    </Dialog>
  )
}
