import { NextResponse } from "next/server";
// We import the original types to build upon them
import { CampaignFormData, Location } from "@/app/components/ad-manager/AdManager";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const firebaseConfig = {
  apiKey: "AIzaSyDlF31murWCjcplsLyDsAeXBnPF3v2j24A",
  authDomain: "facebook-ads-manager-da-salon.firebaseapp.com",
  projectId: "facebook-ads-manager-da-salon",
  storageBucket: "facebook-ads-manager-da-salon.firebasestorage.app",
  messagingSenderId: "889793352595",
  appId: "1:889793352595:web:5485da2dfb819846c94e66",
  measurementId: "G-P8BDHEML0T"
}; 


let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// --- THIS IS THE FIX ---
// Create a new type that accurately represents the data received by the API.
// It's the same as CampaignFormData, but the 'image' property is now a string.
type ApiCampaignFormData = Omit<CampaignFormData, 'campaignDetail'> & {
  campaignDetail: Omit<CampaignFormData['campaignDetail'], 'image'> & {
    image: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Use the new, more accurate type for the incoming data.
    const { existingCampaignId, ...formData } = body as (ApiCampaignFormData & { existingCampaignId?: string });

    const accessToken = process.env.FB_ACCESS_TOKEN;
    const adAccountId = process.env.FB_AD_ACCOUNT_ID;
    const pageId = process.env.FB_PAGE_ID;

    if (!accessToken || !adAccountId || !pageId) {
      throw new Error("Missing Facebook API credentials.");
    }
    
    let campaignId: string | undefined = existingCampaignId;

    // --- "FIND OR CREATE" LOGIC ---
    if (!campaignId) {
      console.log("Creating new campaign...");
      const campaignPayload = { name: formData.campaignDetail.name, objective: formData.campaignDetail.goal, status: "PAUSED", special_ad_categories: [], access_token: accessToken };
      const campaignResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campaignPayload) });
      const campaignData = await campaignResponse.json();
      if (!campaignData.id) throw new Error(`API Error (Campaign Creation): ${JSON.stringify(campaignData.error)}`);
      campaignId = campaignData.id;
      console.log("New Campaign created. ID:", campaignId);

      const campaignDataToSave = { 
        name: formData.campaignDetail.name, 
        objective: formData.campaignDetail.goal,
        createdAt: new Date().toISOString(),
      };
      if (campaignId) {
        const campaignDocRef = doc(db, "campaigns", campaignId);
        await setDoc(campaignDocRef, campaignDataToSave, { merge: true });
      }
    } else {
      console.log(`Using existing campaign: ${campaignId}`);
    }

    let adCreativePayload: any;
    // The type assertion `(as string)` is no longer needed because TypeScript now knows it's a string.
    const base64Data = formData.campaignDetail.image.split(',')[1];
    if (!base64Data) throw new Error("Invalid media data received.");
    const mediaBuffer = Buffer.from(base64Data, 'base64');
    if (formData.type === 'image') {
      const imageFormData = new FormData();
      imageFormData.append('source', new Blob([mediaBuffer]), 'upload.png');
      imageFormData.append('access_token', accessToken);
      const imageResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adimages`, { method: 'POST', body: imageFormData });
      const imageData = await imageResponse.json();
      if (!imageResponse.ok) throw new Error(`API Error (Image Upload): ${JSON.stringify(imageData.error)}`);
      const imageHash = imageData.images?.['upload.png']?.hash || imageData.images?.[0]?.hash;
      adCreativePayload = { name: `${formData.campaignDetail.name} Creative`, object_story_spec: { page_id: pageId, link_data: { image_hash: imageHash, link: "https://www.example.com", message: formData.campaignDetail.description, call_to_action: { 'type': 'LEARN_MORE' } } } };
    } else {
      const videoFormData = new FormData();
      videoFormData.append('source', new Blob([mediaBuffer]), 'upload.mp4');
      videoFormData.append('access_token', accessToken);
      const videoResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/advideos`, { method: 'POST', body: videoFormData });
      const videoData = await videoResponse.json();
      if (!videoResponse.ok || !videoData.id) throw new Error(`API Error (Video Upload): ${JSON.stringify(videoData.error)}`);
      const videoId = videoData.id;
      let thumbnailUrl = null;
      for (let i = 0; i < 15; i++) {
        const statusCheckUrl = `https://graph.facebook.com/v19.0/${videoId}?fields=status,thumbnails&access_token=${accessToken}`;
        const statusResponse = await fetch(statusCheckUrl);
        const statusData = await statusResponse.json();
        if (statusData.status?.video_status === 'ready' && statusData.thumbnails?.data?.[0]?.uri) {
          thumbnailUrl = statusData.thumbnails.data[0].uri;
          break;
        }
        await sleep(4000);
      }
      if (!thumbnailUrl) throw new Error("Video processing timed out.");
      adCreativePayload = { name: `${formData.campaignDetail.name} Creative`, object_story_spec: { page_id: pageId, video_data: { video_id: videoId, image_url: thumbnailUrl, call_to_action: { 'type': 'LEARN_MORE', value: { link: "https://www.example.com" } }, message: formData.campaignDetail.description } } };
    }
    const genderMap: { [key: string]: number[] } = { male: [1], female: [2] };
    const genders = genderMap[formData.targetAudience.gender] || [];
    const adSetPayload: any = { name: `${formData.campaignDetail.name} Ad Set`, campaign_id: campaignId, status: "PAUSED", billing_event: "IMPRESSIONS", optimization_goal: "REACH", daily_budget: formData.budget.minimumBudget * 100, bid_strategy: "LOWEST_COST_WITHOUT_CAP", targeting: { geo_locations: { custom_locations: formData.targetAudience.locations.map((loc: Location) => ({ latitude: loc.lat, longitude: loc.lng, radius: formData.targetAudience.locationRange, distance_unit: 'kilometer' })) }, age_min: formData.targetAudience.minAge, age_max: formData.targetAudience.maxAge, ...(genders.length > 0 && { genders }) }, access_token: accessToken };
    if (formData.budget.startDate) { const now = new Date(); const userStartDate = new Date(formData.budget.startDate); const startTime = new Date(Math.max(userStartDate.getTime(), now.getTime() + 10 * 60 * 1000)); adSetPayload.start_time = startTime.toISOString(); }
    if (formData.budget.endDate) { const userEndDate = new Date(formData.budget.endDate); userEndDate.setHours(23, 59, 59, 999); adSetPayload.end_time = userEndDate.toISOString(); }
    const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adsets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adSetPayload) });
    const adSetData = await adSetResponse.json();
    if (!adSetData.id) throw new Error(`API Error (Ad Set Creation): ${JSON.stringify(adSetData.error)}`);
    const adSetId = adSetData.id;
    adCreativePayload.access_token = accessToken;
    const adCreativeResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adcreatives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adCreativePayload) });
    const adCreativeData = await adCreativeResponse.json();
    if (!adCreativeData.id) throw new Error(`API Error (Ad Creative Creation): ${JSON.stringify(adCreativeData.error)}`);
    const adCreativeId = adCreativeData.id;
    const adPayload = { name: `${formData.campaignDetail.name} Ad`, adset_id: adSetId, creative: { creative_id: adCreativeId }, status: "PAUSED", access_token: accessToken };
    const adResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/ads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adPayload) });
    const adData = await adResponse.json();
    if (!adData.id) throw new Error(`API Error (Ad Creation): ${JSON.stringify(adData.error)}`);
    const adId = adData.id;
    
    if (!campaignId) {
      throw new Error("Campaign ID is undefined after the creation process.");
    }

    const serializableFormData = { ...formData, campaignDetail: { ...formData.campaignDetail, image: "media_uploaded" }, budget: { ...formData.budget, startDate: formData.budget.startDate ? new Date(formData.budget.startDate).toISOString() : null, endDate: formData.budget.endDate ? new Date(formData.budget.endDate).toISOString() : null } };
    
    const adSetDataToSave = {
      facebookAdId: adId,
      status: "PAUSED",
      type: formData.type,
      name: formData.campaignDetail.name,
      createdAt: new Date().toISOString(),
      fullFormData: serializableFormData
    };

    const campaignDocRef = doc(db, "campaigns", campaignId);
    const adSetDocRef = doc(campaignDocRef, "adsets", adSetId);
    
    await setDoc(adSetDocRef, adSetDataToSave);
    console.log(`Saved Ad Set ${adSetId} to Campaign ${campaignId} in Firestore.`);
    
    return NextResponse.json({ message: "Campaign created and saved successfully!", campaignId, adSetId, adId }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    console.error("Full API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

