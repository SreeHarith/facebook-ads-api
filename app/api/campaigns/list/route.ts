import { NextResponse } from "next/server";
// Import Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

// --- IMPORTANT: Ensure your Firebase project config is correct ---
const firebaseConfig = {
  apiKey: "AIzaSyDlF31murWCjcplsLyDsAeXBnPF3v2j24A",
  authDomain: "facebook-ads-manager-da-salon.firebaseapp.com",
  projectId: "facebook-ads-manager-da-salon",
  storageBucket: "facebook-ads-manager-da-salon.firebasestorage.app",
  messagingSenderId: "889793352595",
  appId: "1:889793352595:web:5485da2dfb819846c94e66",
  measurementId: "G-P8BDHEML0T"
};


// Initialize Firebase (ensuring it's not re-initialized on hot reloads)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db = getFirestore(app);

export async function GET() {
  console.log("API route /api/campaigns/list hit"); // Server-side log

  try {
    const campaignsRef = collection(db, "campaigns");
    const q = query(campaignsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No documents found in the 'campaigns' collection.");
      return NextResponse.json([]); // Return an empty array if no campaigns exist
    }

    const campaigns: any[] = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${campaigns.length} campaigns. Sending to client.`); // Server-side log
    return NextResponse.json(campaigns);

  } catch (error) {
    console.error("Error fetching campaigns from Firestore:", error);
    // Ensure a structured error response is always sent
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

