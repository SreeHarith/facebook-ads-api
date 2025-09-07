"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignsTable } from "@/app/components/ad-manager/table/CampaignsTable";
import { columns } from "@/app/components/ad-manager/table/columns";
import { Campaign } from "@/app/components/ad-manager/table/columns";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State to hold any errors

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns/list');
        if (!response.ok) {
          // If the server response is not OK, capture the error message
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch campaigns");
        }
        
        const data = await response.json();
        
        // --- DIAGNOSTIC LOG ---
        // This will show you the exact data structure coming from your API
        console.log("Data received from API:", data);

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array of campaigns.");
        }
        
        // Map the data from Firestore to the format your table expects
        const formattedCampaigns = data.map((item: any) => {
          // Defensive checks to prevent crashes if data is missing
          if (!item.fullFormData || !item.fullFormData.channel || !item.fullFormData.budget) {
            console.warn("Skipping campaign with incomplete data:", item);
            return null; // Skip this item if it's malformed
          }

          return {
            id: item.id,
            facebookCampaignId: item.facebookCampaignId,
            adName: item.name,
            goals: item.objective,
            type: item.type,
            platform: item.fullFormData.channel.facebook && item.fullFormData.channel.instagram ? "Both" : item.fullFormData.channel.facebook ? "Facebook" : "Instagram",
            startDate: new Date(item.createdAt).toLocaleDateString(),
            endDate: item.fullFormData.budget.endDate ? new Date(item.fullFormData.budget.endDate).toLocaleDateString() : "N/A",
            budget: parseFloat(item.fullFormData.budget.totalBudget),
            status: item.status,
          };
        }).filter(Boolean) as Campaign[]; // Filter out any null items
        
        setCampaigns(formattedCampaigns);

      } catch (err) {
        // Capture and display any errors that occur during the fetch
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Error fetching or processing campaigns:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>
                  View and manage all your ad campaigns from the database.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/">Create New Ad</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-center py-12">Loading campaigns from database...</p>}
            {error && <p className="text-center py-12 text-red-600">Error: {error}</p>}
            {!isLoading && !error && <CampaignsTable columns={columns} data={campaigns} />}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

