/**
 * Template variable replacement for outreach emails.
 * Replaces {variable} placeholders with contact data + computed variables.
 */

interface ContactData {
  email: string;
  businessName: string;
  firstName?: string | null;
  category?: string;
  city?: string;
  cuisineType?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  zipCode?: string | null;
  unsubscribeToken: string;
}

const CATEGORY_NOUN_MAP: Record<string, string> = {
  "Restaurants (General)": "restaurant",
  "Hotels & Lodging": "hotel",
  "Auto Repair Shops": "auto repair shop",
  "Hair Salons & Barbershops": "salon",
  "Coffee Shops & Cafes": "coffee shop",
  "Dental Offices": "dental practice",
  "Gyms & Fitness": "gym",
  "Real Estate": "realtor",
  "Law Firms": "law firm",
  "HVAC & Plumbing": "HVAC company",
  "Pet Services": "pet service",
  "Cleaning Services": "cleaning service",
  "Photography": "photographer",
  "Landscaping": "landscaper",
  "Tutoring & Education": "tutor",
  "Accounting & Tax": "accountant",
};

function getCategoryNoun(category: string): string {
  return CATEGORY_NOUN_MAP[category] || "business";
}

function getSearchExample(contact: ContactData): string {
  const city = contact.city || "your area";
  if (contact.cuisineType) {
    return `best ${contact.cuisineType} restaurant in ${city}`;
  }
  const noun = getCategoryNoun(contact.category || "");
  return `best ${noun} in ${city}`;
}

function getUnsubscribeUrl(token: string): string {
  const appUrl = (process.env.APP_URL || "https://brightwill.ai").replace(/\/$/, "");
  return `${appUrl}/api/unsubscribe/${token}`;
}

export function renderTemplate(
  template: string,
  contact: ContactData
): string {
  const vars: Record<string, string> = {
    businessName: contact.businessName,
    email: contact.email,
    firstName: contact.firstName || "there",
    category: contact.category || "",
    city: contact.city || "",
    cuisineType: contact.cuisineType || contact.category || "",
    website: contact.website || "",
    phone: contact.phone || "",
    address: contact.address || "",
    zipCode: contact.zipCode || "",
    categoryNoun: getCategoryNoun(contact.category || ""),
    searchExample: getSearchExample(contact),
    unsubscribeUrl: getUnsubscribeUrl(contact.unsubscribeToken),
  };

  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

export const SAMPLE_CONTACT: ContactData = {
  email: "owner@ajifusion.com",
  businessName: "Aji Fusion",
  firstName: "John",
  category: "Restaurants (General)",
  city: "Raleigh",
  cuisineType: "fusion",
  website: "https://ajifusion.com",
  phone: "(919) 555-0123",
  address: "123 Main St",
  zipCode: "27601",
  unsubscribeToken: "sample-token",
};

export function extractVariables(template: string): string[] {
  const matches = template.match(/\{(\w+)\}/g) || [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}
