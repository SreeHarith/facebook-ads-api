import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const isPenultimateStep = currentStep === totalSteps - 1; // The step before Payment

  // Dynamically set the text for the primary action button
  let nextButtonText = "Next";
  if (isPenultimateStep) {
    nextButtonText = "Choose Payment";
  } else if (isLastStep) {
    nextButtonText = "Pay & Submit Campaign";
  }

  // Determine the action when the primary button is clicked
  const handleNextClick = () => {
    if (isLastStep) {
      onSubmit(); // On the last step, submit the form
    } else {
      onNext(); // Otherwise, go to the next step
    }
  };

  return (
    <div className="w-full flex justify-end items-center gap-4 pt-4 border-t">
      <Button variant="ghost" className="text-gray-600">Cancel</Button>
      
      {/* Only show the 'Back' button if it's not the first step */}
      {!isFirstStep && (
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      )}

      <Button onClick={handleNextClick} className="bg-violet-600 hover:bg-violet-700">
        {nextButtonText}
      </Button>
    </div>
  );
};

export default FormActions;