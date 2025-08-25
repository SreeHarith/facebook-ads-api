import { NextResponse } from "next/server";
// IMPORT: The shared CampaignFormData type from your component
import { CampaignFormData } from "@/app/components/ad-manager/AdManager";

// This function handles GET requests to prevent server errors
export async function GET() {
  return NextResponse.json(
    { message: "API is running. Use POST to create a campaign." },
    { status: 200 }
  );
}

// This function handles POST requests to create a new campaign
export async function POST(request: Request) {
  try {
    const formData: CampaignFormData = await request.json();
    console.log("Received form data on backend:", formData);

    const accessToken = process.env.FB_ACCESS_TOKEN || "YOUR_PLACEHOLDER_TOKEN";
    const adAccountId = process.env.FB_AD_ACCOUNT_ID || "act_YOUR_PLACEHOLDER_AD_ACCOUNT_ID";

    const campaignPayload = {
      name: formData.campaignDetail.name,
      objective: "OUTCOME_TRAFFIC",
      status: "PAUSED",
      special_ad_categories: [],
      access_token: accessToken,
    };

    console.log("Payload for Campaign:", campaignPayload);

    /* // Real API call for Campaign Creation
    const campaignResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/campaigns`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(campaignPayload) }
    );
    const campaignData = await campaignResponse.json();
    if (!campaignResponse.ok) {
      throw new Error(`Facebook Campaign API Error: ${campaignData.error.message}`);
    }
    const campaignId = campaignData.id;
    */

    const campaignId = "MOCK_CAMPAIGN_ID_12345";
    console.log("Mock Campaign Created with ID:", campaignId);

    const adSetPayload = {
      name: `${formData.campaignDetail.name} Ad Set`,
      campaign_id: campaignId,
      status: "PAUSED",
      billing_event: "IMPRESSIONS",
      optimization_goal: "REACH",
      daily_budget: parseInt(formData.budget.dailyBudget) * 100,
      targeting: {
        geo_locations: { countries: ["US"] },
        age_min: formData.targetAudience.minAge,
        age_max: formData.targetAudience.maxAge,
      },
      access_token: accessToken,
    };
    
    console.log("Payload for Ad Set:", adSetPayload);

    /*
    // Real API call for the Ad Set
    const adSetResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/adsets`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(adSetPayload) }
    );
    const adSetData = await adSetResponse.json();
    if (!adSetResponse.ok) {
      throw new Error(`Facebook Ad Set API Error: ${adSetData.error.message}`);
    }
    const adSetId = adSetData.id;
    */

    const adSetId = "MOCK_ADSET_ID_67890";
    console.log("Mock Ad Set Created with ID:", adSetId);

    return NextResponse.json({
        message: "Backend is ready! Mock campaign and ad set created successfully.",
        campaignId: campaignId,
        adSetId: adSetId,
      }, { status: 200 }
    );

  // CORRECTED: Use a safer type for the error object
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Internal Server Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}