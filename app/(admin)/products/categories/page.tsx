"use client";
import Header from '@/components/Header'
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { TableHeading } from '@/lib/types';
import CategoryDialog from '@/components/products/CategoryDialog';
import { deleteCategory, getCategories } from '@/lib/firebase/product';
import { Category } from '@/lib/models/product.model';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { useToast } from '@/lib/providers/ToastProvider';
import { deleteImage } from '@/lib/utils';
import { categoryHeadings } from '@/constants/headings';
import { EmptyState, ErrorState } from '@/components/states';

export default function Categories() {
  const [loading , setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState(false);
  const [data, setData] = useState<Category[]>([]);
  const {showToast} = useToast();

  const fetchCategories = async () => {
  setLoading(true);
  setFetchError(false);
  try {
    const rows = await getCategories();
    setData(rows);
  } catch (e) {
    console.error("Failed to fetch categories:", e);
    showToast(`Failed to load categories`, "error");
    setFetchError(true);
  } finally {
    setLoading(false);
  }
};

 const handleDelete = async (id: string, photoUrl?: string) => {
  try {
    if (photoUrl) {
      await deleteImage(photoUrl);
    }
    await deleteCategory(id);
    await fetchCategories();
  } catch (e) {
    console.error("Delete failed:", e);
    showToast(`Failed to delete category`, "error");
  }
};

  const renderCellContent = (heading: TableHeading, row: any) => {
  switch (heading.id) {
    case "name":
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.name}</span>
          <span className="text-xs text-slate-500">{row.arabicName}</span>
        </div>
      );

    case "photo":
      return row.photoUrl ? (
        <img
          src={row.photoUrl}
          className="w-10 h-10 object-cover rounded-md"
        />
      ) : (
        <div className="w-10 h-10 rounded-md bg-slate-200 text-[10px] text-center flex items-center justify-center" >No image</div>
      );

    case "searchTerms":
      return (
        <div className="flex flex-wrap gap-1">
          {row.searchTerms?.map((term: string) => (
            <span
              key={term}
              className="px-2 py-1 text-xs rounded-full bg-slate-50 text-slate-700 shadow"
            >
              {term}
            </span>
          ))}
        </div>
      );

    case "createdat":
      return (
        <span>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      );

    case "actions":
      return (
        <div className="flex items-center gap-3">
          <CategoryDialog
            mode="edit"
            category={row}
            onSuccess={fetchCategories}
          >
            <button className="text-slate-500 hover:text-indigo-600">
              <Pencil size={16} />
            </button>
          </CategoryDialog>

          <ConfirmActionDialog
            title="Delete Category"
            description={`Are you sure you want to delete "${row.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => handleDelete(row.id, row.photoUrl)}
            onSuccess={() => {showToast(`Deleted ${row.name}`, "error"); fetchCategories();}}
          >
            <button className="text-red-500 hover:text-red-600 cursor-pointer">
              <Trash2 size={16} />
            </button>
          </ConfirmActionDialog>
        </div>
      );
    default:
        return "-";
  }
};

  useEffect(() => {
  fetchCategories();
}, []);
  return (
    <div className='min-h-screen bg-white'>
        <Header />
        <main className='flex flex-col pt-16 pl-60 min-h-screen'>
            <section className='flex  justify-between items-center px-8 pb-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>Categories</h2>
                <p className='text-sm text-slate-700'>Manage your categories</p>
              </div>

              <CategoryDialog onSuccess={fetchCategories}>
                <button className='flex gap-2 items-center bg-purple-600 px-5 py-2.5 text-white text-sm font-medium rounded-md cursor-pointer'>
                  + Add New Category
                </button>
              </CategoryDialog>
            
            </section>
            
            {/* category table */}
            <section>
              <div className='px-8 pb-6'>
                   {loading ? (
                    <TableSkeleton tableHeadings={categoryHeadings} />
                    ) : fetchError ? (
                     <ErrorState description="Couldn't load categories." onRetry={fetchCategories} />
                   ):(
                    <table className='w-full'>
                        <thead className='bg-slate-100'>
                            <tr>
                                {categoryHeadings.map((heading)=>(
                                    <th key={heading.id} className='px-6 py-4 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg'>{heading.title} </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.length === 0 ? (
                                    <tr>
                                         <td colSpan={categoryHeadings.length} className="p-0">
                                             <EmptyState
                                               title="No categories yet"
                                               description="Add your first category to organize your products."
                                               className="border-0 rounded-none"
                                             />
                                         </td>
                                    </tr>
                                ):(
                                    data.map((row,index)=>(
                                        <tr key={row.id || index} className="hover:bg-slate-50 transition-colors">
                                        {categoryHeadings.map((heading)=>(
                                            <td key={heading.id}
                                            className={`px-6 py-3 text-sm text-slate-700`}>
                                                {renderCellContent(heading, row)}
                                            </td>
                                        ))}
                                        </tr>
                                    ))
                                )}
                        </tbody>
                        <tfoot className='bg-slate-200/50'>
                            <tr>
                                <td colSpan={categoryHeadings.length} className='px-6 py-3 first:rounded-bl-lg last:rounded-br-lg'>
                                    <div className='flex items-center justify-between'>
                                        {/* left : showing text */}
                                        <div className='text-left text-sm text-slate-600'>
                                            showing <b>1</b>-<b>{data.length}</b> of <b>{data.length}</b> categories
                                        </div>
                                        {/* Right: pagination controls */}
                                        <div className='flex items-center gap-2'>
                                            <button>
                                                <ChevronLeft className='h-3 w-3 text-slate-700' />
                                            </button>
                                            <button>
                                                <ChevronRight className='h-3 w-3 text-slate-700'/>
                                            </button>
                                        </div>
                                    </div>
                                    
                                </td>
                            </tr>   
                            </tfoot>
                    </table>
                   )}
                </div>

            </section>
        </main>
    </div>
  )
}   


