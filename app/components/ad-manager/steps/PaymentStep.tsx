"use client";

import React from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import PaymentMethodCard from "../ui/PaymentMethodCard";
import { Separator } from "@/components/ui/separator";
import { CampaignFormData } from "../AdManager"; // Import the main form data type

const savedCards = [
  { id: "card-1", value: "visa-156", cardType: "visa" as const, last4: "156", expiry: "12/26" },
  { id: "card-2", value: "mc-423", cardType: "mastercard" as const, last4: "423", expiry: "08/25" },
];

interface PaymentStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ formData, setFormData }) => {
  const handlePaymentChange = (value: string) => {
    setFormData((prev: CampaignFormData) => ({
      ...prev,
      payment: { ...prev.payment, selectedCard: value },
    }));
  };

  const creativeDesignCost = 500;
  const tax = 0;
  const totalBudget = parseFloat(formData.budget.totalBudget) || 0;
  const totalToPay = creativeDesignCost + totalBudget + tax;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <RadioGroup value={formData.payment.selectedCard} onValueChange={handlePaymentChange} className="space-y-3">
        {savedCards.map((card) => (
          <PaymentMethodCard
            key={card.id}
            id={card.id}
            value={card.value}
            cardType={card.cardType}
            last4={card.last4}
            expiry={card.expiry}
          />
        ))}
      </RadioGroup>
      <div className="pl-2">
        <button className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          + Add New Payment
        </button>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <p className="font-semibold">To Pay</p>
        <p className="font-bold text-xl">${totalToPay.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PaymentStep;