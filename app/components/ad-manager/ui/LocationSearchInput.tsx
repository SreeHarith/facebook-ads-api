"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, MapPin } from "lucide-react";

// Fix for default Leaflet icon issue
// @ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export interface Location {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchInputProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) { onMapClick(e.latlng); },
  });
  return null;
};

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ locations = [], setLocations }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isDroppingPin, setIsDroppingPin] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.length > 2) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&countrycodes=in`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }
  };

  const addLocation = (address: string, lat: number, lng: number) => {
    const newLocation: Location = { id: new Date().toISOString(), address, lat, lng };
    setLocations([...locations, newLocation]);
  };

  const handleSelect = (result: NominatimResult) => {
    addLocation(result.display_name, parseFloat(result.lat), parseFloat(result.lon));
    setSearchTerm("");
    setResults([]);
  };

  const handleMapClick = async (latlng: L.LatLng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await response.json();
      if (data.display_name) {
        addLocation(data.display_name, latlng.lat, latlng.lng);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
    setIsDroppingPin(false);
  };
  
  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="max-h-24 overflow-y-auto space-y-2 rounded-md border p-2">
        {locations.length > 0 ? (
          locations.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm">
              {/* --- THIS IS THE FIX --- */}
              {/* Adding 'min-w-0' allows the text to truncate correctly inside the flex container */}
              <span
  className="truncate min-w-0 w-0 flex-1 pr-2 overflow-hidden whitespace-nowrap"
  title={loc.address} // Shows full value on hover!
>
  {loc.address}
</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeLocation(loc.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">No locations selected.</p>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleSearch}>Go</Button>
        </div>
        {results.length > 0 && (
          <ul className="absolute z-[1001] w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
            {results.map((result) => (
              <li key={result.place_id} className="px-4 py-2 cursor-pointer hover:bg-slate-100" onClick={() => handleSelect(result)}>
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-[250px] w-full rounded-lg overflow-hidden relative">
        <MapContainer center={[11.0168, 76.9558]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locations.map(loc => <Marker key={loc.id} position={[loc.lat, loc.lng]} />)}
          {isDroppingPin && <MapClickHandler onMapClick={handleMapClick} />}
        </MapContainer>
        <Button 
          onClick={() => setIsDroppingPin(true)} 
          className="absolute bottom-2 right-2 z-[1000] bg-white text-black hover:bg-slate-100 shadow-md"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Drop Pin
        </Button>
      </div>
    </div>
  );
};

