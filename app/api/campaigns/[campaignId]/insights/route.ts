import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const campaignId = params.campaignId;
    const accessToken = process.env.FB_ACCESS_TOKEN;

    if (!campaignId || !accessToken) {
      return NextResponse.json(
        { error: "Missing campaign ID or access token" },
        { status: 400 }
      );
    }

    const fields = "impressions,reach,spend,clicks,ctr,cpc,actions";
    const date_preset = "last_30d";

    const apiUrl = `https://graph.facebook.com/v19.0/${campaignId}/insights?fields=${fields}&date_preset=${date_preset}&access_token=${accessToken}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch insights from Facebook API");
    }

    // --- THIS IS THE FIX ---
    // Check if the data array from Facebook exists and has content.
    // If it's empty, it means the campaign has no stats for the date range.
    const insights = data.data && data.data.length > 0 ? data.data[0] : null;

    // Return the insights object or null. Both are valid JSON.
    return NextResponse.json(insights);
    // --- END OF FIX ---

  } catch (error) {
    let errorMessage = "An unknown server error occurred.";
    console.error("Full API Error Object:", error);

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

