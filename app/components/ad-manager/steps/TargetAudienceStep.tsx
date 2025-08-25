"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CampaignFormData } from "../AdManager"; // Import the main form data type

interface TargetAudienceStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const TargetAudienceStep: React.FC<TargetAudienceStepProps> = ({ formData, setFormData }) => {
  const handleAudienceChange = (field: keyof CampaignFormData["targetAudience"], value: string | number) => {
    setFormData((prev: CampaignFormData) => ({
      ...prev,
      targetAudience: { ...prev.targetAudience, [field]: value },
    }));
  };

  const handleSliderChange = (value: number[]) => {
    handleAudienceChange("locationRange", value[0]);
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      handleAudienceChange("locationRange", 0);
      return;
    }
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      handleAudienceChange("locationRange", numericValue);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <Label className="font-semibold">Gender</Label>
        <Select
          onValueChange={(value) => handleAudienceChange("gender", value)}
          value={formData.targetAudience.gender}
        >
          <SelectTrigger><SelectValue placeholder="Select a Gender" /></SelectTrigger>
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
          <Input type="number" placeholder="Min age" value={formData.targetAudience.minAge} onChange={(e) => handleAudienceChange("minAge", e.target.value)} min="13" max="100" />
          <Input type="number" placeholder="Max age" value={formData.targetAudience.maxAge} onChange={(e) => handleAudienceChange("maxAge", e.target.value)} min="13" max="100" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-semibold">Venue</Label>
        <Select onValueChange={(value) => handleAudienceChange("venue", value)} value={formData.targetAudience.venue}>
          <SelectTrigger><SelectValue placeholder="Select a venue" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="main-store">Main Store (Chennai)</SelectItem>
            <SelectItem value="online-store">Online Store</SelectItem>
            <SelectItem value="anna-nagar-branch">Anna Nagar Branch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="location-range-input" className="font-semibold">Location Range</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">KM</span>
            <Input id="location-range-input" type="number" className="w-20 h-9 text-center" value={formData.targetAudience.locationRange} onChange={handleLocationInputChange} min="0" max="100" />
          </div>
        </div>
        <Slider value={[formData.targetAudience.locationRange]} max={100} step={1} onValueChange={handleSliderChange} aria-label="Location Range Slider" />
      </div>
    </div>
  );
};

export default TargetAudienceStep;