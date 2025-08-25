import { create } from 'zustand';
// Import the types from their original files
import { Campaign } from '@/app/components/ad-manager/table/columns';
import { CampaignFormData } from '@/app/components/ad-manager/AdManager';

// Define the shape of our store
interface CampaignState {
  campaigns: Campaign[];
  addCampaign: (formData: CampaignFormData) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  // The list of campaigns now starts as an empty array
  campaigns: [], 
  
  // This function adds a new campaign to the list
  addCampaign: (formData) => {
    const newCampaign: Campaign = {
      id: `CAM-${Date.now()}`,
      adName: formData.campaignDetail.name,
      goals: formData.campaignDetail.goal,
      type: formData.type,
      platform: formData.channel.facebook && formData.channel.instagram ? "Both" : formData.channel.facebook ? "Facebook" : "Instagram",
      startDate: formData.budget.startDate ? formData.budget.startDate.toLocaleDateString() : "N/A",
      endDate: formData.budget.endDate ? formData.budget.endDate.toLocaleDateString() : "N/A",
      budget: parseFloat(formData.budget.totalBudget),
      status: "In Progress",
    };
    
    set((state) => ({
      campaigns: [...state.campaigns, newCampaign],
    }));
  },
}));