"use client";
import React, { useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager } from '@react-google-maps/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { UserIcon, Phone, Mail, MapPin, Save, Plus, Camera, Loader2 } from 'lucide-react';
import { createDriver } from '@/lib/firebase/driver';
import { DesignatedArea } from '@/lib/models/driver.model';
import Image from 'next/image';
import { uploadImage } from '@/lib/utils';
import { createRoute } from '@/lib/firebase/route';
import { serverTimestamp } from 'firebase/firestore';

const calculateCenter = (paths: { lat: number; lng: number }[]) => {
  if (paths.length === 0) return { lat: 24.7136, lng: 46.6753 };
  const lat = paths.reduce((sum, p) => sum + p.lat, 0) / paths.length;
  const lng = paths.reduce((sum, p) => sum + p.lng, 0) / paths.length;
  return { lat, lng };
};

interface AddDriverDialogProps{
    onSuccess?: ()=>{}
}

export default function AddDriverDialog({onSuccess}:AddDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [areaName, setAreaName] = useState("");
  const [polygon, setPolygon] = useState<{ lat: number; lng: number }[]>([]);
  
  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['drawing']
  });

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onPolygonComplete = (poly: google.maps.Polygon) => {
    const path = poly.getPath();
    const coords = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coords.push({ lat: point.lat(), lng: point.lng() });
    }
    setPolygon(coords);
    poly.setMap(null); 
  };

  const handleSave = async () => {
  if (!name || !phoneNumber) {
    alert("Please provide name & phone");
    return;
  }

  setLoading(true);
  try {
    let profileImageUrl = null;

    // Upload Image
    if (imageFile) {
      const path = `drivers/profile_${phoneNumber.trim()}`;
      profileImageUrl = await uploadImage(imageFile, path);
    }

    // Prepare GeoJSON Route Document
    // GeoJSON coordinates MUST be [lng, lat]
    const geoJsonRoute = {
      type: "Feature",
      properties: {
        areaName: areaName || "Unnamed Area",
        driverId: phoneNumber.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      geometry: {
        type: "Polygon",
        // array of objects coz firebase supports that(later when using geotoolkit , convert back to array of arrays)
        coordinates: polygon.map(p => ({ lng: p.lng, lat: p.lat }))
      }
    };

    // Write to 'routes' collection
    await createRoute(geoJsonRoute);

    // Prepare Driver Object
    const designatedArea: DesignatedArea = {
      areaName: areaName || "Unnamed Area",
      polygon: polygon,
      center: calculateCenter(polygon)
    };

    await createDriver({
      name,
      phoneNumber,
      email,
      profileImageUrl,
      designatedArea
    } as any);

    onSuccess?.();
    setOpen(false);
    resetForm();
  } catch (error) {
    console.error(error);
    alert("Error creating driver and route");
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setEmail("");
    setAreaName("");
    setPolygon([]);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex gap-2 items-center bg-[#7F50F4] px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:bg-[#6B3FD4] transition-all shadow-md">
          <Plus className="h-4 w-4" />
          Add New Driver
        </button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 border-0 overflow-hidden w-[90vw]! max-w-250! h-[85vh]! rounded-3xl shadow-2xl flex flex-col">
        <DialogHeader className="p-6 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-800">Register New Driver</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Form */}
          <div className="w-85 shrink-0 p-6 overflow-y-auto border-r border-slate-100 flex flex-col gap-5">
            
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#7F50F4] transition-all group"
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-slate-300 group-hover:text-[#7F50F4]" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <p className="text-[10px] text-white font-bold">CHANGE</p>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={onImageChange} className="hidden" accept="image/*" />
              <p className="text-[10px] uppercase font-bold text-slate-400">Profile Photo</p>
            </div>

            <FormField label="Full Name">
              <InputWithIcon icon={UserIcon} value={name} onChange={setName} placeholder="Enter name" />
            </FormField>

            <FormField label="Phone Number">
              <InputWithIcon icon={Phone} value={phoneNumber} onChange={setPhoneNumber} placeholder="+966..." />
            </FormField>

            <FormField label="Email Address">
              <InputWithIcon icon={Mail} value={email} onChange={setEmail} placeholder="driver@email.com" />
            </FormField>

            <div className="h-px bg-slate-100 my-2" />

            <FormField label="Area Name">
              <InputWithIcon icon={MapPin} value={areaName} onChange={setAreaName} placeholder="e.g. North Riyadh" />
            </FormField>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Polygon Status</p>
              {polygon.length >= 3 ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {polygon.length} Points Captured
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Draw area on the map (min 3 points)</p>
              )}
            </div>
          </div>

          {/* Right Side: Map */}
          <div className="flex-1 bg-slate-100 relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 24.7136, lng: 46.6753 }}
                zoom={12}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                <DrawingManager
                  onPolygonComplete={onPolygonComplete}
                  options={{
                    drawingControl: true,
                    drawingControlOptions: {
                      position: google.maps.ControlPosition.TOP_CENTER,
                      drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                    },
                    polygonOptions: {
                      fillColor: '#7F50F4',
                      fillOpacity: 0.3,
                      strokeWeight: 2,
                      strokeColor: '#7F50F4',
                      clickable: false,
                      editable: false,
                      zIndex: 1,
                    },
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                <Loader2 className="animate-spin mr-2" /> Loading Maps...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => setOpen(false)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-10 py-2.5 rounded-xl bg-[#7F50F4] hover:bg-[#6B3FD4] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "Processing..." : "Create Driver"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Custom internal components for consistency
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</label>
      {children}
    </div>
  );
}

function InputWithIcon({ icon: Icon, value, onChange, placeholder }: { icon: any, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 gap-3 focus-within:ring-2 focus-within:ring-[#7F50F4] transition">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none placeholder:text-slate-300"
      />
    </div>
  );
}