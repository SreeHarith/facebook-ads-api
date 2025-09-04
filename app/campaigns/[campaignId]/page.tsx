"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// --- THIS IS THE MOCK DATA SWITCH ---
// Set this to 'true' to see the test data.
// Set this to 'false' to use the live API.
const useMockData = true;

// A complete set of fake statistics for testing
const mockInsights: CampaignInsights = {
  impressions: "15420",
  reach: "11893",
  spend: "1250.75",
  clicks: "345",
  ctr: "2.23",
  cpc: "3.62",
  date_start: "2024-08-01",
  date_stop: "2024-08-30",
};
// --- END OF MOCK DATA SECTION ---

interface CampaignInsights {
  impressions: string;
  reach: string;
  spend: string;
  clicks: string;
  ctr: string;
  cpc: string;
  date_start: string;
  date_stop: string;
}

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base font-medium text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </CardContent>
  </Card>
);

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId as string;

  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const fetchInsights = async () => {
      // If mock data is enabled, use it and skip the API call
      if (useMockData) {
        setInsights(mockInsights);
        setIsLoading(false);
        return;
      }
      
      // Otherwise, fetch from the live API
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/campaigns/${campaignId}/insights`);
        if (!response.ok) {
          throw new Error("Failed to fetch campaign statistics.");
        }
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [campaignId]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold mb-6">Campaign Insights</h1>
        
        {insights ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Amount Spent" value={`₹${parseFloat(insights.spend).toFixed(2)}`} />
            <StatCard title="Impressions" value={parseInt(insights.impressions).toLocaleString()} />
            <StatCard title="Reach" value={parseInt(insights.reach).toLocaleString()} />
            <StatCard title="Clicks" value={parseInt(insights.clicks).toLocaleString()} />
            <StatCard title="Click-Through Rate (CTR)" value={`${parseFloat(insights.ctr).toFixed(2)}%`} />
            <StatCard title="Cost Per Click (CPC)" value={`₹${parseFloat(insights.cpc).toFixed(2)}`} />
          </div>
        ) : (
          <p className="text-lg text-gray-600">No insights available for this campaign in the selected date range (last 30 days).</p>
        )}
      </div>
    </main>
  );
}

