import { NextResponse } from "next/server";

// Proxy Nominatim requests to avoid browser CORS/ad-blocker issues
// and properly identify our app per Nominatim usage policy
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&dedupe=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "BrightWill GEO Analyzer (contact@brightwill.ai)",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
