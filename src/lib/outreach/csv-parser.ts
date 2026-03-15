import { parse } from "csv-parse/sync";

interface ParsedContact {
  email: string;
  businessName: string;
  firstName?: string;
  category?: string;
  city?: string;
  cuisineType?: string;
  website?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  source?: string;
  customFields?: Record<string, string>;
}

// Maps our field names to common CSV column names for auto-detection
const AUTO_MAP: Record<string, string[]> = {
  email: ["Email", "email", "Email (Website)", "email_address", "E-mail"],
  businessName: ["Business Name", "businessName", "business_name", "Name", "Company"],
  firstName: ["First Name", "firstName", "first_name", "Contact Name", "Owner"],
  category: ["Category", "category", "Type", "Business Type"],
  city: ["City", "city"],
  cuisineType: ["Cuisine/Type", "cuisineType", "Cuisine", "Subcategory"],
  website: ["Website", "website", "URL", "Web"],
  phone: ["Phone", "phone", "Phone Number"],
  address: ["Full Address", "address", "Address", "Street"],
  zipCode: ["Zip Code", "zipCode", "Zip", "Postal Code"],
  source: ["Source", "source"],
};

export function detectColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(AUTO_MAP)) {
    for (const alias of aliases) {
      if (headers.includes(alias)) {
        mapping[field] = alias;
        break;
      }
    }
  }
  return mapping;
}

export interface ParseResult {
  contacts: ParsedContact[];
  errors: string[];
  duplicates: number;
  headers: string[];
}

export function parseCSV(
  content: string | Buffer,
  columnMapping: Record<string, string>
): ParseResult {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  // Get headers from first record
  const headers = records.length > 0 ? Object.keys(records[0]) : [];

  const contacts: ParsedContact[] = [];
  const errors: string[] = [];
  const seenEmails = new Set<string>();
  let duplicates = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rawEmail = (row[columnMapping.email] || "").trim();
    const businessName = (row[columnMapping.businessName] || "").trim();

    if (!rawEmail || !businessName) {
      errors.push(`Row ${i + 2}: missing email or business name`);
      continue;
    }

    // Handle semicolon-separated emails — take first valid one
    const email = rawEmail.split(";")[0].trim().toLowerCase();
    if (!email.includes("@")) {
      errors.push(`Row ${i + 2}: invalid email "${email}"`);
      continue;
    }

    if (seenEmails.has(email)) {
      duplicates++;
      continue;
    }
    seenEmails.add(email);

    // Build known fields from mapping
    const contact: ParsedContact = { email, businessName };
    if (columnMapping.firstName) contact.firstName = (row[columnMapping.firstName] || "").trim() || undefined;
    if (columnMapping.category) contact.category = (row[columnMapping.category] || "").trim() || undefined;
    if (columnMapping.city) contact.city = (row[columnMapping.city] || "").trim() || undefined;
    if (columnMapping.cuisineType) contact.cuisineType = (row[columnMapping.cuisineType] || "").trim() || undefined;
    if (columnMapping.website) contact.website = (row[columnMapping.website] || "").trim() || undefined;
    if (columnMapping.phone) contact.phone = (row[columnMapping.phone] || "").trim() || undefined;
    if (columnMapping.address) contact.address = (row[columnMapping.address] || "").trim() || undefined;
    if (columnMapping.zipCode) contact.zipCode = (row[columnMapping.zipCode] || "").trim() || undefined;
    if (columnMapping.source) contact.source = (row[columnMapping.source] || "").trim() || undefined;

    // Collect unmapped columns as custom fields
    const mappedCols = new Set(Object.values(columnMapping));
    const custom: Record<string, string> = {};
    for (const [key, val] of Object.entries(row)) {
      if (!mappedCols.has(key) && val.trim()) {
        custom[key] = val.trim();
      }
    }
    if (Object.keys(custom).length > 0) contact.customFields = custom;

    contacts.push(contact);
  }

  return { contacts, errors, duplicates, headers };
}
