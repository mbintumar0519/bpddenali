"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type SubmitEvent } from "react";

import {
  EMPTY_ANSWERS,
  formatPhone,
  triage,
  validateAnswers,
  type AgeBand,
  type ContactPreference,
  type DiagnosisType,
  type FormErrors,
  type PrescreenAnswers,
  type YesNoUnsure,
} from "@/lib/prescreen";
import { STUDY } from "@/lib/study";
import {
  captureAttribution,
  readCookie,
  resolveFbc,
  trackEvent,
  type Attribution,
} from "@/lib/tracking";
import { buttonClass, cn } from "@/components/ui";

const FIELD_CLASS =
  "w-full min-h-[3rem] rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-indigo focus:shadow-[0_0_0_4px_rgba(53,59,94,.12)]";

const LABEL_CLASS = "mb-2 block text-[15px] font-bold leading-snug text-indigo sm:text-base";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[12px] font-semibold text-[#b4514a]">
      {message}
    </p>
  );
}

/** One row of a list-style form: a question with a compact row of chip choices. */
function ChoiceRow<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: React.ReactNode;
  options: { value: T; label: string }[];
  value: string;
  onChange: (value: T) => void;
  error?: string;
}) {
  const errorId = `${name}-error`;

  return (
    <fieldset
      className="border-0 p-0"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-2 text-[14px] leading-snug font-bold text-indigo sm:text-[15px]">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "inline-flex min-h-9 cursor-pointer items-center rounded-full border-2 px-3.5 text-[13px] font-bold transition duration-150 active:scale-[.97] sm:text-[13.5px]",
              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo",
              value === option.value
                ? "border-indigo bg-indigo text-white"
                : "border-line bg-white text-indigo hover:border-lavender hover:bg-lavender-tint",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

/**
 * Only the clinical answers are persisted — never name, phone, email, or ZIP.
 * Someone who leaves mid-form should not have contact details sitting in
 * browser storage they did not knowingly leave behind.
 */
const RESUME_KEY = "denali_prescreen_progress_v5";
const RESUME_FIELDS = ["ageRange", "bipolarDiagnosis", "diagnosisType", "onMedication"] as const;

const SCREENING_FIELDS = RESUME_FIELDS;

function loadProgress(): Partial<PrescreenAnswers> | null {
  try {
    const raw = sessionStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PrescreenAnswers>;
  } catch {
    return null;
  }
}

/** Overridable so a site can point conversions at an external confirmation URL. */
const THANK_YOU_PATH = "/thank-you";

export default function PrescreenForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<PrescreenAnswers>(EMPTY_ANSWERS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const attribution = useRef<Attribution>({});
  const startedAt = useRef<number>(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const submittedRef = useRef(false);
  const uid = useId();

  useEffect(() => {
    attribution.current = captureAttribution();
    startedAt.current = Date.now();

    const saved = loadProgress();
    if (saved && Object.values(saved).some(Boolean)) {
      // sessionStorage is browser-only, so this state cannot be seeded during
      // render without breaking hydration — syncing on mount is the fix, not
      // the smell the rule is usually pointing at.
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setAnswers((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  useEffect(() => {
    const onLeave = () => {
      if (submittedRef.current || !hasStarted.current) return;
      trackEvent("prescreen_abandoned", { study: STUDY.protocol });
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, []);

  // Move focus to the success heading so screen-reader users get the
  // confirmation instead of silently losing their place in the form.
  useEffect(() => {
    if (submitted) headingRef.current?.focus();
  }, [submitted]);

  const persist = (next: PrescreenAnswers) => {
    const clinical: Partial<PrescreenAnswers> = {};
    for (const field of RESUME_FIELDS) {
      clinical[field] = next[field] as never;
    }
    try {
      sessionStorage.setItem(RESUME_KEY, JSON.stringify(clinical));
    } catch {
      // Storage unavailable — resume is a bonus, not a requirement.
    }
  };

  const set = <K extends keyof PrescreenAnswers>(key: K, value: PrescreenAnswers[K]) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("prescreen_started", { study: STUDY.protocol });
    }

    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formErrors = validateAnswers(answers);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const triageResult = triage(answers);
    setSubmitting(true);
    setSubmitError(null);

    const eventId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const attr = attribution.current;

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          attribution: attr,
          company: honeypot,
          elapsed_ms: Date.now() - startedAt.current,
          event_id: eventId,
          fbp: readCookie("_fbp"),
          fbc: resolveFbc(attr.fbclid),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setSubmitError(data.error ?? `Something went wrong. Please call ${STUDY.phoneDisplay}.`);
        return;
      }

      trackEvent(
        "prescreen_submitted",
        {
          study: STUDY.protocol,
          prescreen_status: triageResult.status,
          content_name: `${STUDY.protocol} prescreen`,
          value: 1,
          currency: "USD",
        },
        { eventID: eventId },
      );
      submittedRef.current = true;
      try {
        sessionStorage.removeItem(RESUME_KEY);
      } catch {
        /* ignore */
      }
      setSubmitted(true);

      const external = process.env.NEXT_PUBLIC_THANK_YOU_URL;
      if (external) window.location.href = external;
      else router.push(THANK_YOU_PATH);
    } catch {
      setSubmitError(`We could not reach our servers. Please call ${STUDY.phoneDisplay}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = SCREENING_FIELDS.filter((f) => answers[f]).length;

  if (submitted) {
    return (
      <div id="screen" className="scroll-mt-24 rounded-[28px] border border-line bg-white p-6 shadow-panel sm:p-8">
        <div className="animate-step-in px-1 py-6 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-5 grid size-[64px] place-items-center rounded-full bg-sage-tint text-3xl text-sage-dark"
          >
            ✓
          </div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mb-2.5 font-serif text-2xl font-medium text-indigo outline-none"
          >
            This May Be Worth a Conversation.
          </h2>
          <p className="mb-5 text-[15px] text-muted">
            A research coordinator will reach out to review the opportunity
            with you and ask a few additional questions.
          </p>
          <a className={buttonClass("outline", "lg", "w-full")} href={STUDY.phoneHref}>
            Call {STUDY.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={formRef}
      id="screen"
      aria-labelledby={`${uid}-form-title`}
      className="scroll-mt-24 rounded-[28px] border border-line bg-white p-5 shadow-panel sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[11px] font-bold tracking-[0.14em] text-sage-dark uppercase">
            Free eligibility check
          </p>
          <h2
            id={`${uid}-form-title`}
            className="font-serif text-[22px] leading-tight font-medium text-indigo sm:text-2xl"
          >
            See If You Qualify
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-lavender-tint px-3 py-1.5 text-[11px] font-bold text-indigo">
          {answeredCount} of {SCREENING_FIELDS.length}
        </span>
      </div>
      <p className="mt-2 text-[13px] text-muted">Takes about a minute. No obligation to participate.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-5">
        {/* Honeypot — hidden from people, tempting to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input
            id={`${uid}-company`}
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="divide-y divide-line">
          <div className="pb-4">
            <ChoiceRow<AgeBand>
              name="age_range"
              legend="How old are you?"
              options={[
                { value: "18-24", label: "18–24" },
                { value: "25-34", label: "25–34" },
                { value: "35-44", label: "35–44" },
                { value: "45-54", label: "45–54" },
                { value: "55-64", label: "55–64" },
                { value: "65+", label: "65+" },
              ]}
              value={answers.ageRange}
              onChange={(v) => set("ageRange", v)}
              error={errors.ageRange}
            />
          </div>

          <div className="py-4">
            <ChoiceRow<YesNoUnsure>
              name="bipolar_diagnosis"
              legend="Have you ever been diagnosed with bipolar disorder?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "unsure", label: "Not sure" },
              ]}
              value={answers.bipolarDiagnosis}
              onChange={(v) => set("bipolarDiagnosis", v)}
              error={errors.bipolarDiagnosis}
            />
          </div>

          <div className="py-4">
            <ChoiceRow<DiagnosisType>
              name="diagnosis_type"
              legend="Which diagnosis sounds familiar?"
              options={[
                { value: "bipolar-1", label: "Bipolar I" },
                { value: "bipolar-2", label: "Bipolar II" },
                { value: "unsure", label: "I'm not sure" },
              ]}
              value={answers.diagnosisType}
              onChange={(v) => set("diagnosisType", v)}
              error={errors.diagnosisType}
            />
          </div>

          <div className="py-4">
            <ChoiceRow<YesNoUnsure>
              name="on_medication"
              legend="Currently taking medication for bipolar disorder?"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "unsure", label: "Not sure" },
              ]}
              value={answers.onMedication}
              onChange={(v) => set("onMedication", v)}
              error={errors.onMedication}
            />
          </div>

          <div className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`${uid}-firstName`}>
                  First name
                </label>
                <input
                  id={`${uid}-firstName`}
                  className={FIELD_CLASS}
                  autoComplete="given-name"
                  value={answers.firstName}
                  aria-invalid={errors.firstName ? true : undefined}
                  aria-describedby={errors.firstName ? `${uid}-first-error` : undefined}
                  onChange={(e) => set("firstName", e.target.value)}
                />
                <FieldError id={`${uid}-first-error`} message={errors.firstName} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${uid}-lastName`}>
                  Last name
                </label>
                <input
                  id={`${uid}-lastName`}
                  className={FIELD_CLASS}
                  autoComplete="family-name"
                  value={answers.lastName}
                  aria-invalid={errors.lastName ? true : undefined}
                  aria-describedby={errors.lastName ? `${uid}-last-error` : undefined}
                  onChange={(e) => set("lastName", e.target.value)}
                />
                <FieldError id={`${uid}-last-error`} message={errors.lastName} />
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`${uid}-phone`}>
                  Phone number
                </label>
                <input
                  id={`${uid}-phone`}
                  className={FIELD_CLASS}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(404) 555-0123"
                  value={answers.phone}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
                  onChange={(e) => set("phone", formatPhone(e.target.value))}
                />
                <FieldError id={`${uid}-phone-error`} message={errors.phone} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${uid}-zip`}>
                  ZIP code
                </label>
                <input
                  id={`${uid}-zip`}
                  className={FIELD_CLASS}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  value={answers.zip}
                  aria-invalid={errors.zip ? true : undefined}
                  aria-describedby={errors.zip ? `${uid}-zip-error` : undefined}
                  onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                />
                <FieldError id={`${uid}-zip-error`} message={errors.zip} />
              </div>
            </div>

            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor={`${uid}-email`}>
                Email
              </label>
              <input
                id={`${uid}-email`}
                className={FIELD_CLASS}
                type="email"
                autoComplete="email"
                value={answers.email}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                onChange={(e) => set("email", e.target.value)}
              />
              <FieldError id={`${uid}-email-error`} message={errors.email} />
            </div>

            <div className="mt-3">
              <ChoiceRow<ContactPreference>
                name="contact_preference"
                legend="Preferred way to contact me"
                options={[
                  { value: "Call me", label: "Call me" },
                  { value: "Text me", label: "Text me" },
                ]}
                value={answers.contactPreference}
                onChange={(v) => set("contactPreference", v)}
              />
            </div>

            <div className="mt-3">
              <label className="flex items-start gap-2.5 text-xs text-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-indigo"
                  checked={answers.consentToContact}
                  aria-invalid={errors.consentToContact ? true : undefined}
                  aria-describedby={errors.consentToContact ? `${uid}-consent-error` : undefined}
                  onChange={(e) => set("consentToContact", e.target.checked)}
                />
                <span>
                  I agree that {STUDY.siteName} may call, text, or email me
                  about this and other research opportunities. Message and
                  data rates may apply. I can opt out at any time.
                </span>
              </label>
              <FieldError id={`${uid}-consent-error`} message={errors.consentToContact} />
            </div>
          </div>
        </div>

        <div aria-live="assertive">
          {submitError ? (
            <p className="mt-4 rounded-xl border border-[#e3beb9] bg-[#fbf1f0] p-3 text-[13px] font-semibold text-[#b4514a]">
              {submitError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={buttonClass(
            "primary",
            "lg",
            "mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          {submitting ? "Sending…" : "Have Someone Contact Me"}
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          Private and secure. No obligation to participate.
        </p>
      </form>
    </div>
  );
}
