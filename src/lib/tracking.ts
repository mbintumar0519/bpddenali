"use client";

const STORAGE_KEY = "denali_attribution_v1";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const CLICK_ID_KEYS = ["gclid", "wbraid", "gbraid", "fbclid", "msclkid"] as const;

export type Attribution = Record<string, string>;

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  __denaliAttrPushed?: boolean;
};

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  let stored: Attribution = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};

  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const value = params.get(key);
    if (value) incoming[key] = value;
  }

  const merged =
    Object.keys(incoming).length > 0 ? { ...stored, ...incoming } : stored;

  if (!merged.landing_page) merged.landing_page = window.location.href;
  if (!merged.referrer && document.referrer) merged.referrer = document.referrer;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }

  const w = window as DataLayerWindow;
  if (!w.__denaliAttrPushed) {
    w.__denaliAttrPushed = true;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "attribution_set",
      lead_source: merged.gclid
        ? "google"
        : merged.fbclid
          ? "meta"
          : merged.utm_source || "direct",
      gclid: merged.gclid || undefined,
      fbclid: merged.fbclid || undefined,
      msclkid: merged.msclkid || undefined,
      utm_source: merged.utm_source || undefined,
      utm_medium: merged.utm_medium || undefined,
      utm_campaign: merged.utm_campaign || undefined,
      utm_content: merged.utm_content || undefined,
      utm_term: merged.utm_term || undefined,
    });
  }

  return merged;
}

export function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

export function resolveFbc(fbclid?: string): string {
  const fromCookie = readCookie("_fbc");
  if (fromCookie) return fromCookie;
  if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
  return "";
}

export function trackEvent(
  event: string,
  params: Record<string, unknown> = {},
  options?: { eventID?: string },
): void {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;

  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event,
    ...params,
    ...(options?.eventID ? { event_id: options.eventID } : {}),
  });

  w.gtag?.("event", event, params);

  if (event === "prescreen_submitted" || event === "Lead") {
    if (options?.eventID) {
      w.fbq?.("track", "Lead", params, { eventID: options.eventID });
    } else {
      w.fbq?.("track", "Lead", params);
    }
    return;
  }

  w.fbq?.("trackCustom", event, params);
}
