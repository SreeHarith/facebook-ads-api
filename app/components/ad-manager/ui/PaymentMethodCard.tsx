import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// A simple component to render a card brand logo.
// In a real application, you would use SVG icons for this.
const CardLogo = ({ type }: { type: "visa" | "mastercard" }) => {
  if (type === "visa") {
    return (
      <div className="w-10 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-xs">
        VISA
      </div>
    );
  }
  if (type === "mastercard") {
    return (
      <div className="w-10 h-6 flex items-center justify-center rounded bg-gray-700">
        <div className="w-4 h-4 rounded-full bg-red-500 relative -right-1"></div>
        <div className="w-4 h-4 rounded-full bg-yellow-500 relative -left-1 opacity-80"></div>
      </div>
    );
  }
  return null;
};

// Define the component's props
interface PaymentMethodCardProps {
  id: string;
  value: string;
  cardType: "visa" | "mastercard";
  last4: string;
  expiry: string;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  id,
  value,
  cardType,
  last4,
  expiry,
}) => {
  return (
    <Label htmlFor={id} className="block cursor-pointer">
      <Card
        className="p-4 flex items-center transition-colors 
                   hover:bg-gray-50 has-[[data-state=checked]]:bg-violet-50 
                   has-[[data-state=checked]]:border-violet-400"
      >
        <RadioGroupItem value={value} id={id} className="mr-4" />
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardLogo type={cardType} />
            <div>
              <p className="font-medium text-sm text-gray-800">
                {cardType === "visa" ? "Visa" : "Mastercard"} ending in {last4}
              </p>
              <p className="text-gray-500 text-sm">Expiry {expiry}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
            Update
          </Button>
        </div>
      </Card>
    </Label>
  );
};

export default PaymentMethodCard;