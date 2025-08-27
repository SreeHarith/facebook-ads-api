import { NextResponse } from "next/server";

// This function handles GET requests to /api/pages
export async function GET(request: Request) {
  try {
    // Load the secret access token from your .env.local file
    const accessToken = process.env.FB_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error("Missing Facebook Access Token in .env.local file.");
    }

    // This is the Facebook Graph API endpoint to get all pages the user has a role on.
    // The 'fields' parameter specifies that we only want the name and ID for each page.
    const url = `https://graph.facebook.com/v19.0/me/accounts?fields=name,id&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error (Fetching Pages): ${data.error.message}`);
    }

    // The API returns a list of pages in the 'data' property.
    // We return this list to the frontend.
    return NextResponse.json(data.data, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching Facebook Pages:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
