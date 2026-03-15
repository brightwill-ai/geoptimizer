import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const contact = await prisma.outreachContact.findUnique({
    where: { unsubscribeToken: token },
    select: { email: true, status: true },
  });

  if (!contact) return notFound();

  // Mark as unsubscribed if not already
  if (contact.status !== "unsubscribed") {
    await prisma.outreachContact.update({
      where: { unsubscribeToken: token },
      data: { status: "unsubscribed", unsubscribedAt: new Date() },
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3efe8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: "2.5rem",
          maxWidth: 440,
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>&#10003;</div>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#171717", margin: "0 0 0.75rem 0" }}>
          You&apos;ve been unsubscribed
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#6e6e80", lineHeight: 1.6, margin: "0 0 1.5rem 0" }}>
          {contact.email} has been removed from our outreach list. You won&apos;t receive any more emails from us.
        </p>
        <p style={{ fontSize: "0.75rem", color: "#8e8ea0", margin: 0 }}>
          BrightWill — AI Visibility for Businesses
        </p>
      </div>
    </div>
  );
}
