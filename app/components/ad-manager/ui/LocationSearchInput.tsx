"use client";

import React from "react";
// --- REMOVED APIPROVIDER FROM THIS IMPORT ---
import { Map, Marker } from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface Location {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

interface LocationSearchInputProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ locations = [], setLocations }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
  });

  const addLocation = (address: string, lat: number, lng: number) => {
    const newLocation: Location = { id: new Date().toISOString(), address, lat, lng };
    if (!locations.some(loc => loc.address === address)) {
      setLocations([...locations, newLocation]);
    }
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      addLocation(address, lat, lng);
    } catch (error) {
      console.error("Error selecting location:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="max-h-24 overflow-y-auto space-y-2 rounded-md border p-2">
        {locations.length > 0 ? (
          locations.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm">
              <span className="flex-1 truncate min-w-0 pr-2" title={loc.address}>
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
        <Input
          type="text"
          placeholder="Search for a location in India..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className="pr-10"
        />
        {status === 'OK' && (
          <ul className="absolute z-[1001] w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
            {data.map(({ place_id, description }) => (
              <li key={place_id} className="px-4 py-2 cursor-pointer hover:bg-slate-100" onClick={() => handleSelect(description)}>
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-[250px] w-full rounded-lg overflow-hidden relative">
        {/* --- THE APIPROVIDER WRAPPER IS REMOVED FROM HERE --- */}
        <Map
          defaultCenter={{ lat: 11.0168, lng: 76.9558 }}
          defaultZoom={10}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="your-map-id"
        >
          {locations.map((loc) => (
            <Marker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} />
          ))}
        </Map>
      </div>
    </div>
  );
};