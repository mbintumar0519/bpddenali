import { createHash } from "crypto";

const API_VERSION = process.env.FACEBOOK_API_VERSION?.trim() || "v21.0";

export type MetaCapiLeadInput = {
  eventId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  customData?: Record<string, string | number | undefined>;
};

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function phoneE164Digits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function readCookie(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function buildFbcFromFbclid(fbclid?: string | null): string | undefined {
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

export async function sendMetaLeadCapi(
  input: MetaCapiLeadInput,
  request: Request,
): Promise<{ skipped?: boolean; data?: unknown; error?: unknown }> {
  const pixelId =
    process.env.FACEBOOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim();
  const token = process.env.FACEBOOK_ACCESS_TOKEN?.trim();

  if (!pixelId || !token) {
    console.warn(
      "[Meta CAPI] FACEBOOK_PIXEL_ID / FACEBOOK_ACCESS_TOKEN not set — skipping",
    );
    return { skipped: true };
  }

  const cookieHeader = request.headers.get("cookie");
  const fbp = input.fbp || readCookie(cookieHeader, "_fbp");
  const fbc = input.fbc || readCookie(cookieHeader, "_fbc");

  const userData: Record<string, string | string[]> = {
    client_user_agent: request.headers.get("user-agent") ?? "",
    client_ip_address:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "",
  };

  if (input.email) userData.em = [sha256(input.email)];
  const phone = phoneE164Digits(input.phone ?? "");
  if (phone) userData.ph = [sha256(phone)];
  if (input.firstName) userData.fn = [sha256(input.firstName)];
  if (input.lastName) userData.ln = [sha256(input.lastName)];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const custom_data: Record<string, string | number> = {
    value: 1.0,
    currency: "USD",
  };
  if (input.customData) {
    for (const [k, v] of Object.entries(input.customData)) {
      if (v === undefined || v === "") continue;
      custom_data[k] = v;
    }
  }

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website" as const,
        user_data: userData,
        custom_data,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("[Meta CAPI] error", res.status, data);
      return { error: data };
    }
    console.log("[Meta CAPI] ok", JSON.stringify(data));
    return { data };
  } catch (error) {
    console.error("[Meta CAPI] request failed", error);
    return { error };
  }
}
