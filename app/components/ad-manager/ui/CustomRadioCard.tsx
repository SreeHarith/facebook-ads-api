import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CustomRadioCardProps {
  id: string;
  value: string;
  title: string;
  description: string;
}

const CustomRadioCard: React.FC<CustomRadioCardProps> = ({ id, value, title, description }) => {
  return (
    // The Label wraps the entire card, making the whole area clickable
    <Label htmlFor={id} className="block cursor-pointer">
      <Card
        className="p-4 flex items-start space-x-4 transition-colors 
                   hover:bg-gray-50 has-[[data-state=checked]]:bg-violet-50 
                   has-[[data-state=checked]]:border-violet-400"
      >
        <RadioGroupItem value={value} id={id} aria-label={title} />
        <div className="space-y-1 -mt-1">
          <p className="font-medium text-sm text-gray-800">{title}</p>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </Card>
    </Label>
  );
};

export default CustomRadioCard;