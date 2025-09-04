"use client";

import React from "react";
import dynamic from "next/dynamic";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CampaignFormData, Location } from "../AdManager";

const LocationSearchInput = dynamic(
  () => import("../ui/LocationSearchInput").then((mod) => mod.LocationSearchInput),
  { ssr: false, loading: () => <p>Loading map...</p> }
);

interface TargetAudienceStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const TargetAudienceStep: React.FC<TargetAudienceStepProps> = ({ formData, setFormData }) => {
  const handleAudienceChange = (field: keyof CampaignFormData["targetAudience"], value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: { ...prev.targetAudience, [field]: value },
    }));
  };
  
  const setLocations = (locations: Location[]) => {
     setFormData((prev) => ({
      ...prev,
      targetAudience: { ...prev.targetAudience, locations: locations },
    }));
  };

  const handleSliderChange = (value: number[]) => {
    handleAudienceChange("locationRange", value[0]);
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="space-y-8 animate-in fade-in-50 duration-300">
        <div className="space-y-2">
          <Label className="font-semibold">Gender</Label>
          <Select
            onValueChange={(value) => handleAudienceChange("gender", value)}
            value={formData.targetAudience.gender}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Gender" />
            </SelectTrigger> {/* --- THIS LINE IS NOW FIXED --- */}
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Age Range</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="Min age"
              value={formData.targetAudience.minAge}
              onChange={(e) => handleAudienceChange("minAge", e.target.value)}
              min="13"
              max="100"
            />
            <Input
              type="number"
              placeholder="Max age"
              value={formData.targetAudience.maxAge}
              onChange={(e) => handleAudienceChange("maxAge", e.target.value)}
              min="13"
              max="100"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="font-semibold">Location</Label>
          <LocationSearchInput locations={formData.targetAudience.locations} setLocations={setLocations} />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <Label className="font-semibold">Location Range</Label>
            <span className="text-sm font-medium text-gray-700">
              KM | {formData.targetAudience.locationRange}
            </span>
          </div>
          <Slider
            value={[formData.targetAudience.locationRange]}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
          />
        </div>
      </div>
    </APIProvider>
  );
};

export default TargetAudienceStep;