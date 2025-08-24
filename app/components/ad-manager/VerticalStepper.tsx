import React from "react";

// UPDATED: The props now include a 'setStep' function
interface VerticalStepperProps {
  currentStep: number;
  setStep: (step: number) => void;
}

// An array to hold the data for our navigation steps.
const steps = [
  { id: 1, title: "Channel & Type" },
  { id: 2, title: "Campaign Detail" },
  { id: 3, title: "Target Audience" },
  { id: 4, title: "Budget & Scheduling" },
  { id: 5, title: "Payment" },
];

const VerticalStepper: React.FC<VerticalStepperProps> = ({ currentStep, setStep }) => {
  return (
    <nav aria-label="Ad Creation Steps">
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            {/* UPDATED: This is now a clickable button */}
            <button
              onClick={() => setStep(step.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                currentStep === step.id
                  ? "bg-violet-100 text-violet-700" // Active step style
                  : "bg-transparent text-gray-600 hover:bg-slate-200" // Inactive step style with hover
              }`}
            >
              {step.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default VerticalStepper;