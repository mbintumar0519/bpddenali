const GHL_V1_BASE = "https://rest.gohighlevel.com/v1";

export type GhlContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags?: string[];
  source?: string;
  customField?: Record<string, string>;
};

export type GhlCreateResult = {
  ok: true;
  contactId?: string;
  locationId: string;
  raw: unknown;
};

function getGhlConfig() {
  const apiKey = process.env.GOHIGHLEVEL_API_KEY?.trim();
  const locationId = process.env.GOHIGHLEVEL_LOCATION_ID?.trim();
  if (!apiKey) throw new Error("GOHIGHLEVEL_API_KEY is not configured");
  if (!locationId) throw new Error("GOHIGHLEVEL_LOCATION_ID is not configured");
  return { apiKey, locationId };
}

export function buildGhlTags(input: {
  studyId: string;
  prescreenStatus?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  lead_source?: string;
}): string[] {
  const tags = [
    "Website Lead",
    "Bipolar Depression",
    `Study: ${input.studyId}`,
  ];

  if (input.prescreenStatus) {
    tags.push(`Prescreen: ${input.prescreenStatus}`);
  }
  if (input.gclid) tags.push("Channel: Google Ads", `gclid:${input.gclid}`);
  if (input.fbclid) tags.push("Channel: Meta", `fbclid:${input.fbclid}`);
  if (input.msclkid) tags.push("Channel: Microsoft Ads", `msclkid:${input.msclkid}`);
  if (input.utm_source) tags.push(`Source: ${input.utm_source}`);
  if (input.utm_medium) tags.push(`Medium: ${input.utm_medium}`);
  if (input.utm_campaign) tags.push(`Campaign: ${input.utm_campaign}`);
  if (input.lead_source) tags.push(`Lead Source: ${input.lead_source}`);

  return [...new Set(tags)].slice(0, 25);
}

export function buildGhlCustomFields(
  fields: Record<string, string | undefined | null>,
) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = String(value);
  }
  return out;
}

export function deriveLeadSource(attr: {
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  utm_source?: string;
}): string {
  if (attr.gclid) return "Google Ads";
  if (attr.fbclid) return "Meta";
  if (attr.msclkid) return "Microsoft Ads";
  if (attr.utm_source) return attr.utm_source;
  return "Direct / Unknown";
}

export async function createGhlContact(
  payload: GhlContactPayload,
): Promise<GhlCreateResult> {
  const { apiKey, locationId } = getGhlConfig();

  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    email: payload.email,
    phone: payload.phone,
    locationId,
    tags: payload.tags ?? ["Website Lead"],
    source: payload.source ?? "Website Form",
    ...(payload.customField && Object.keys(payload.customField).length > 0
      ? { customField: payload.customField }
      : {}),
  };

  const res = await fetch(`${GHL_V1_BASE}/contacts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let raw: unknown = text;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    /* keep text */
  }

  if (!res.ok) {
    console.error("[GHL] create contact failed", res.status, text);
    throw new Error(`GoHighLevel error ${res.status}`);
  }

  const contactId =
    (raw as { contact?: { id?: string }; id?: string } | null)?.contact?.id ??
    (raw as { id?: string } | null)?.id;

  console.log("[GHL] contact created", { contactId, locationId });
  return { ok: true, contactId, locationId, raw };
}

export async function addGhlNote(contactId: string, body: string): Promise<void> {
  if (!contactId || !body.trim()) return;
  const { apiKey } = getGhlConfig();

  try {
    const res = await fetch(`${GHL_V1_BASE}/contacts/${contactId}/notes/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      console.warn("[GHL] note create failed", res.status, await res.text());
    }
  } catch (error) {
    console.warn("[GHL] note create error", error);
  }
}
