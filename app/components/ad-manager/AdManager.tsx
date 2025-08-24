"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// Import all the components we have built
import VerticalStepper from "./VerticalStepper";
import FormActions from "./ui/FormActions";
import ChannelTypeStep from "./steps/ChannelTypeStep";
import CampaignDetailStep from "./steps/CampaignDetailStep";
import TargetAudienceStep from "./steps/TargetAudienceStep";
import BudgetSchedulingStep from "./steps/BudgetSchedulingStep";
import PaymentStep from "./steps/PaymentStep";

// LOGIC CHANGE: The 'type' property is now a string to support single-selection.
interface CampaignFormData {
  channel: { facebook: boolean; instagram: boolean };
  type: "image" | "video";
  campaignDetail: { image: File | null; name: string; description: string; goal: string };
  targetAudience: { gender: string; minAge: string; maxAge: string; venue: string; locationRange: number };
  budget: { startDate?: Date; endDate?: Date; dailyBudget: string; totalBudget: string };
  payment: { selectedCard: string };
}

const TOTAL_STEPS = 5;

const AdManager: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    // Set initial default values for the form
    channel: { facebook: true, instagram: false },
    type: "image", // LOGIC CHANGE: The initial state for 'type' is now a string.
    campaignDetail: { image: null, name: "", description: "", goal: "coupon" },
    targetAudience: { gender: "all", minAge: "18", maxAge: "65", venue: "online-store", locationRange: 20 },
    budget: { startDate: new Date(), endDate: undefined, dailyBudget: "100", totalBudget: "3000" },
    payment: { selectedCard: "visa-156" },
  });

  // Navigation handlers
  const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  
  // UPDATED: This function now sends all form data to your backend API endpoint
  const handleSubmit = async () => {
    console.log("Submitting complete form data to backend:", formData);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Error from backend: ${result.error}`);
      } else {
        // Display the mock success message from the backend
        alert(result.message);
        console.log("Success response from backend:", result);
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert("An error occurred while sending data to the backend.");
    }
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
          {/* THE ONLY CHANGE IS HERE: We pass the setStep function */}
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