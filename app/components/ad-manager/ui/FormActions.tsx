import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Import a loading spinner icon

// The interface for the component's props
interface FormActionsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean; // ADDED: The new prop for the loading state
}

const FormActions: React.FC<FormActionsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting, // Use the new prop
}) => {
  const isLastStep = currentStep === totalSteps;
  const nextButtonText = isLastStep ? "Pay & Submit Campaign" : "Next";

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

      <Button onClick={isLastStep ? onSubmit : onNext} disabled={isSubmitting}>
        {/* This part shows the spinner when submitting on the last step */}
        {isSubmitting && isLastStep ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {isSubmitting && isLastStep ? "Submitting..." : nextButtonText}
      </Button>
    </div>
  );
};

export default FormActions;