import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    // 🛑 Validate the URL before proceeding
    if (!url) {
        return NextResponse.json({ error: "Missing 'url' parameter." }, { status: 400 });
    }

    try {
        const flaskAPI = `http://127.0.0.1:5000/scrape?url=${encodeURIComponent(url)}`;
        const response = await fetch(flaskAPI, { method: "GET" });

        // ✅ Check if Flask API responds successfully
        if (!response.ok) {
            return NextResponse.json(
                { error: `Flask API error: ${response.status} - ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching data from Flask:", error);
        return NextResponse.json({ error: "Failed to fetch data from Flask service." }, { status: 500 });
    }
}

