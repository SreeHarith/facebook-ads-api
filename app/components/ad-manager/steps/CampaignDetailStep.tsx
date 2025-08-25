"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import ImageUploader from "../ui/ImageUploader";
import CustomRadioCard from "../ui/CustomRadioCard";
import { CampaignFormData } from "../AdManager"; // Import the main form data type

interface CampaignDetailStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const goals = [
  { id: "goal-coupon", value: "coupon", title: "Offer a coupon", description: "Drive sales and expand your customer base with special discounts." },
  { id: "goal-update", value: "update", title: "Send a Quick Update", description: "Share business updates, new products, or sale announcements." },
  { id: "goal-event", value: "event", title: "Send an event invitation", description: "Notify customers of special events, pop-ups, and more." },
];

const CampaignDetailStep: React.FC<CampaignDetailStepProps> = ({ formData, setFormData }) => {
  const handleDetailChange = (field: keyof CampaignFormData["campaignDetail"], value: string | File | null) => {
    setFormData((prev: CampaignFormData) => ({
      ...prev,
      campaignDetail: {
        ...prev.campaignDetail,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <Label htmlFor="ad-image" className="font-semibold">Upload Image*</Label>
        <ImageUploader onFileChange={(file) => handleDetailChange("image", file)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ad-name" className="font-semibold">Name*</Label>
        <Input
          id="ad-name"
          placeholder="ex. Summer Sale Campaign"
          value={formData.campaignDetail.name}
          onChange={(e) => handleDetailChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ad-description" className="font-semibold">Description*</Label>
        <Textarea
          id="ad-description"
          placeholder="Add description..."
          value={formData.campaignDetail.description}
          onChange={(e) => handleDetailChange("description", e.target.value)}
        />
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Goals</h3>
        <RadioGroup
          value={formData.campaignDetail.goal}
          onValueChange={(value) => handleDetailChange("goal", value)}
          className="space-y-3"
        >
          {goals.map((goal) => (
            <CustomRadioCard
              key={goal.id}
              id={goal.id}
              value={goal.value}
              title={goal.title}
              description={goal.description}
            />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default CampaignDetailStep;