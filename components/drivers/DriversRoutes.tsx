"use client";

import { Plus, Trash2, Search, MapPin, Edit3, Navigation, Ban, Clock, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Polygon } from "@react-google-maps/api";
import { DesignatedArea } from "@/lib/models/driver.model";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { updateDriver } from "@/lib/firebase/driver";
import { updateRouteCoordinates } from "@/lib/firebase/route";

interface Slot {
  id: string;
  name: string;
  time: string;
}

const initialSlots: Slot[] = [
  { id: "1", name: "Daily Morning Shift", time: "08:00 AM - 12:00 PM" },
  { id: "2", name: "Evening Peak Shift",  time: "05:00 PM - 09:00 PM" },
];

interface DriversRoutesProps {
  driverId: string;
  currentArea?: DesignatedArea | null;
  onUpdateArea?: (newArea: DesignatedArea) => void;
}

export default function DriversRoutes({ driverId, currentArea, onUpdateArea }: DriversRoutesProps) {
  const [slots, setSlots] = useState(initialSlots);
  const [search, setSearch] = useState("");

  // map states
  const [isEditing, setIsEditing] = useState(false);
  const [tempPolygon, setTempPolygon] = useState(currentArea?.polygon || []);
  const [saving, setSaving] = useState(false);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  // Sync temp state if the parent prop changes
  useEffect(() => {
    if (currentArea) setTempPolygon(currentArea.polygon);
  }, [currentArea]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["drawing"],
  });

  const removeSlot = (id: string) => setSlots((prev) => prev.filter((s) => s.id !== id));

  // Capture changes when user drags polygon points
  const onEdit = (poly: google.maps.Polygon) => {
  if (!poly) return;
  const path = poly.getPath();
  const newCoords = [];
  for (let i = 0; i < path.getLength(); i++) {
    newCoords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
  }
  setTempPolygon(newCoords);
};

  const handleSave = async () => {
    if (!currentArea) return;
    setSaving(true);
    try {
      // 1. Update Driver Collection
      await updateDriver(driverId, { "designatedArea": {
        ...currentArea,
        polygon: tempPolygon,

      } })

      // 2. Update Routes Collection (Using the Object format to avoid nested array error)
      await updateRouteCoordinates(currentArea.areaName,{
        "geometry.coordinates": tempPolygon.map(p => ({ lng: p.lng, lat: p.lat }))
      });

      setIsEditing(false);
      alert("Route updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 overflow-y-auto h-full bg-white">

      {/*TIME SLOT MANAGEMENT */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Time Slot Management
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage driver availability and operational shifts.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Clock className="text-orange-500 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{slot.name}</p>
                  <p className="text-xs text-slate-400">{slot.time}</p>
                </div>
              </div>
              <button
                onClick={() => removeSlot(slot.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/*  DESIGNATED AREA COVERAGE  */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Designated Service Area
        </p>

        <div className="grid grid-cols-3 gap-5">
          {/* MAP */}
          <div className="col-span-2 relative rounded-xl overflow-hidden border border-slate-200 h-72 bg-slate-100 shadow-inner">
           {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={currentArea?.center || { lat: 24.7, lng: 46.6 }}
            zoom={13}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <Polygon
              paths={tempPolygon}
              editable={isEditing}
              draggable={isEditing}
              // 1. Capture the instance
              onLoad={(poly) => (polygonRef.current = poly)} 
              // 2. Pass the reference to  handler
              onMouseUp={() => isEditing && onEdit(polygonRef.current!)}
              onDragEnd={() => isEditing && onEdit(polygonRef.current!)}
              options={{
                fillColor: isEditing ? "#EAB308" : "#7F50F4",
                fillOpacity: 0.3,
                strokeColor: isEditing ? "#CA8A04" : "#7F50F4",
                strokeWeight: 2,
              }}
            />
          </GoogleMap>
        )}
            {currentArea && (
              <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md border border-slate-100 flex items-center gap-2 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                Active Zone: {currentArea.areaName}
              </div>
            )}
          </div>

          {/* SIDE PANEL */}
          <div className="flex flex-col gap-3">
            {/* <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search districts..."
                className="bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400 w-full"
              />
            </div> */}

            <div className="flex flex-col border border-slate-100 rounded-xl p-4 gap-4 bg-white shadow-sm flex-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Assigned Route
                </p>
                {currentArea ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{currentArea.areaName}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Unassigned</p>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center w-full gap-2 px-4 py-2 bg-purple-100 rounded-lg text-purple-600 text-sm font-bold"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Route
                  </button>
                ) : (
                  <div  className="flex items-center gap-2 w-full justify-center">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
                    >
                      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                    </button>
                    {!saving && (
                      <button 
                      onClick={() => { setIsEditing(false); setTempPolygon(currentArea?.polygon || []); }}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold"
                    >
                      Cancel
                    </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      

    </div>
  );
}