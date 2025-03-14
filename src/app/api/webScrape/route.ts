// webScrape API route to fetch data from Flask service
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing 'url' parameter." }, { status: 400 });
    }

    try {
        // ✅ Debugging: Log FLASK_API_URL
        console.log("FLASK_API_URL:", process.env.FLASK_API_URL);

        const flaskAPI =
            process.env.NODE_ENV === "development"
                ? `http://127.0.0.1:8080/scrape?url=${encodeURIComponent(url)}`
                : `${process.env.FLASK_API_URL}/scrape?url=${encodeURIComponent(url)}`;

        console.log("Requesting:", flaskAPI);

        const response = await fetch(flaskAPI, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",  // 🔹 Ensures proper API communication
            },
        });

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

