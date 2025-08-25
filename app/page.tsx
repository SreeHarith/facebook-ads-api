"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignsTable } from "@/app/components/ad-manager/table/CampaignsTable";
import { columns } from "@/app/components/ad-manager/table/columns";
import { useCampaignStore } from "@/lib/store";
import AdManager from "@/app/components/ad-manager/AdManager";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("create");
  const campaigns = useCampaignStore((state) => state.campaigns);

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
                <CampaignsTable columns={columns} data={campaigns} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}