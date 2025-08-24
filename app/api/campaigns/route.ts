import { NextResponse } from "next/server";

// We can reuse the same interface from the frontend for type safety
interface CampaignFormData {
  channel: { facebook: boolean; instagram: boolean };
  type: "image" | "video";
  campaignDetail: { image: File | null; name: string; description: string; goal: string };
  targetAudience: { gender: string; minAge: string; maxAge: string; venue: string; locationRange: number };
  budget: { startDate?: Date; endDate?: Date; dailyBudget: string; totalBudget: string };
  payment: { selectedCard: string };
}

// This function handles POST requests to /api/campaigns
export async function POST(request: Request) {
  try {
    const formData: CampaignFormData = await request.json();
    console.log("Received form data on backend:", formData);

    // --- Placeholder Credentials ---
    // When you have your account, you will fill these in your .env.local file
    const accessToken = process.env.FB_ACCESS_TOKEN || "YOUR_PLACEHOLDER_TOKEN";
    const adAccountId = process.env.FB_AD_ACCOUNT_ID || "act_YOUR_PLACEHOLDER_AD_ACCOUNT_ID";

    // --- Step 1: Create the Campaign ---
    const campaignPayload = {
      name: formData.campaignDetail.name,
      objective: "OUTCOME_TRAFFIC", // This maps from your form's "goal". We'll make this dynamic later.
      status: "PAUSED",
      special_ad_categories: [],
      access_token: accessToken,
    };

    console.log("Payload for Campaign:", campaignPayload);

    /* // This is the real API call you'll use later
    const campaignResponse = await fetch(
      `https://graph.facebook.com/v18.0/${adAccountId}/campaigns`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(campaignPayload) }
    );
    const campaignData = await campaignResponse.json();
    if (!campaignResponse.ok) {
      throw new Error(`Facebook Campaign API Error: ${campaignData.error.message}`);
    }
    const campaignId = campaignData.id;
    */

    // For now, we use a fake Campaign ID to continue the process
    const campaignId = "MOCK_CAMPAIGN_ID_12345";
    console.log("Mock Campaign Created with ID:", campaignId);

    // --- Step 2: Create the Ad Set ---
    const adSetPayload = {
      name: `${formData.campaignDetail.name} Ad Set`,
      campaign_id: campaignId,
      status: "PAUSED",
      billing_event: "IMPRESSIONS",
      optimization_goal: "REACH",
      daily_budget: parseInt(formData.budget.dailyBudget) * 100, // Facebook expects budget in cents
      targeting: {
        geo_locations: { countries: ["US"] }, // Example targeting
        age_min: formData.targetAudience.minAge,
        age_max: formData.targetAudience.maxAge,
      },
      access_token: accessToken,
    };
    
    console.log("Payload for Ad Set:", adSetPayload);

    /*
    // This is the real API call for the Ad Set
    const adSetResponse = await fetch(
      `https://graph.facebook.com/v18.0/${adAccountId}/adsets`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(adSetPayload) }
    );
    const adSetData = await adSetResponse.json();
    if (!adSetResponse.ok) {
      throw new Error(`Facebook Ad Set API Error: ${adSetData.error.message}`);
    }
    const adSetId = adSetData.id;
    */

    // For now, we use a fake Ad Set ID
    const adSetId = "MOCK_ADSET_ID_67890";
    console.log("Mock Ad Set Created with ID:", adSetId);

    // (Steps for creating the Ad Creative and the final Ad would follow here)

    // --- Return a success response ---
    return NextResponse.json({
        message: "Backend is ready! Mock campaign and ad set created successfully.",
        campaignId: campaignId,
        adSetId: adSetId,
      }, { status: 200 }
    );

  } catch (error: any) {
    console.error("Internal Server Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}