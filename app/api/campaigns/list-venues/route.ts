import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

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

export async function GET() {
  try {
    const campaignsQuery = query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
    const campaignSnapshots = await getDocs(campaignsQuery);

    const allPromotions = [];

    for (const campaignDoc of campaignSnapshots.docs) {
      const campaignData = campaignDoc.data();
      const adSetsRef = collection(db, "campaigns", campaignDoc.id, "adsets");
      const adSetsQuery = query(adSetsRef, orderBy("createdAt", "desc"));
      const adSetSnapshots = await getDocs(adSetsQuery);

      for (const adSetDoc of adSetSnapshots.docs) {
        const adSetData = adSetDoc.data();
        
        // --- THIS IS THE NEW LOGIC ---
        // Get the 'ads' subcollection and count the documents within it
        const adsRef = collection(adSetDoc.ref, "ads");
        const adsSnapshot = await getDocs(adsRef);
        
        allPromotions.push({
          campaignId: campaignDoc.id,
          campaignName: campaignData.name,
          adSetId: adSetDoc.id,
          promotionName: adSetData.name,
          createdAt: adSetData.createdAt,
          creativeCount: adsSnapshot.size, // Add the count of ads
        });
      }
    }

    return NextResponse.json(allPromotions);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    console.error("Error fetching promotions from Firestore:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

