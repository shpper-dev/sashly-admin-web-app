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

export default function RegularPickupsTable() {
  return (
    <div className="space-y-4 bg-white p-6 border-t border-gray-200">
      <h2 className="text-xl font-bold text-[#101828]">
        Regular Pickups
      </h2>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-6 py-4">Name</th>
              <th className="text-left px-6 py-4">Address</th>
              <th className="text-left px-6 py-4">Pickup Day</th>
              <th className="text-left px-6 py-4">Pickup Time</th>
              <th className="text-left px-6 py-4">Frequency</th>
              <th className="text-left px-6 py-4">Remaining</th>
              <th className="text-left px-6 py-4">
                Next Pickup
              </th>
              <th className="text-left px-6 py-4">SMS</th>
              <th className="text-left px-6 py-4">Cancel</th>
            </tr>
          </thead>

          <tbody>
            {mockPickups.map((pickup) => (
              <tr
                key={pickup.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-semibold">
                  {pickup.name}
                  <div className="text-xs text-gray-500">
                    {pickup.phone}
                  </div>
                </td>

                <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                  {pickup.address}
                </td>

                <td className="px-6 py-4">
                  {pickup.pickupDay}
                </td>

                <td className="px-6 py-4">
                  {pickup.pickupTime}
                </td>

                <td className="px-6 py-4">
                  {pickup.frequency}
                </td>

                <td className="px-6 py-4">
                  {pickup.remaining}
                </td>

                <td className="px-6 py-4">
                  {pickup.nextPickup}
                </td>
                <td className="px-6 py-4">
                  
                </td>

                <td className="px-6 py-4">
                  <button className="px-4 py-1.5 text-xs bg-[#EEF2FF] text-[#7F56D9] rounded-md font-bold shadow">
                    CANCEL
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}