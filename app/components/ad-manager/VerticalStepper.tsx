import React from "react";

// Define the type for the component's props for type safety with TypeScript
interface VerticalStepperProps {
  currentStep: number;
}

// An array to hold the data for our navigation steps.
// This makes it easy to add, remove, or reorder steps later.
const steps = [
  { id: 1, title: "Channel & Type" },
  { id: 2, title: "Campaign Detail" },
  { id: 3, title: "Target Audience" },
  { id: 4, title: "Budget & Scheduling" },
  { id: 5, title: "Payment" },
];

const VerticalStepper: React.FC<VerticalStepperProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Ad Creation Steps">
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <div
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                currentStep === step.id
                  ? "bg-violet-100 text-violet-700" // Active step style
                  : "bg-transparent text-gray-600" // Inactive step style
              }`}
            >
              {step.title}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default VerticalStepper;