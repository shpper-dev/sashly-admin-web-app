"use client";
import Header from '@/components/Header'
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import {useState} from "react";

export default function Orders() {
    const [loading, setLoading] = useState<boolean>(false);
  return (
    <div className='min-h-screen bg-slate-50'>
        <Header title="Orders" />
        <main className='flex flex-col pt-12 pl-60 min-h-screen gap-3'>
            <section>
                <div>
                    <div>
                        <h2>Manage Orders</h2>
                        <p>Reviewing 1248 active operational requests from all regions</p>
                    </div>
                    <button className='bg-white px-2 py-3'>Filter</button>
                    <button className='bg-purple-600 px-2 py-3'>Export Report</button>
                </div>
                <div>
                    {loading ? (
                        <></>
                    ):(
                        <></>
                    )}
                </div>
            </section>
        </main>
    </div>
  )
}
