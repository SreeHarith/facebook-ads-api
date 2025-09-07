"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Eye } from "lucide-react";
import AdManager from "@/app/components/ad-manager/AdManager";

export type VenuePromotion = {
  campaignId: string;
  campaignName: string;
  adSetId: string;
  promotionName: string;
  createdAt: string;
  creativeCount: number; // The API now provides this
};

const VenueCard = ({ venue }: { venue: VenuePromotion }) => {
  const router = useRouter();

  // This function now navigates to the new details page
  const handleViewPromotion = () => {
    router.push(`/promotions/${venue.adSetId}?campaignId=${venue.campaignId}`);
  };
  
  const handleAddNewPromotion = () => {
    // This creates a new Ad Set within the same Campaign
    router.push(`/?campaignId=${venue.campaignId}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-grow">
        <p className="font-bold text-lg">{venue.promotionName}</p>
        <p className="text-sm text-gray-500">
          In Campaign: <span className="font-medium text-gray-700">{venue.campaignName}</span>
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-semibold uppercase text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {venue.creativeCount} {venue.creativeCount === 1 ? 'Creative' : 'Creatives'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-center">
        <Button variant="outline" size="sm" onClick={handleAddNewPromotion}>
          <FilePlus2 className="h-4 w-4 mr-2" />
          New Promotion
        </Button>
        <Button size="sm" onClick={handleViewPromotion}>
          <Eye className="h-4 w-4 mr-2" />
          Manage Creatives
        </Button>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("create");
  const [venues, setVenues] = useState<VenuePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const campaignId = searchParams.get("campaignId");
    const adSetId = searchParams.get("adSetId");
    if (campaignId || adSetId) {
      setActiveTab("create");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "venues") {
      const fetchVenues = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/campaigns/list-venues');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch venue promotions");
          }
          const data = await response.json();
          setVenues(data);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVenues();
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="create">Create Ad</TabsTrigger>
            <TabsTrigger value="venues">Venue Promotions</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <div className="mt-6 flex justify-center">
              <AdManager onSuccess={() => setActiveTab("venues")} />
            </div>
          </TabsContent>

          <TabsContent value="venues">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Venue Promotions</CardTitle>
                <CardDescription>
                  Manage all active promotions for your salon venues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <p className="text-center py-12">Loading promotions...</p>}
                {error && <p className="text-center py-12 text-red-600">Error: {error}</p>}
                {!isLoading && !error && (
                  <div className="space-y-4">
                    {venues.length > 0 ? (
                      venues.map(venue => <VenueCard key={venue.adSetId} venue={venue} />)
                    ) : (
                      <p className="text-center py-12 text-gray-500">No venue promotions found.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

