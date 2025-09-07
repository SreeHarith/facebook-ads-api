import { NextResponse } from "next/server";
import { CampaignFormData, Location } from "@/app/components/ad-manager/AdManager";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};

let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

type ApiCampaignFormData = Omit<CampaignFormData, 'campaignDetail'> & {
  campaignDetail: Omit<CampaignFormData['campaignDetail'], 'image'> & {
    image: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, existingCampaignId, existingAdSetId } = body as { formData: ApiCampaignFormData, existingCampaignId?: string, existingAdSetId?: string };

    const accessToken = process.env.FB_ACCESS_TOKEN;
    const adAccountId = process.env.FB_AD_ACCOUNT_ID;
    const pageId = process.env.FB_PAGE_ID;

    if (!accessToken || !adAccountId || !pageId) throw new Error("Missing Facebook API credentials.");
    
    let campaignId: string | undefined = existingCampaignId;
    let adSetId: string | undefined = existingAdSetId;

    // --- ENHANCED "FIND OR CREATE" LOGIC ---
    if (existingAdSetId && existingCampaignId) {
      console.log(`Using existing campaign ${existingCampaignId} and ad set ${existingAdSetId}`);
    } else if (existingCampaignId) {
      console.log(`Using existing campaign: ${existingCampaignId}, creating new ad set.`);
      const adSetPayload = createAdSetPayload(formData, existingCampaignId);
      const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adsets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adSetPayload) });
      const adSetData = await adSetResponse.json();
      if (!adSetData.id) throw new Error(`API Error (Ad Set Creation): ${JSON.stringify(adSetData.error)}`);
      adSetId = adSetData.id;
    } else {
      console.log("Creating new campaign and ad set...");
      const campaignPayload = { name: formData.campaignDetail.name, objective: formData.campaignDetail.goal, status: "PAUSED", special_ad_categories: [], access_token: accessToken };
      const campaignResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campaignPayload) });
      const campaignData = await campaignResponse.json();
      if (!campaignData.id) throw new Error(`API Error (Campaign Creation): ${JSON.stringify(campaignData.error)}`);
      campaignId = campaignData.id;

      if (!campaignId) throw new Error("Campaign ID is undefined when creating ad set.");
      const adSetPayload = createAdSetPayload(formData, campaignId);
      const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adsets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adSetPayload) });
      const adSetData = await adSetResponse.json();
      if (!adSetData.id) throw new Error(`API Error (Ad Set Creation): ${JSON.stringify(adSetData.error)}`);
      adSetId = adSetData.id;

      const campaignDataToSave = { name: formData.campaignDetail.name, objective: formData.campaignDetail.goal, createdAt: new Date().toISOString() };
      if (campaignId) await setDoc(doc(db, "campaigns", campaignId), campaignDataToSave, { merge: true });
    }

    if (!adSetId) throw new Error("Ad Set ID is undefined before creating the ad.");

    const adCreativePayload = await createAdCreativePayload(formData, accessToken, adAccountId, pageId);
    const adCreativeResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/adcreatives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adCreativePayload) });
    const adCreativeData = await adCreativeResponse.json();
    if (!adCreativeData.id) throw new Error(`API Error (Ad Creative Creation): ${JSON.stringify(adCreativeData.error)}`);
    const adCreativeId = adCreativeData.id;

    const adPayload = { name: `${formData.campaignDetail.name} Ad`, adset_id: adSetId, creative: { creative_id: adCreativeId }, status: "PAUSED", access_token: accessToken };
    const adResponse = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/ads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adPayload) });
    const adData = await adResponse.json();
    if (!adData.id) throw new Error(`API Error (Ad Creation): ${JSON.stringify(adData.error)}`);
    const adId = adData.id;
    
    if (!campaignId || !adSetId || !adId) {
      throw new Error("Could not determine Campaign, Ad Set, or Ad ID before saving to Firestore.");
    }
    
    // --- FINAL FIRESTORE SAVE LOGIC ---
    const serializableFormData = { ...formData, campaignDetail: { ...formData.campaignDetail, image: "media_uploaded" }, budget: { ...formData.budget, startDate: formData.budget.startDate ? new Date(formData.budget.startDate).toISOString() : null, endDate: formData.budget.endDate ? new Date(formData.budget.endDate).toISOString() : null } };
    
    // Data for the individual ad creative document
    const adDataToSave = {
      status: "PAUSED",
      type: formData.type,
      name: formData.campaignDetail.name,
      createdAt: new Date().toISOString(),
      fullFormData: serializableFormData
    };

    // If this is the first ad for a new ad set, we save the ad set's details.
    if (!existingAdSetId) {
      const adSetDataToSave = {
        name: formData.campaignDetail.name, // The name of the promotion/venue
        createdAt: new Date().toISOString(),
      };
      const adSetDocRef = doc(db, "campaigns", campaignId, "adsets", adSetId);
      await setDoc(adSetDocRef, adSetDataToSave);
    }

    // Always save the new ad creative's data in its own document in the 'ads' subcollection.
    const adDocRef = doc(db, "campaigns", campaignId, "adsets", adSetId, "ads", adId);
    await setDoc(adDocRef, adDataToSave);
    
    console.log(`Saved Ad ${adId} to Ad Set ${adSetId} in Campaign ${campaignId}.`);
    
    return NextResponse.json({ message: "Campaign flow completed successfully!", campaignId, adSetId, adId }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    console.error("Full API Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- HELPER FUNCTIONS ---
function createAdSetPayload(formData: ApiCampaignFormData, campaignId: string) {
  const genderMap: { [key: string]: number[] } = { male: [1], female: [2] };
  const genders = genderMap[formData.targetAudience.gender] || [];
  const targetingSpec: any = { age_min: formData.targetAudience.minAge, age_max: formData.targetAudience.maxAge, geo_locations: {} };
  if (formData.targetAudience.locations && formData.targetAudience.locations.length > 0) {
    targetingSpec.geo_locations.custom_locations = formData.targetAudience.locations.map((loc: Location) => ({ latitude: loc.lat, longitude: loc.lng, radius: formData.targetAudience.locationRange, distance_unit: 'kilometer' }));
  } else {
    targetingSpec.geo_locations.countries = ['IN'];
  }
  if (genders.length > 0) targetingSpec.genders = genders;

  const adSetPayload: any = { name: `${formData.campaignDetail.name} Ad Set`, campaign_id: campaignId, status: "PAUSED", billing_event: "IMPRESSIONS", optimization_goal: "REACH", daily_budget: formData.budget.minimumBudget * 100, bid_strategy: "LOWEST_COST_WITHOUT_CAP", targeting: targetingSpec, access_token: process.env.FB_ACCESS_TOKEN };
  if (formData.budget.startDate) { const now = new Date(); const userStartDate = new Date(formData.budget.startDate); const startTime = new Date(Math.max(userStartDate.getTime(), now.getTime() + 10 * 60 * 1000)); adSetPayload.start_time = startTime.toISOString(); }
  if (formData.budget.endDate) { const userEndDate = new Date(formData.budget.endDate); userEndDate.setHours(23, 59, 59, 999); adSetPayload.end_time = userEndDate.toISOString(); }
  return adSetPayload;
}

async function createAdCreativePayload(formData: ApiCampaignFormData, accessToken: string, adAccountId: string, pageId: string) {
  const base64Data = formData.campaignDetail.image.split(',')[1];
  const mediaBuffer = Buffer.from(base64Data, 'base64');
  let adCreativePayload: any;

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
  adCreativePayload.access_token = accessToken;
  return adCreativePayload;
}

