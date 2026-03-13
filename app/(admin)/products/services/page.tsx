"use client";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import { TableHeading } from "@/lib/types";
import ServiceDialog from "@/components/products/ServiceDialog";
import { deleteService, getServices } from "@/lib/firebase/product";
import { Service } from "@/lib/models/product.model";

const serviceHeadings: TableHeading[] = [
  { id: "name", title: "NAME" },
  { id: "description", title: "DESCRIPTION" },
  { id: "price", title: "PRICE" },
  { id: "searchTerms", title: "SEARCH TERMS" },
  { id: "actions", title: "ACTIONS" },
];

export default function Services() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Service[]>([]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const rows = await getServices();
      setData(rows);
    } catch (e) {
      console.error("Failed to fetch services:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;

    try {
      await deleteService(id);
      fetchServices();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const renderCellContent = (heading: TableHeading, row: Service) => {
    switch (heading.id) {
      case "name":
        return (
          <div className="flex flex-col">
            <span className="font-medium">{row.name}</span>
            <span className="text-xs text-slate-500">{row.arabicName}</span>
          </div>
        );

      case "description":
        return (
          <div className="flex flex-col">
            <span className="text-sm">{row.description || "-"}</span>
            <span className="text-xs text-slate-500">{row.arabicDescription}</span>
          </div>
        );

      case "price":
        return <span className="font-medium">SAR {row.price}</span>;

      case "searchTerms":
        return (
          <div className="flex flex-wrap gap-1">
            {row.searchTerms?.map((term) => (
              <span
                key={term}
                className="px-2 py-1 text-xs rounded-full bg-slate-50 text-slate-700 shadow"
              >
                {term}
              </span>
            ))}
          </div>
        );

      // case "createdAt":
      //   return (
      //     <span>{new Date(row.createdAt).toLocaleDateString()}</span>
      //   );

      case "actions":
        return (
          <div className="flex items-center gap-3">
            <ServiceDialog
              mode="edit"
              service={row}
              onSuccess={fetchServices}
            >
              <button className="text-slate-500 hover:text-indigo-600">
                <Pencil size={16} />
              </button>
            </ServiceDialog>

            <button
              onClick={() => handleDelete(row.id)}
              className="text-red-500 hover:text-red-600 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );

      default:
        return "-";
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex flex-col pt-16 pl-60 min-h-screen">
        <section className="flex justify-between items-center px-8 pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Services</h2>
            <p className="text-sm text-slate-700">Manage your services</p>
          </div>

          <ServiceDialog onSuccess={fetchServices}>
            <button className="flex gap-2 items-center bg-purple-600 px-5 py-2.5 text-white text-sm font-medium rounded-md cursor-pointer">
              + Add New Service
            </button>
          </ServiceDialog>
        </section>

        <section>
          <div className="px-8 pb-6">
            {loading ? (
              <TableSkeleton tableHeadings={serviceHeadings} />
            ) : (
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    {serviceHeadings.map((heading) => (
                      <th
                        key={heading.id}
                        className="px-6 py-4 text-left text-sm font-bold text-slate-500 first:rounded-tl-lg last:rounded-tr-lg"
                      >
                        {heading.title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-slate-200">
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={serviceHeadings.length}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        No services available
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {serviceHeadings.map((heading) => (
                          <td
                            key={heading.id}
                            className="px-6 py-3 text-sm text-slate-700"
                          >
                            {renderCellContent(heading, row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot className="bg-slate-200/50">
                  <tr>
                    <td
                      colSpan={serviceHeadings.length}
                      className="px-6 py-3 first:rounded-bl-lg last:rounded-br-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left text-sm text-slate-600">
                          showing <b>1</b>-<b>{data.length}</b> of{" "}
                          <b>{data.length}</b> services
                        </div>

                        <div className="flex items-center gap-2">
                          <button>
                            <ChevronLeft className="h-3 w-3 text-slate-700" />
                          </button>
                          <button>
                            <ChevronRight className="h-3 w-3 text-slate-700" />
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
  );
}
