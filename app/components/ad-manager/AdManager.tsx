"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCampaignStore } from "@/lib/store";

// Import all the components we have built
import VerticalStepper from "./VerticalStepper";
import FormActions from "./ui/FormActions";
import ChannelTypeStep from "./steps/ChannelTypeStep";
import CampaignDetailStep from "./steps/CampaignDetailStep";
import TargetAudienceStep from "./steps/TargetAudienceStep";
import BudgetSchedulingStep from "./steps/BudgetSchedulingStep";
import PaymentStep from "./steps/PaymentStep";

// The data structure for the form
export interface CampaignFormData {
  channel: { facebook: boolean; instagram: boolean };
  type: "image" | "video";
  campaignDetail: { image: File | null; name: string; description: string; goal: string };
  targetAudience: { gender: string; minAge: string; maxAge: string; venue: string; locationRange: number };
  budget: { startDate?: Date; endDate?: Date; minimumBudget: number; totalBudget: string };
  payment: { selectedCard: string };
}

// ADDED: A new prop to handle the successful submission event
interface AdManagerProps {
  onSuccess: () => void;
}

const TOTAL_STEPS = 5;

const AdManager: React.FC<AdManagerProps> = ({ onSuccess }) => {
  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    channel: { facebook: true, instagram: false },
    type: "image",
    campaignDetail: { image: null, name: "", description: "", goal: "coupon" },
    targetAudience: { gender: "all", minAge: "18", maxAge: "65", venue: "", locationRange: 20 },
    // --- UPDATED LINE ---
    budget: { startDate: undefined, endDate: undefined, minimumBudget: 500, totalBudget: "0" },
    payment: { selectedCard: "visa-156" },
  });

  useEffect(() => {
    const { startDate, endDate, minimumBudget } = formData.budget;

    if (startDate && endDate && endDate >= startDate) {
      // Normalize dates to the beginning of the day to count full days
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(0, 0, 0, 0));

      // Calculate the number of days, inclusive
      const dayCount = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
      const newTotal = dayCount * minimumBudget;

      // Only update state if the calculated value is different
      if (newTotal.toString() !== formData.budget.totalBudget) {
        setFormData(prev => ({
          ...prev,
          budget: { ...prev.budget, totalBudget: newTotal.toString() }
        }));
      }
    }
  }, [formData.budget.startDate, formData.budget.endDate, formData.budget.minimumBudget, formData.budget.totalBudget]);



  // Navigation handlers
  const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  
  // UPDATED: This function now calls the onSuccess prop to switch tabs
  const handleSubmit = () => {
    addCampaign(formData);
    alert("Campaign Submitted Successfully!");
    onSuccess(); // This tells the parent page to switch to the campaigns tab
  };

  // Helper function to render the current step's component
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ChannelTypeStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <CampaignDetailStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <TargetAudienceStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <BudgetSchedulingStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <PaymentStep formData={formData} setFormData={setFormData} />;
      default:
        return <ChannelTypeStep formData={formData} setFormData={setFormData} />;
    }
  };

  return (
    <Card className="w-full max-w-5xl shadow-lg">
      <CardHeader>
        <CardTitle>Ad manager</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <VerticalStepper currentStep={step} setStep={setStep} />
        </div>
        <div className="flex-1 min-h-[450px]">
          {renderStepContent()}
        </div>
      </CardContent>
      <CardFooter>
        <FormActions
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default AdManager;