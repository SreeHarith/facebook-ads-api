import { NextResponse } from "next/server";
import { CampaignFormData } from "@/app/components/ad-manager/AdManager";

// The old base64ToBlob helper function is no longer needed and has been removed.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formData: Omit<CampaignFormData, 'campaignDetail'> & { campaignDetail: Omit<CampaignFormData['campaignDetail'], 'image'> & { image: string } } = body;

    const accessToken = process.env.FB_ACCESS_TOKEN;
    const adAccountId = process.env.FB_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      throw new Error("Missing Facebook API credentials in .env.local file.");
    }

    // --- STEP 1: UPLOAD THE IMAGE ---
    const base64Data = formData.campaignDetail.image.split(',')[1];
    if (!base64Data) {
      throw new Error("Invalid image data received. The base64 string is malformed.");
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const imageFormData = new FormData();
    const imageName = 'upload.png'; // Give the upload a consistent filename
    imageFormData.append('source', new Blob([imageBuffer]), imageName);
    imageFormData.append('access_token', accessToken);
    
    const imageResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adimages`, {
        method: 'POST',
        body: imageFormData,
    });
    const imageData = await imageResponse.json();
    
    // Log the full response from Facebook for debugging
    console.log("Full Image API Response:", JSON.stringify(imageData, null, 2));

    if (!imageResponse.ok) throw new Error(`API Error (Image Upload): ${imageData.error.message}`);
    
    let imageHash = '';
    if (imageData.images && imageData.images[imageName] && imageData.images[imageName].hash) {
      imageHash = imageData.images[imageName].hash;
    } else if (imageData.images && imageData.images[0] && imageData.images[0].hash) {
      imageHash = imageData.images[0].hash;
    }

    if (!imageHash) {
      throw new Error("Image hash not found in API response. Check the server logs for the full response from Facebook.");
    }
    console.log("Step 1/3: Image uploaded successfully. Hash:", imageHash);

    // --- STEP 2: CREATE THE CAMPAIGN ---
    const campaignPayload = {
      name: formData.campaignDetail.name,
      objective: "OUTCOME_TRAFFIC",
      status: "PAUSED",
      special_ad_categories: [],
    };
    const campaignResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignPayload),
    });
    const campaignData = await campaignResponse.json();
    if (!campaignResponse.ok) throw new Error(`API Error (Campaign Creation): ${campaignData.error.message}`);
    const campaignId = campaignData.id;
    console.log("Step 2/3: Campaign created successfully. ID:", campaignId);

    // --- STEP 3: CREATE THE AD SET ---
    const adSetPayload = {
      name: `${formData.campaignDetail.name} Ad Set`,
      campaign_id: campaignId,
      status: "PAUSED",
      billing_event: "IMPRESSIONS",
      optimization_goal: "REACH",
      daily_budget: formData.budget.minimumBudget * 100,
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      targeting: {
        geo_locations: {
          countries: ['IN']
        },
        age_min: formData.targetAudience.minAge,
        age_max: formData.targetAudience.maxAge,
      },
    };
    const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adsets?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adSetPayload),
    });
    const adSetData = await adSetResponse.json();
    if (!adSetResponse.ok) throw new Error(`API Error (Ad Set Creation): ${adSetData.error.message}`);
    const adSetId = adSetData.id;
    console.log("Step 3/3: Ad Set created successfully. ID:", adSetId);

    // --- STEPS 4 AND 5 ARE SKIPPED FOR NOW ---
    /*
    // --- STEP 4: CREATE THE AD CREATIVE ---
    const adCreativePayload = {
      name: `${formData.campaignDetail.name} Creative`,
      object_story_spec: {
        page_id: "YOUR_FACEBOOK_PAGE_ID_HERE", 
        link_data: {
          image_hash: imageHash,
          link: "https://www.example.com",
          message: formData.campaignDetail.description,
        },
      },
    };
    const adCreativeResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adcreatives?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adCreativePayload),
    });
    const adCreativeData = await adCreativeResponse.json();
    if (!adCreativeResponse.ok) throw new Error(`API Error (Ad Creative Creation): ${adCreativeData.error.message}`);
    const adCreativeId = adCreativeData.id;
    console.log("Step 4/5: Ad Creative created successfully. ID:", adCreativeId);

    // --- STEP 5: CREATE THE AD ---
    const adPayload = {
      name: `${formData.campaignDetail.name} Ad`,
      adset_id: adSetId,
      creative: { creative_id: adCreativeId },
      status: "PAUSED",
    };
    const adResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/ads?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adPayload),
    });
    const adData = await adResponse.json();
    if (!adResponse.ok) throw new Error(`API Error (Ad Creation): ${adData.error.message}`);
    const adId = adData.id;
    console.log("Step 5/5: Final Ad created successfully. ID:", adId);
    */

    return NextResponse.json({ 
        message: "Partial Test Successful! Campaign and Ad Set created.",
        campaignId: campaignId,
        adSetId: adSetId
    }, { status: 200 });

  // THIS IS THE CORRECTED CATCH BLOCK
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Full API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
