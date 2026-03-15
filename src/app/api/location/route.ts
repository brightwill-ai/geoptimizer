import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get IP from headers (proxied through Docker/nginx)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "";

    // Use ip-api.com free tier (45 req/min, no key needed)
    // Empty string = ip-api auto-detects from requester IP
    const queryIp = (!ip || ip === "127.0.0.1" || ip === "::1") ? "" : ip;
    const res = await fetch(`http://ip-api.com/json/${queryIp}?fields=city,regionName,country`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { city: null, region: null, country: null, display: "" },
        { status: 200 }
      );
    }

    const data = await res.json();
    const city = data.city || "";
    const region = data.regionName || "";
    const country = data.country || "";
    const display = city && region ? `${city}, ${region}` : city || region || country || "";

    return NextResponse.json({ city, region, country, display });
  } catch {
    return NextResponse.json(
      { city: null, region: null, country: null, display: "" },
      { status: 200 }
    );
  }
}
