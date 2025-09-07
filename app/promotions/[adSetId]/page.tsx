"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define the type for a single Ad Creative
type AdCreative = {
  id: string;
  name: string;
  type: 'image' | 'video';
  status: string;
  createdAt: string;
};

const AdCreativeCard = ({ creative, campaignId, adSetId }: { creative: AdCreative, campaignId: string, adSetId: string }) => {
  return (
    <div className="bg-white p-4 rounded-lg border flex items-center justify-between">
      <div>
        <p className="font-semibold">{creative.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline">{creative.type}</Badge>
          <Badge>{creative.status}</Badge>
        </div>
      </div>
      {/* Future actions for a single ad can go here */}
    </div>
  );
};

export default function PromotionDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const adSetId = params.adSetId as string;
  const campaignId = searchParams.get('campaignId') as string;

  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adSetId || !campaignId) return;

    const fetchCreatives = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/promotions/${adSetId}/ads?campaignId=${campaignId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ad creatives.');
        }
        const data = await response.json();
        setCreatives(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatives();
  }, [adSetId, campaignId]);

  return (
    <main className="min-h-screen w-full bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Promotions
        </Button>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Ad Creatives</CardTitle>
                <CardDescription>Manage all creatives for this promotion.</CardDescription>
              </div>
              <Button onClick={() => router.push(`/?campaignId=${campaignId}&adSetId=${adSetId}`)}>
                <ImagePlus className="h-4 w-4 mr-2" />
                Add New Creative
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-center py-12">Loading creatives...</p>}
            {error && <p className="text-center py-12 text-red-600">Error: {error}</p>}
            {!isLoading && !error && (
              <div className="space-y-4">
                {creatives.length > 0 ? (
                  creatives.map(creative => (
                    <AdCreativeCard key={creative.id} creative={creative} campaignId={campaignId} adSetId={adSetId} />
                  ))
                ) : (
                  <p className="text-center py-12 text-gray-500">No ad creatives found for this promotion.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
