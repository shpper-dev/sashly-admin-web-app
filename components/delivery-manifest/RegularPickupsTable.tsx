"use client";

type RegularPickup = {
  id: string;
  name: string;
  phone: string;
  address: string;
  pickupDay: string;
  pickupTime: string;
  frequency: string;
  remaining: number;
  nextPickup: string;
};

const mockPickups: RegularPickup[] = [
  {
    id: "1",
    name: "حسام ريشه",
    phone: "0545716807",
    address: "الرياض حي الرمال شارع أبي عبدالله السلمي",
    pickupDay: "Wednesday",
    pickupTime: "8am-10am",
    frequency: "Every Week",
    remaining: 0,
    nextPickup: "01/01/25",
  },
];

const columns: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "pickupDay", label: "Pickup Day" },
  { key: "pickupTime", label: "Pickup Time" },
  { key: "frequency", label: "Frequency" },
  { key: "remaining", label: "Remaining" },
  { key: "nextPickup", label: "Next Pickup" },
  { key: "sms", label: "SMS" },
  { key: "cancel", label: "Cancel" },
];

function renderCellContent(col: string, pickup: RegularPickup) {
  switch (col) {
    case "name":
      return (
        <>
          <span className="font-semibold">{pickup.name}</span>
          <div className="text-xs text-gray-500">{pickup.phone}</div>
        </>
      );
    case "address":
      return <span className="text-xs text-gray-600">{pickup.address}</span>;
    case "sms":
      return null;
    case "cancel":
      return (
        <button className="px-4 py-1.5 text-xs bg-[#EEF2FF] text-[#7F56D9] rounded-md font-bold shadow">
          CANCEL
        </button>
      );
    default:
      return <span>{String(pickup[col as keyof RegularPickup] ?? "")}</span>;
  }
}

export default function RegularPickupsTable() {
  return (
    <div className="space-y-4 bg-white p-6 border-t border-gray-200">
      <h2 className="text-xl font-bold text-[#101828]">Regular Pickups</h2>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left px-6 py-4">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mockPickups.map((pickup) => (
              <tr
                key={pickup.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4${col.key === "address" ? " max-w-xs" : ""}`}
                  >
                    {renderCellContent(col.key, pickup)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}