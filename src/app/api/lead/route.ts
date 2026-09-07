import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  isValidEmail,
  isValidPhone,
  isValidZip,
  triage,
  type PrescreenAnswers,
} from "@/lib/prescreen";
import { STUDY } from "@/lib/study";
import {
  addGhlNote,
  buildGhlCustomFields,
  buildGhlTags,
  createGhlContact,
  deriveLeadSource,
} from "@/lib/gohighlevel";
import { buildFbcFromFbclid, sendMetaLeadCapi } from "@/lib/metaCapi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT_MAX;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function attrString(
  attribution: Record<string, unknown> | undefined,
  key: string,
): string {
  const value = attribution?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function buildScreenerNote(input: {
  answers: PrescreenAnswers;
  resultStatus: string;
  leadSource: string;
  attribution: Record<string, unknown> | undefined;
  eventId: string;
}): string {
  const a = input.answers;
  const attr = input.attribution;
  return [
    `Bipolar depression prescreen — ${STUDY.protocol}`,
    `Site: ${STUDY.siteName} ${STUDY.city}`,
    `Submitted: ${new Date().toISOString()}`,
    `Prescreen status: ${input.resultStatus}`,
    `Lead source: ${input.leadSource}`,
    `Contact preference: ${a.contactPreference}`,
    `ZIP: ${a.zip || "—"}`,
    "",
    "Screener answers:",
    `• Age range: ${a.ageRange || "—"}`,
    `• Ever diagnosed with bipolar disorder: ${a.bipolarDiagnosis || "—"}`,
    `• Diagnosis type: ${a.diagnosisType || "—"}`,
    `• Currently on bipolar medication: ${a.onMedication || "—"}`,
    "",
    "Attribution:",
    `• utm_source: ${attrString(attr, "utm_source") || "—"}`,
    `• utm_medium: ${attrString(attr, "utm_medium") || "—"}`,
    `• utm_campaign: ${attrString(attr, "utm_campaign") || "—"}`,
    `• utm_content: ${attrString(attr, "utm_content") || "—"}`,
    `• utm_term: ${attrString(attr, "utm_term") || "—"}`,
    `• gclid: ${attrString(attr, "gclid") || "—"}`,
    `• fbclid: ${attrString(attr, "fbclid") || "—"}`,
    `• event_id: ${input.eventId || "—"}`,
    `• landing_page: ${attrString(attr, "landing_page") || "—"}`,
    `• referrer: ${attrString(attr, "referrer") || "—"}`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please call us instead." },
      { status: 429 },
    );
  }

  if (str(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const elapsedMs = Number(body.elapsed_ms);
  if (Number.isFinite(elapsedMs) && elapsedMs < 3000) {
    return NextResponse.json({ ok: true });
  }

  const answers = (body.answers ?? {}) as PrescreenAnswers;
  const attribution = (body.attribution ?? {}) as Record<string, unknown>;
  const eventId = str(body.event_id);
  const fbp = str(body.fbp);
  const fbcFromClient = str(body.fbc);

  const firstName = str(answers.firstName);
  const lastName = str(answers.lastName);
  const phone = str(answers.phone);
  const email = str(answers.email);
  const zip = str(answers.zip);

  if (!firstName || !lastName) {
    return NextResponse.json(
      { ok: false, error: "Please include your first and last name." },
      { status: 400 },
    );
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { ok: false, error: "Please include a valid 10-digit phone number." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please include a valid email address." },
      { status: 400 },
    );
  }
  if (!isValidZip(zip)) {
    return NextResponse.json(
      { ok: false, error: "Please include a valid 5-digit ZIP code." },
      { status: 400 },
    );
  }
  if (!answers.consentToContact) {
    return NextResponse.json(
      { ok: false, error: "Consent to be contacted is required." },
      { status: 400 },
    );
  }

  if (
    !process.env.GOHIGHLEVEL_API_KEY?.trim() ||
    !process.env.GOHIGHLEVEL_LOCATION_ID?.trim()
  ) {
    console.warn("[lead] GOHIGHLEVEL_API_KEY or GOHIGHLEVEL_LOCATION_ID is not set");
    return NextResponse.json(
      {
        ok: false,
        error: `We could not save your information. Please call ${STUDY.phoneDisplay}.`,
      },
      { status: 503 },
    );
  }

  const result = triage(answers);
  const gclid = attrString(attribution, "gclid");
  const fbclid = attrString(attribution, "fbclid");
  const msclkid = attrString(attribution, "msclkid");
  const utm_source = attrString(attribution, "utm_source");
  const utm_medium = attrString(attribution, "utm_medium");
  const utm_campaign = attrString(attribution, "utm_campaign");
  const utm_content = attrString(attribution, "utm_content");
  const utm_term = attrString(attribution, "utm_term");

  const leadSource = deriveLeadSource({ gclid, fbclid, msclkid, utm_source });
  const fbc = fbcFromClient || buildFbcFromFbclid(fbclid) || "";

  const tags = buildGhlTags({
    studyId: STUDY.protocol,
    prescreenStatus: result.status,
    gclid,
    fbclid,
    msclkid,
    utm_source,
    utm_medium,
    utm_campaign,
    lead_source: leadSource,
  });

  const customField = buildGhlCustomFields({
    study_id: STUDY.protocol,
    site: `${STUDY.siteName} ${STUDY.city}`,
    age_range: answers.ageRange,
    bipolar_diagnosis: answers.bipolarDiagnosis,
    diagnosis_type: answers.diagnosisType,
    on_medication: answers.onMedication,
    zip: answers.zip,
    contact_preference: answers.contactPreference,
    prescreen_status: result.status,
    lead_source: leadSource,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    google_click_id: gclid,
    fbclid,
    msclkid,
    event_id: eventId,
    landing_page: attrString(attribution, "landing_page"),
    referrer: attrString(attribution, "referrer"),
  });

  try {
    const ghl = await createGhlContact({
      firstName,
      lastName,
      email,
      phone,
      tags,
      source: `Website — ${STUDY.protocol}`,
      customField,
    });

    if (ghl.contactId) {
      await addGhlNote(
        ghl.contactId,
        buildScreenerNote({
          answers,
          resultStatus: result.status,
          leadSource,
          attribution,
          eventId,
        }),
      );
    }
  } catch (error) {
    console.error("[lead] GoHighLevel failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: `We could not save your information. Please call ${STUDY.phoneDisplay}.`,
      },
      { status: 502 },
    );
  }

  const landing =
    attrString(attribution, "landing_page") ||
    request.headers.get("referer") ||
    undefined;

  await sendMetaLeadCapi(
    {
      eventId: eventId || undefined,
      email,
      phone,
      firstName,
      lastName,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      eventSourceUrl: landing,
      customData: {
        content_name: `${STUDY.protocol} prescreen`,
        study_id: STUDY.protocol,
        prescreen_status: result.status,
        lead_source: leadSource,
        utm_source: utm_source || undefined,
        utm_medium: utm_medium || undefined,
        utm_campaign: utm_campaign || undefined,
      },
    },
    request,
  );

  return NextResponse.json({ ok: true, forwarded: true });
}
