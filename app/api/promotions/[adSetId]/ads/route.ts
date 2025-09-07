import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, doc } from "firebase/firestore";

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

// We need to change the function signature to access URL parameters
export async function GET(
  request: Request,
  { params }: { params: { adSetId: string } }
) {
  try {
    const { adSetId } = params;
    // We need the campaign ID to build the full path
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId || !adSetId) {
      return NextResponse.json({ error: "Campaign ID and Ad Set ID are required." }, { status: 400 });
    }

    const adsRef = collection(db, "campaigns", campaignId, "adsets", adSetId, "ads");
    const adsQuery = query(adsRef, orderBy("createdAt", "desc"));
    const adsSnapshot = await getDocs(adsQuery);

    const ads = adsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(ads);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    console.error("Error fetching ads from Firestore:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
