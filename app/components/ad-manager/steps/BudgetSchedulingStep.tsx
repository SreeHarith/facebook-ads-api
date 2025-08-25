"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "../ui/DatePicker";
import { CampaignFormData } from "../AdManager"; // Import the main form data type

interface BudgetSchedulingStepProps {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const BudgetSchedulingStep: React.FC<BudgetSchedulingStepProps> = ({ formData, setFormData }) => {
  const handleBudgetChange = (field: keyof CampaignFormData["budget"], value: string | Date | undefined) => {
    setFormData((prev: CampaignFormData) => ({
      ...prev,
      budget: { ...prev.budget, [field]: value },
    }));
  };

  const creativeDesignCost = 500;
  const tax = 0;
  const totalBudget = parseFloat(formData.budget.totalBudget) || 0;
  const total = creativeDesignCost + totalBudget + tax;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-semibold">Start Date</Label>
          <DatePicker date={formData.budget.startDate} setDate={(date) => handleBudgetChange("startDate", date)} placeholder="Select a start date" />
        </div>
        <div className="space-y-2">
          <Label className="font-semibold">End Date</Label>
          <DatePicker date={formData.budget.endDate} setDate={(date) => handleBudgetChange("endDate", date)} placeholder="Select an end date" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="daily-budget" className="font-semibold">Daily Budget</Label>
          <Input id="daily-budget" type="number" placeholder="$ 100" value={formData.budget.dailyBudget} onChange={(e) => handleBudgetChange("dailyBudget", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total-budget" className="font-semibold">Total Budget</Label>
          <Input id="total-budget" type="number" placeholder="$ 3000" value={formData.budget.totalBudget} onChange={(e) => handleBudgetChange("totalBudget", e.target.value)} />
        </div>
      </div>
      <div className="space-y-4 rounded-lg border bg-slate-50 p-6 mt-8">
        <div className="space-y-2">
          <SummaryRow label="Creative Design" amount={creativeDesignCost} />
          <SummaryRow label="Total Budget" amount={totalBudget} />
          <SummaryRow label="Tax" amount={tax} />
        </div>
        <Separator />
        <div className="space-y-2">
          <SummaryRow label="Total" amount={total} isBold={true} />
          <SummaryRow label="To Pay" amount={total} isBold={true} />
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, amount, isBold = false }: { label: string; amount: number; isBold?: boolean }) => (
  <div className={`flex justify-between items-center ${isBold ? "font-bold text-gray-800" : "text-gray-600"}`}>
    <p>{label}</p>
    <p>${amount.toFixed(2)}</p>
  </div>
);

export default BudgetSchedulingStep;