import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface ProductCardProps {
    product: {
        image: string;
        name_en: string;
        name_ar: string;
        category: string;
        price: number;
    }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    // main container
    <div className='flex flex-col bg-white rounded-lg py-2 px-5 border border-slate-300 shadow-md max-w-70'>
        {/* product imgae +  action buttons */}
        <div className='flex items-start justify-between pt-2'>
             <Image src={product.image} alt={product.name_en}     width={60} height={60} />
        <div className='flex gap-2'>
            <button>
                <Pencil className='h-4 w-4 text-slate-700' />
            </button>
            <button className=''>
                <Trash2 className='h-4 w-4 text-red-600' />
            </button>
        </div>
        </div>
        {/* product  name in english and arabic */}
        <div className='flex flex-col px-2 mb-2'>
            <span className='text-xs font-bold text-slate-800'>{product.name_en}</span>
            <span className='text-xs text-slate-400'>{product.name_ar}</span>
        </div>
        <div className='h-px w-full bg-slate-300'></div>
        <div className='flex justify-between p-2 '>
            <span className='text-slate-400 text-xs font-medium tracking-wide'>{product.category}</span>
            <span className='text-sm text-purple-600 font-bold'>SAR {product.price.toFixed(2)}</span>
        </div>
    </div>
  )
}
