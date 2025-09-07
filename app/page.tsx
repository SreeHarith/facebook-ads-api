"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignsTable } from "@/app/components/ad-manager/table/CampaignsTable";
import { columns } from "@/app/components/ad-manager/table/columns";
import { Campaign } from "@/app/components/ad-manager/table/columns";
import AdManager from "@/app/components/ad-manager/AdManager";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("create");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const campaignId = searchParams.get("campaignId");
    if (campaignId) {
      setActiveTab("create");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "campaigns") {
      const fetchCampaigns = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/campaigns/list');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch campaigns");
          }
          const data = await response.json();

          // --- THIS IS THE FIX ---
          // The main document ID from Firestore (item.id) IS the facebookCampaignId.
          const formattedCampaigns = data.map((item: any) => ({
            id: item.id,
            facebookCampaignId: item.id, // Correctly assign the ID here
            adName: item.name,
            goals: item.objective,
            // The rest of the data mapping can be simplified or enhanced as needed
            type: "image", // Placeholder, as this detail is in the subcollection
            platform: "Facebook", // Placeholder
            startDate: new Date(item.createdAt).toLocaleDateString(),
            endDate: "Ongoing", // Placeholder
            budget: 0, // Placeholder
            status: "In Progress", // Placeholder
          })).filter(Boolean) as Campaign[];

          setCampaigns(formattedCampaigns);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCampaigns();
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="create">Create New Ad</TabsTrigger>
            <TabsTrigger value="campaigns">View Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="mt-6 flex justify-center">
              <AdManager onSuccess={() => setActiveTab("campaigns")} />
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && activeTab === 'campaigns' && <p className="text-center py-12">Loading campaigns...</p>}
                {error && <p className="text-center py-12 text-red-600">Error: {error}</p>}
                {!isLoading && !error && <CampaignsTable columns={columns} data={campaigns} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

