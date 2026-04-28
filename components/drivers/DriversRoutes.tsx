"use client";

import { Plus, Trash2, Search, MapPin, Edit3, Navigation, Ban, Clock, Save, PenLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager } from "@react-google-maps/api";
import { DesignatedArea } from "@/lib/models/driver.model";
import { updateDriver } from "@/lib/firebase/driver";
import AddShiftDialog from "./AddShiftDialog";
import ConfirmActionDialog from "../ConfirmActionDialog";


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
  // onUpdateArea?: (newArea: DesignatedArea) => void;
  onSuccess?: ()=> void;
}

export default function DriversRoutes({ driverId, currentArea,onSuccess }: DriversRoutesProps) {
  const [slots, setSlots] = useState(initialSlots);
  const [search, setSearch] = useState("");

  // map states
  const [isEditing,    setIsEditing]    = useState(false);
  const [isDrawing,    setIsDrawing]    = useState(false);
  const [areaName,     setAreaName]     = useState("");
  const [tempPolygon,  setTempPolygon]  = useState(currentArea?.polygon || []);
  const [saving,       setSaving]       = useState(false);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const hasArea = !!currentArea;

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

  // Called when user finishes drawing a new polygon
  const onPolygonComplete = (poly: google.maps.Polygon) => {
    const path = poly.getPath();
    const coords: { lat: number; lng: number }[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      coords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
    }
    setTempPolygon(coords);
    // Remove the drawn overlay so our controlled Polygon takes over
    poly.setMap(null);
    setIsDrawing(false);
  };

  const handleSave = async () => {
    if (!hasArea && (!areaName.trim() || tempPolygon.length < 3)) return;
    if (hasArea && !currentArea) return;
    setSaving(true);
    try {
      const center = tempPolygon.length > 0
        ? {
            lat: tempPolygon.reduce((s, p) => s + p.lat, 0) / tempPolygon.length,
            lng: tempPolygon.reduce((s, p) => s + p.lng, 0) / tempPolygon.length,
          }
        : currentArea?.center ?? { lat: 24.7, lng: 46.6 };

      //Update Driver Collection
      await updateDriver(driverId, { "designatedArea": {
        areaName: hasArea ? currentArea!.areaName : areaName.trim(),
        polygon:  tempPolygon,
        center,
      } });

      setIsEditing(false);
      setAreaName("");
      alert(hasArea ? "Route updated successfully!" : "Area added successfully!");
      if(!hasArea) {
        onSuccess?.();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDraw = () => {
    setIsDrawing(false);
    setTempPolygon([]);
    setAreaName("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempPolygon(currentArea?.polygon || []);
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
          <AddShiftDialog >
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
          </AddShiftDialog>
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
              <ConfirmActionDialog onConfirm={async () => removeSlot(slot.id)}  title={"Delete Shift"} description={`Are you sure you want to delete this shift of ${driverId}`} confirmLabel={"Delete"}>
              <button
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
              </button>
              </ConfirmActionDialog>
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
          <div className="col-span-2 relative rounded-xl overflow-hidden border border-slate-200 h-100 bg-slate-100 shadow-inner">
           {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={currentArea?.center || { lat: 24.7, lng: 46.6 }}
            zoom={13}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            {/* Drawing manager — only active when adding a new area */}
            {isDrawing && (
              <DrawingManager
                drawingMode={google.maps.drawing.OverlayType.POLYGON}
                onPolygonComplete={onPolygonComplete}
                options={{
                  drawingControl: false,
                  polygonOptions: {
                    fillColor:    "#02D0FF",
                    fillOpacity:  0.25,
                    strokeColor:  "#02D0FF",
                    strokeWeight: 2,
                    editable:     true,
                  },
                }}
              />
            )}

            {/* Show polygon when not in drawing mode and coords exist */}
            {!isDrawing && tempPolygon.length > 0 && (
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
                  fillColor:    isEditing ? "#EAB308" : "#7F50F4",
                  fillOpacity:  0.3,
                  strokeColor:  isEditing ? "#CA8A04" : "#7F50F4",
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        )}

            {/* Drawing mode hint banner */}
            {isDrawing && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#02D0FF] text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-2 uppercase tracking-widest pointer-events-none whitespace-nowrap">
                <PenLine className="w-3 h-3 shrink-0" /> Click on the map to draw the area boundary
              </div>
            )}

            {hasArea && !isDrawing && (
              <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md border border-slate-100 flex items-center gap-2 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                Active Zone: {currentArea!.areaName}
              </div>
            )}
          </div>

          {/* SIDE PANEL */}
          <div className="flex flex-col gap-3 h-100">
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
                {hasArea ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{currentArea!.areaName}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Unassigned</p>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              {/* Area name input — only shown when adding a new area after drawing */}
              {!hasArea && tempPolygon.length > 0 && !isDrawing && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Area Name</label>
                  <input
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="e.g. Al Barsha"
                    className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">

                {/* ── Has area: Edit / Save / Cancel ── */}
                {hasArea && !isDrawing && (
                  <>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center w-full justify-center gap-2 px-4 py-2 bg-purple-100 rounded-lg text-purple-600 text-sm font-bold hover:bg-purple-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Route
                      </button>
                    ) : (
                      <div  className="flex items-center gap-2 w-full justify-center">
                        <button 
                          onClick={handleSave}
                          disabled={saving}
                          className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                        </button>
                        {!saving && (
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── No area: Add Route / Cancel Drawing / Save Area + Redraw ── */}
                {!hasArea && (
                  <>
                    {!isDrawing && tempPolygon.length === 0 && (
                      <button
                        onClick={() => setIsDrawing(true)}
                        className="flex items-center w-full justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        <PenLine className="w-4 h-4" /> Add Route
                      </button>
                    )}

                    {isDrawing && (
                      <button
                        onClick={handleCancelDraw}
                        className="flex items-center w-full justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-lg text-sm font-bold"
                      >
                        Cancel Drawing
                      </button>
                    )}

                    {!isDrawing && tempPolygon.length > 0 && (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={handleSave}
                          disabled={saving || !areaName.trim()}
                          className="flex flex-1 items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Area"}
                        </button>
                        <button
                          onClick={handleCancelDraw}
                          className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                        >
                          Redraw
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      

    </div>
  );
}