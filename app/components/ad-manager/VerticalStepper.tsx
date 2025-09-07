import React from "react";

interface VerticalStepperProps {
  currentStep: number;
  setStep: (step: number) => void;
  isNewCreativeOnly?: boolean; // --- ADD THIS LINE ---
}

const steps = [
  { id: 1, title: "Channel & Type" },
  { id: 2, title: "Creative Details" }, // Renamed for clarity
  { id: 3, title: "Target Audience" },
  { id: 4, title: "Budget & Scheduling" },
  { id: 5, title: "Payment" },
];

const VerticalStepper: React.FC<VerticalStepperProps> = ({ currentStep, setStep, isNewCreativeOnly }) => {
  return (
    <nav aria-label="Ad Creation Steps">
      <ul className="space-y-2">
        {steps.map((step) => {
          // --- ADDED LOGIC: Disable steps 3 and 4 if only creating a new ad ---
          const isDisabled = isNewCreativeOnly && (step.id === 3 || step.id === 4);

          return (
            <li key={step.id}>
              <button
                onClick={() => setStep(step.id)}
                disabled={isDisabled}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentStep === step.id
                    ? "bg-violet-100 text-violet-700"
                    : isDisabled
                    ? "bg-transparent text-gray-400 cursor-not-allowed"
                    : "bg-transparent text-gray-600 hover:bg-slate-200"
                }`}
              >
                {step.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default VerticalStepper;
