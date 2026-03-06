"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Textarea } from "@/components/ui";

interface FormState {
  name: string;
  email: string;
  businessName: string;
  website: string;
  notes: string;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    businessName: "",
    website: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        businessName: "",
        website: "",
        notes: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0eeea" }}>
      {/* Simple Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2.5rem",
          height: "60px",
          background: "rgba(240,238,234,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #dddbd7",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 700,
            fontSize: "1.05rem",
            letterSpacing: "-0.02em",
            color: "#0c0c0b",
            textDecoration: "none",
          }}
        >
          Visibly
        </Link>
      </nav>

      {/* Main Content */}
      <main
        style={{
          paddingTop: "7rem",
          paddingBottom: "4rem",
        }}
      >
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: "0 2.5rem",
          }}
        >
          {/* Back Link */}
          <div style={{ marginBottom: "2rem" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.875rem",
                color: "#9a9793",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#0c0c0b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#9a9793";
              }}
            >
              <svg
                style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to home
            </Link>
          </div>

          {/* Form Card */}
          <div
            style={{
              background: "#faf9f7",
              borderRadius: "24px",
              padding: "2.5rem",
              border: "1px solid #dddbd7",
              boxShadow: "0 2px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ marginBottom: "2rem" }}>
              <h1
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  letterSpacing: "-0.03em",
                  marginBottom: "0.35rem",
                  color: "#0c0c0b",
                }}
              >
                Join the Visibly waitlist
              </h1>
              <p style={{ fontSize: "0.875rem", color: "#9a9793" }}>
                Share a few details about you and your business. We&apos;ll follow up with
                a short email and a free GEO visibility check.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              {error && (
                <div
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    padding: "0.75rem 1rem",
                    fontSize: "0.875rem",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #a7f3d0",
                    background: "#d1fae5",
                    padding: "0.75rem 1rem",
                    fontSize: "0.875rem",
                    color: "#065f46",
                  }}
                >
                  ✓ You&apos;re on the list! We&apos;ll reach out soon with next steps.
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Input
                  label="Your name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@yourbusiness.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>

              <Input
                label="Business name"
                placeholder="Hana Sushi Miami"
                value={form.businessName}
                onChange={handleChange("businessName")}
              />

              <Input
                label="Website"
                type="url"
                placeholder="https://yourbusiness.com"
                value={form.website}
                onChange={handleChange("website")}
                helperText="Optional, but helpful for a better GEO audit."
              />

              <Textarea
                label="Anything else we should know?"
                placeholder="Share a bit about your business, goals, or current challenges."
                rows={4}
                value={form.notes}
                onChange={handleChange("notes")}
              />

              <div style={{ marginTop: "0.5rem" }}>
                <Button type="submit" size="lg" isLoading={isSubmitting} style={{ width: "100%" }}>
                  Join waitlist
                </Button>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#9a9793",
                    textAlign: "center",
                    marginTop: "0.75rem",
                  }}
                >
                  No spam, ever. We&apos;ll only email you about Visibly and how we can improve
                  your AI visibility.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer
        style={{
          borderTop: "1px solid #dddbd7",
          padding: "1.5rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "#faf9f7",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em" }}>
          Visibly
        </span>
        <p style={{ fontSize: "0.78rem", color: "#9a9793" }}>
          © 2025 Visibly. Generative Engine Optimization for local businesses.
        </p>
        <p style={{ fontSize: "0.78rem", color: "#9a9793" }}>hello@visibly.ai</p>
      </footer>
    </div>
  );
}
