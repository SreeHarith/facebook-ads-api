"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/lib/store";

import VerticalStepper from "./VerticalStepper";
import FormActions from "./ui/FormActions";
import ChannelTypeStep from "./steps/ChannelTypeStep";
import CampaignDetailStep from "./steps/CampaignDetailStep";
import TargetAudienceStep from "./steps/TargetAudienceStep";
import BudgetSchedulingStep from "./steps/BudgetSchedulingStep";
import PaymentStep from "./steps/PaymentStep";
import { Location } from "./ui/LocationSearchInput";

// The data structure for the form
export interface CampaignFormData {
  channel: { facebook: boolean; instagram: boolean };
  type: "image" | "video";
  campaignDetail: { image: File | null; name: string; description: string; goal: string; pageId: string; };
  targetAudience: { 
    gender: string; 
    minAge: string; 
    maxAge: string; 
    locations: Location[];
    locationRange: number; 
  };
  budget: { startDate?: Date; endDate?: Date; minimumBudget: number; totalBudget: string };
  payment: { selectedCard: string };
}

export type { Location };

// --- CHANGE 1: Define an interface for the component's props ---
interface AdManagerProps {
  onSuccess: () => void;
}

// Helper function to convert a File to a Base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const TOTAL_STEPS = 5;

// --- CHANGE 2: Update the component to accept the 'onSuccess' prop ---
const AdManager: React.FC<AdManagerProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addCampaign = useCampaignStore((state) => state.addCampaign);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    channel: { facebook: true, instagram: false },
    type: "image",
    campaignDetail: { image: null, name: "", description: "", goal: "OUTCOME_TRAFFIC", pageId: "" },
    targetAudience: { gender: "all", minAge: "18", maxAge: "65", locations: [], locationRange: 20 },
    budget: { startDate: undefined, endDate: undefined, minimumBudget: 500, totalBudget: "0" },
    payment: { selectedCard: "visa-156" },
  });

  useEffect(() => {
    const { startDate, endDate, minimumBudget } = formData.budget;
    if (startDate && endDate && endDate >= startDate) {
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(0, 0, 0, 0));
      const dayCount = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
      const newTotal = dayCount * minimumBudget;
      if (newTotal.toString() !== formData.budget.totalBudget) {
        setFormData(prev => ({
          ...prev,
          budget: { ...prev.budget, totalBudget: newTotal.toString() }
        }));
      }
    }
  }, [formData.budget]);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const handleSubmit = async () => {
    if (!formData.campaignDetail.image) {
      alert("Please upload an image for the ad.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const imageBase64 = await fileToBase64(formData.campaignDetail.image);
      const payload = {
        ...formData,
        campaignDetail: { ...formData.campaignDetail, image: imageBase64 },
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "An unknown API error occurred");

      addCampaign(formData);
      setIsSubmitted(true);
      alert(result.message || "Campaign Submitted Successfully!");
      // --- CHANGE 3: Call the onSuccess function after everything succeeds ---
      onSuccess();

    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: return <ChannelTypeStep formData={formData} setFormData={setFormData} />;
      case 2: return <CampaignDetailStep formData={formData} setFormData={setFormData} />;
      case 3: return <TargetAudienceStep formData={formData} setFormData={setFormData} />;
      case 4: return <BudgetSchedulingStep formData={formData} setFormData={setFormData} />;
      case 5: return <PaymentStep formData={formData} setFormData={setFormData} />;
      default: return <ChannelTypeStep formData={formData} setFormData={setFormData} />;
    }
  };

  return (
    <>
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
            isSubmitting={isSubmitting}
          />
        </CardFooter>
      </Card>

      {isSubmitted && (
        <div className="w-full max-w-5xl flex justify-center mt-6">
          <Button onClick={() => router.push('/campaigns')} size="lg">
            View All Campaigns
          </Button>
        </div>
      )}
    </>
  );
};

export default AdManager;