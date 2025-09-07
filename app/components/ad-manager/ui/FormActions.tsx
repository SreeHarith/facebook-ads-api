import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isNewCreativeOnly?: boolean; // --- ADD THIS LINE ---
}

const FormActions: React.FC<FormActionsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting,
  isNewCreativeOnly,
}) => {
  // --- UPDATED LOGIC ---
  // The last step is different in "new creative" mode
  const lastStep = isNewCreativeOnly ? 2 : totalSteps;
  const isLastStep = currentStep === lastStep;
  
  const handleNextClick = () => {
    // Skip steps 3 and 4 in "new creative" mode
    if (isNewCreativeOnly && currentStep === 2) {
      onSubmit(); // Go directly to submit from step 2
    } else if (isLastStep) {
      onSubmit();
    } else {
      onNext();
    }
  };

  const nextButtonText = isLastStep ? "Pay & Submit" : "Next";

  return (
    <div className="w-full flex justify-end items-center gap-4">
      <Button variant="ghost" className="text-gray-600" disabled={isSubmitting}>
        Cancel
      </Button>
      
      {currentStep > 1 && (
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
      )}

      {/* Hide the 'Next' button on the final step in the short flow */}
      {!(isNewCreativeOnly && currentStep === 5) && (
        <Button onClick={handleNextClick} disabled={isSubmitting}>
          {isSubmitting && isLastStep ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isSubmitting && isLastStep ? "Submitting..." : nextButtonText}
        </Button>
      )}
    </div>
  );
};

export default FormActions;
