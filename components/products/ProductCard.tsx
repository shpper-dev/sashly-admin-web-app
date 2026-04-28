import { Item } from '@/lib/models/product.model'
import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import  { useState } from 'react';
import { deleteItem } from '@/lib/firebase/product'
import ConfirmActionDialog from '../ConfirmActionDialog';
import ItemDialog from './ItemDialog';
import { deleteImage } from '@/lib/utils';


interface ProductCardProps {
  product: Item
  onDeleted?: () => void
  onUpdated?: () => void
}

export default function ProductCard({ product, onDeleted, onUpdated }: ProductCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      try{
        if(product.photoUrl){
        await deleteImage(product.photoUrl)
      }
      }catch(imgErr){
        throw new Error("Failed to delete image")
      }
  
      await deleteItem(product.id);
    } catch (e) {
      console.error('Delete failed:', e)
      throw new Error("Item Deletion failed")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='flex flex-col bg-white rounded-lg py-2 px-5 border border-slate-300 shadow-md'>

      {/* Image + action buttons */}
      <div className='flex items-start justify-between pt-2'>
        {product.photoUrl ? (
          <Image src={product.photoUrl} alt={product.name} width={60} height={60} className='rounded-lg object-cover' />
        ) : (
          <div className='w-16 h-16 bg-slate-50 flex items-center justify-center rounded-lg'>
            <span className='text-[9px] text-slate-400 text-center leading-tight px-1'>No Image</span>
          </div>
        )}

        <div className='flex gap-2'>
          {/* Edit */}
          <ItemDialog item={product} onSuccess={onUpdated} mode="edit">
            <button className='p-1 rounded hover:bg-slate-100 transition-colors'>
              <Pencil className='h-4 w-4 text-slate-700' />
            </button>
          </ItemDialog>

          {/* Delete */}
          <ConfirmActionDialog
            title="Delete Item"
            description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => handleDelete()}
            onSuccess={onDeleted}
          >
            <button className="text-red-500 hover:text-red-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
          </ConfirmActionDialog>
        </div>
      </div>

      {/* Names */}
      <div className='flex flex-col px-2 mb-2 mt-1'>
        <span className='text-xs font-bold text-slate-800'>{product.name}</span>
        <span className='text-xs text-slate-400'>{product.arabicName}</span>
      </div>

      <div className='h-px w-full bg-slate-300' />

      {/* Services */}
      <div className='flex flex-col gap-1 pt-2 pb-1'>
        {product.services.map((service) => (
          <div className='flex justify-between' key={service.id}>
            <span className='text-slate-400 text-xs font-medium tracking-wide'>{service.name}</span>
            <span className='text-sm text-purple-600 font-bold'>SAR {service.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}