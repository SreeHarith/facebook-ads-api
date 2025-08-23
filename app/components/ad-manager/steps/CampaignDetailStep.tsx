import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import ImageUploader from "../ui/ImageUploader";
import CustomRadioCard from "../ui/CustomRadioCard";

// Define the shape of the form data for this step
interface FormData {
  campaignDetail: {
    image: File | null;
    name: string;
    description: string;
    goal: string;
  };
}

interface CampaignDetailStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

// Data for the goals section
const goals = [
  {
    id: "goal-coupon",
    value: "coupon",
    title: "Offer a coupon",
    description:
      "Drive sales and expand your customer base with special discounts on Facebook.",
  },
  {
    id: "goal-update",
    value: "update",
    title: "Send a Quick Update",
    description:
      "Share business updates, new products, or sale announcements to your followers.",
  },
  {
    id: "goal-event",
    value: "event",
    title: "Send an event invitation",
    description: "Notify customers of special events, pop-ups, and more with a simple template.",
  },
];

const CampaignDetailStep: React.FC<CampaignDetailStepProps> = ({ formData, setFormData }) => {
  
  // A generic handler to update any field within the 'campaignDetail' object
  const handleDetailChange = (field: keyof FormData["campaignDetail"], value: string | File | null) => {
    setFormData((prev: any) => ({
      ...prev,
      campaignDetail: {
        ...prev.campaignDetail,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Image Uploader Section */}
      <div className="space-y-2">
        <Label htmlFor="ad-image" className="font-semibold">Upload Image*</Label>
        <ImageUploader onFileChange={(file) => handleDetailChange("image", file)} />
      </div>

      {/* Name Section */}
      <div className="space-y-2">
        <Label htmlFor="ad-name" className="font-semibold">Name*</Label>
        <Input
          id="ad-name"
          placeholder="ex. Summer Sale Campaign"
          value={formData.campaignDetail.name}
          onChange={(e) => handleDetailChange("name", e.target.value)}
        />
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <Label htmlFor="ad-description" className="font-semibold">Description*</Label>
        <Textarea
          id="ad-description"
          placeholder="Add description..."
          value={formData.campaignDetail.description}
          onChange={(e) => handleDetailChange("description", e.target.value)}
        />
      </div>

      {/* Goals Section */}
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