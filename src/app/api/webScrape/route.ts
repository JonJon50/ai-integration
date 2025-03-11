import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    try {
        const response = await fetch(`http://127.0.0.1:5000/scrape?url=${encodeURIComponent(url || '')}`);
        const data = await response.json();

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch data from Flask service.' }, { status: 500 });
    }
}
