import { NextResponse } from "next/server";
import { CampaignFormData } from "@/app/components/ad-manager/AdManager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formData: Omit<CampaignFormData, 'campaignDetail'> & { campaignDetail: Omit<CampaignFormData['campaignDetail'], 'image'> & { image: string } } = body;

    const accessToken = process.env.FB_ACCESS_TOKEN;
    const adAccountId = process.env.FB_AD_ACCOUNT_ID;
    const pageId = process.env.FB_PAGE_ID;

    if (!accessToken || !adAccountId || !pageId) {
      throw new Error("Missing Facebook API credentials in .env.local file.");
    }
    
    // ... (Image upload and Campaign creation code) ...
    const base64Data = formData.campaignDetail.image.split(',')[1];
    if (!base64Data) throw new Error("Invalid image data received.");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageFormData = new FormData();
    const imageName = 'upload.png';
    imageFormData.append('source', new Blob([imageBuffer]), imageName);
    imageFormData.append('access_token', accessToken);
    
    const imageResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adimages`, {
        method: 'POST',
        body: imageFormData,
    });
    const imageData = await imageResponse.json();
    if (!imageResponse.ok) throw new Error(`API Error (Image Upload): ${imageData.error.message}`);
    
    let imageHash = '';
    if (imageData.images && imageData.images[imageName] && imageData.images[imageName].hash) {
      imageHash = imageData.images[imageName].hash;
    } else if (imageData.images && imageData.images[0] && imageData.images[0].hash) {
      imageHash = imageData.images[0].hash;
    }
    if (!imageHash) throw new Error("Image hash not found in API response.");
    console.log("Step 1/5: Image uploaded successfully. Hash:", imageHash);

    const campaignPayload = {
      name: formData.campaignDetail.name,
      objective: formData.campaignDetail.goal,
      status: "PAUSED",
      special_ad_categories: [],
      access_token: accessToken,
    };
    const campaignResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignPayload),
    });
    const campaignData = await campaignResponse.json();
    if (!campaignData.id) throw new Error(`API Error (Campaign Creation): ${campaignData.error.message}`);
    const campaignId = campaignData.id;
    console.log("Step 2/5: Campaign created successfully. ID:", campaignId);

    // --- Create Ad Set using LATITUDE and LONGITUDE ---
    const genderMap: { [key: string]: number[] } = {
      male: [1],
      female: [2],
    };
    const genders = genderMap[formData.targetAudience.gender] || [];

    const adSetPayload: any = {
      name: `${formData.campaignDetail.name} Ad Set`,
      campaign_id: campaignId,
      status: "PAUSED",
      billing_event: "IMPRESSIONS",
      optimization_goal: "REACH",
      daily_budget: formData.budget.minimumBudget * 100,
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      targeting: {
        geo_locations: {
          custom_locations: formData.targetAudience.locations.map(loc => ({
            latitude: loc.lat,
            longitude: loc.lng,
            radius: formData.targetAudience.locationRange,
            distance_unit: 'kilometer'
          }))
        },
        age_min: formData.targetAudience.minAge,
        age_max: formData.targetAudience.maxAge,
        ...(genders.length > 0 && { genders }),
      },
      access_token: accessToken,
    };

    if (formData.budget.startDate) {
        const now = new Date();
        const userStartDate = new Date(formData.budget.startDate);
        const startTime = new Date(Math.max(userStartDate.getTime(), now.getTime() + 10 * 60 * 1000));
        adSetPayload.start_time = startTime.toISOString();
    }
    if (formData.budget.endDate) {
        const userEndDate = new Date(formData.budget.endDate);
        userEndDate.setHours(23, 59, 59, 999);
        adSetPayload.end_time = userEndDate.toISOString();
    }

    const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adsets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adSetPayload),
    });
    const adSetData = await adSetResponse.json();
    if (!adSetData.id) {
        const fbError = adSetData.error ? JSON.stringify(adSetData.error, null, 2) : "Unknown Facebook Error";
        throw new Error(`API Error (Ad Set Creation): ${fbError}`);
    }
    const adSetId = adSetData.id;
    console.log("Step 3/5: Ad Set created successfully. ID:", adSetId);
    
    // ... (Rest of the file for ad creative and ad creation) ...
    const adCreativePayload = {
      name: `${formData.campaignDetail.name} Creative`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          image_hash: imageHash,
          link: "https://www.example.com",
          message: formData.campaignDetail.description,
          call_to_action: { 'type': 'LEARN_MORE' }
        },
      },
      access_token: accessToken,
    };
    const adCreativeResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adcreatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adCreativePayload),
    });
    const adCreativeData = await adCreativeResponse.json();
    if (!adCreativeData.id) throw new Error(`API Error (Ad Creative Creation): ${JSON.stringify(adCreativeData.error, null, 2)}`);
    const adCreativeId = adCreativeData.id;
    console.log("Step 4/5: Ad Creative created successfully. ID:", adCreativeId);

    const adPayload = {
      name: `${formData.campaignDetail.name} Ad`,
      adset_id: adSetId,
      creative: { creative_id: adCreativeId },
      status: "PAUSED",
      access_token: accessToken,
    };
    const adResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adPayload),
    });
    const adData = await adResponse.json();
    if (!adData.id) throw new Error(`API Error (Ad Creation): ${JSON.stringify(adData.error, null, 2)}`);
    const adId = adData.id;
    console.log("Step 5/5: Final Ad created successfully. ID:", adId);

    return NextResponse.json({ message: "Campaign created successfully!", adId: adId, campaignId: campaignId }, { status: 200 });

  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Full API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}