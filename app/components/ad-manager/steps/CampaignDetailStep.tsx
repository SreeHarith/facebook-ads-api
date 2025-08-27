"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "../ui/ImageUploader";
import { CampaignFormData, FacebookPage } from "../AdManager";

interface CampaignDetailStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  // These props are no longer needed but kept for potential future use
  pages?: FacebookPage[];
  isLoadingPages?: boolean;
}

const goals = [
  {
    id: "goal-traffic",
    value: "OUTCOME_TRAFFIC",
    title: "Traffic",
    description: "Send more people to a destination, such as your website or app.",
  },
  {
    id: "goal-awareness",
    value: "OUTCOME_AWARENESS",
    title: "Awareness",
    description: "Show your ads to people who are most likely to remember them.",
  },
  {
    id: "goal-leads",
    value: "OUTCOME_LEADS",
    title: "Leads",
    description: "Collect leads for your business or brand.",
  },
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
      {/* The Facebook Page dropdown has been removed from here */}

      <div className="space-y-2">
        <Label htmlFor="ad-image" className="font-semibold">Upload Image*</Label>
        <ImageUploader onFileChange={(file) => handleDetailChange("image", file)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-name" className="font-semibold">Name*</Label>
        <Input
          id="ad-name"
          placeholder="e.g., Summer Sale Campaign"
          value={formData.campaignDetail.name}
          onChange={(e) => handleDetailChange("name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-description" className="font-semibold">Description*</Label>
        <Textarea
          id="ad-description"
          placeholder="Add a description for your ad..."
          value={formData.campaignDetail.description}
          onChange={(e) => handleDetailChange("description", e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Goals</h3>
        <RadioGroup
          value={formData.campaignDetail.goal}
          onValueChange={(value) => handleDetailChange("goal", value)}
        >
          <Card>
            {goals.map((goal, index) => (
              <React.Fragment key={goal.id}>
                <Label
                  htmlFor={goal.id}
                  className="flex items-start space-x-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <RadioGroupItem value={goal.value} id={goal.id} className="mt-1" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-gray-800">{goal.title}</p>
                    <p className="text-gray-600 text-sm">{goal.description}</p>
                  </div>
                </Label>
                {index < goals.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </Card>
        </RadioGroup>
      </div>
    </div>
  );
};

export default CampaignDetailStep;
