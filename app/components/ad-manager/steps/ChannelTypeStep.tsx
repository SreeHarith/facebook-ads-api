"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CampaignFormData } from "../AdManager"; // Import the main form data type

interface ChannelTypeStepProps {
  formData: CampaignFormData;
  // Use the specific CampaignFormData type instead of 'any'
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const ChannelTypeStep: React.FC<ChannelTypeStepProps> = ({ formData, setFormData }) => {
  const handleChannelChange = (channel: "facebook" | "instagram", checked: boolean) => {
    const { facebook, instagram } = formData.channel;

    if (!checked && ((channel === "facebook" && !instagram) || (channel === "instagram" && !facebook))) {
      return;
    }

    // Use the specific type for the 'prev' state
    setFormData((prev: CampaignFormData) => ({
      ...prev,
      channel: { ...prev.channel, [channel]: checked },
    }));
  };

  const handleTypeChange = (value: "image" | "video") => {
    if (value) {
      // Use the specific type for the 'prev' state
      setFormData((prev: CampaignFormData) => ({
        ...prev,
        type: value,
      }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800">Channel</h3>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="facebook"
              checked={formData.channel.facebook}
              onCheckedChange={(checked) => handleChannelChange("facebook", !!checked)}
            />
            <Label htmlFor="facebook" className="text-sm font-medium">
              Facebook
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="instagram"
              checked={formData.channel.instagram}
              onCheckedChange={(checked) => handleChannelChange("instagram", !!checked)}
            />
            <Label htmlFor="instagram" className="text-sm font-medium">
              Instagram
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-800">Type</h3>
        <RadioGroup
          value={formData.type}
          onValueChange={handleTypeChange}
          className="flex flex-col space-y-3"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image" className="text-sm font-medium">
              Image
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="video" id="video" />
            <Label htmlFor="video" className="text-sm font-medium">
              Video
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default ChannelTypeStep;