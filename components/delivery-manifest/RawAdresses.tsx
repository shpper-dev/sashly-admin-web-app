"use client";

type AddressRoute = {
  id: string;
  title: string;
  address: string;
  lat?: number;
  lng?: number;
};

const mockAddresses: AddressRoute[] = [
  {
    id: "1",
    title: "ROUTE #1",
    address: "سكن طالبات جامعة الملك سعود مبنى 40",
    lat: 24.6365866,
    lng: 46.6622003,
  },
  {
    id: "2",
    title: "ROUTE #2",
    address: "24.7969374, 46.855553",
  },
  {
    id: "3",
    title: "ROUTE #3",
    address: "24.7969374, 46.855553",
  },
];

export default function RawAddresses() {
  return (
    <div className="space-y-4 bg-white p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-[#101828]">
        Raw Addresses
      </h2>

      <div className="grid grid-cols-3 gap-6">
        {mockAddresses.map((route) => (
          <div
            key={route.id}
            className="bg-slate-50 border border-gray-00 rounded-2xl p-5 shadow-sm"
          >
            <div className="text-xs font-bold text-gray-900 underline mb-3 tracking-wide">
              {route.title}
            </div>

            <div className="text-sm text-gray-700 leading-relaxed">
              {route.address}
            </div>

            {route.lat && route.lng && (
              <div className="text-xs text-gray-400 mt-3">
                {route.lat}, {route.lng}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}