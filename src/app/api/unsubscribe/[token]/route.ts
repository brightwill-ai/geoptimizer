import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

// GET — public unsubscribe endpoint (no auth)
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const contact = await prisma.outreachContact.findUnique({
    where: { unsubscribeToken: token },
  });

  if (!contact) {
    return NextResponse.redirect(new URL("/unsubscribe/invalid", process.env.APP_URL || "https://brightwill.ai"));
  }

  if (contact.status !== "unsubscribed") {
    await prisma.outreachContact.update({
      where: { id: contact.id },
      data: { status: "unsubscribed", unsubscribedAt: new Date() },
    });
  }

  // Redirect to branded confirmation page
  const appUrl = (process.env.APP_URL || "https://brightwill.ai").replace(/\/$/, "");
  return NextResponse.redirect(`${appUrl}/unsubscribe/${token}`);
}
