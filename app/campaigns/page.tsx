"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignsTable } from "@/app/components/ad-manager/table/CampaignsTable";
import { columns } from "@/app/components/ad-manager/table/columns";
import { useCampaignStore } from "@/lib/store";

export default function CampaignsPage() {
  // Read the list of campaigns from our global store
  const campaigns = useCampaignStore((state) => state.campaigns);

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/">Create New Ad</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CampaignsTable columns={columns} data={campaigns} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}