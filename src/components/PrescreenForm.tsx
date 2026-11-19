"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  EMAIL_MAX,
  EMPTY_ANSWERS,
  NAME_MAX,
  formatPhone,
  prescreenSchema,
  triage,
  type AgeBand,
  type ContactPreference,
  type DiagnosisType,
  type PrescreenAnswers,
  type PrescreenInput,
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

function UsFlag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 16"
      width="24"
      height="16"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="us-flag-shape">
          <rect width="24" height="16" rx="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#us-flag-shape)">
        <rect width="24" height="16" fill="#b22234" />
        <path
          d="M0 2.46h24M0 4.92h24M0 7.38h24M0 9.85h24M0 12.31h24M0 14.77h24"
          stroke="#fff"
          strokeWidth="1.23"
        />
        <rect width="10" height="8.62" fill="#3c3b6e" />
        <g fill="#fff" opacity="0.95">
          <circle cx="2" cy="1.6" r="0.6" />
          <circle cx="4" cy="1.6" r="0.6" />
          <circle cx="6" cy="1.6" r="0.6" />
          <circle cx="8" cy="1.6" r="0.6" />
          <circle cx="3" cy="3.2" r="0.6" />
          <circle cx="5" cy="3.2" r="0.6" />
          <circle cx="7" cy="3.2" r="0.6" />
          <circle cx="2" cy="4.8" r="0.6" />
          <circle cx="4" cy="4.8" r="0.6" />
          <circle cx="6" cy="4.8" r="0.6" />
          <circle cx="8" cy="4.8" r="0.6" />
          <circle cx="3" cy="6.4" r="0.6" />
          <circle cx="5" cy="6.4" r="0.6" />
          <circle cx="7" cy="6.4" r="0.6" />
        </g>
      </g>
    </svg>
  );
}

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

/** Fields in the order they appear on screen (first error gets focus). */
const FIELD_ORDER: (keyof PrescreenAnswers)[] = [
  "ageRange",
  "bipolarDiagnosis",
  "diagnosisType",
  "onMedication",
  "firstName",
  "lastName",
  "phone",
  "zip",
  "email",
  "consentToContact",
];

/** Radio-group `name` for each chip question. */
const CHIP_NAMES = {
  ageRange: "age_range",
  bipolarDiagnosis: "bipolar_diagnosis",
  diagnosisType: "diagnosis_type",
  onMedication: "on_medication",
} as const;

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
  const {
    register,
    control,
    setValue,
    getValues,
    clearErrors,
    handleSubmit,
    formState: { errors: fieldErrors },
  } = useForm<PrescreenInput, unknown, PrescreenAnswers>({
    resolver: zodResolver(prescreenSchema),
    defaultValues: EMPTY_ANSWERS,
    // Same behavior as before: validate on submit; editing a field clears
    // its error (no live re-validation while someone is still typing).
    mode: "onSubmit",
    // After the first submit, a field is checked again when the visitor
    // leaves it (blur). We focus the first error ourselves (see onInvalid)
    // because the chip questions are not registered inputs.
    reValidateMode: "onBlur",
    shouldFocusError: false,
  });
  const answers = useWatch({ control }) as PrescreenAnswers;
  const errors = Object.fromEntries(
    Object.entries(fieldErrors).map(([key, err]) => [key, err?.message]),
  ) as Partial<Record<keyof PrescreenAnswers, string>>;
  // Registration order = DOM order.
  const firstNameField = register("firstName");
  const lastNameField = register("lastName");
  const phoneField = register("phone");
  const zipField = register("zip");
  const emailField = register("email");
  const consentField = register("consentToContact");
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

    // sessionStorage is browser-only, so saved answers are restored on mount
    // (seeding them during render would break hydration).
    const saved = loadProgress();
    if (saved) {
      for (const field of RESUME_FIELDS) {
        const value = saved[field];
        if (value) setValue(field, value as never);
      }
    }
  }, [setValue]);

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

  const persist = () => {
    const values = getValues();
    const clinical: Partial<PrescreenAnswers> = {};
    for (const field of RESUME_FIELDS) {
      clinical[field] = values[field] as never;
    }
    try {
      sessionStorage.setItem(RESUME_KEY, JSON.stringify(clinical));
    } catch {
      // Storage unavailable — resume is a bonus, not a requirement.
    }
  };

  /** Shared change bookkeeping: start tracking, clear this field's error. */
  const touched = (key: keyof PrescreenAnswers) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("prescreen_started", { study: STUDY.protocol });
    }
    if (fieldErrors[key]) clearErrors(key);
  };

  /** Chip questions are not inputs react-hook-form can register directly. */
  const set = <K extends keyof PrescreenInput>(key: K, value: PrescreenInput[K]) => {
    touched(key);
    setValue(key, value as never, { shouldDirty: true });
    persist();
  };

  /** Move focus to the first invalid field, in on-screen order, so keyboard
   *  and screen-reader users land right on the problem. */
  const onInvalid = (invalid: Partial<Record<keyof PrescreenAnswers, unknown>>) => {
    const first = FIELD_ORDER.find((key) => invalid[key]);
    const form = formRef.current;
    if (!first || !form) {
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const chipName = CHIP_NAMES[first as keyof typeof CHIP_NAMES];
    const target = chipName
      ? (form.querySelector<HTMLInputElement>(`input[name="${chipName}"]:checked`) ??
        form.querySelector<HTMLInputElement>(`input[name="${chipName}"]`))
      : form.querySelector<HTMLElement>(`[name="${first}"]`);
    if (!target) return;
    target.focus({ preventScroll: true });
    (target.closest("fieldset") ?? target).scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /** Runs only when prescreenSchema passes (zodResolver). */
  const onValid = async (answers: PrescreenAnswers) => {
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

      <form
        method="post"
        onSubmit={(event) => void handleSubmit(onValid, onInvalid)(event)}
        noValidate
        className="mt-5"
      >
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
                  maxLength={NAME_MAX}
                  aria-invalid={errors.firstName ? true : undefined}
                  aria-describedby={errors.firstName ? `${uid}-first-error` : undefined}
                  {...firstNameField}
                  onChange={(e) => {
                    touched("firstName");
                    void firstNameField.onChange(e);
                  }}
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
                  maxLength={NAME_MAX}
                  aria-invalid={errors.lastName ? true : undefined}
                  aria-describedby={errors.lastName ? `${uid}-last-error` : undefined}
                  {...lastNameField}
                  onChange={(e) => {
                    touched("lastName");
                    void lastNameField.onChange(e);
                  }}
                />
                <FieldError id={`${uid}-last-error`} message={errors.lastName} />
              </div>
            </div>

            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor={`${uid}-phone`}>
                Mobile Phone <span className="text-[#b42318]">*</span>
              </label>
              <div
                className={cn(
                  "flex w-full min-h-[3.25rem] items-center rounded-xl border border-[#cddbe4] bg-white transition focus-within:border-accent focus-within:shadow-[0_0_0_4px_rgba(255,122,24,.14)]",
                  errors.phone &&
                    "border-[#b42318] focus-within:border-[#b42318] focus-within:shadow-[0_0_0_4px_rgba(180,35,24,.14)]",
                )}
              >
                <div
                  className="flex shrink-0 select-none items-center gap-2 border-r border-[#cddbe4] px-3.5 py-2.5 text-base font-semibold text-navy sm:text-[17px]"
                  aria-hidden="true"
                >
                  <UsFlag className="h-4 w-6 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
                  <span className="font-bold text-navy">+1</span>
                  <svg
                    className="size-3.5 text-navy/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <input
                  id={`${uid}-phone`}
                  className="w-full flex-1 bg-transparent px-4 py-2.5 text-base text-ink outline-none placeholder:text-[#94a3b8] sm:text-[17px]"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="tel"
                  placeholder="(813) 555-0123"
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
                  {...phoneField}
                  onChange={(e) => {
                    touched("phone");
                    // Mask as the user types or pastes: (404) 999-2734.
                    e.target.value = formatPhone(e.target.value);
                    void phoneField.onChange(e);
                  }}
                />
              </div>
              <FieldError id={`${uid}-phone-error`} message={errors.phone} />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                  aria-invalid={errors.zip ? true : undefined}
                  aria-describedby={errors.zip ? `${uid}-zip-error` : undefined}
                  {...zipField}
                  onChange={(e) => {
                    touched("zip");
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    void zipField.onChange(e);
                  }}
                />
                <FieldError id={`${uid}-zip-error`} message={errors.zip} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${uid}-email`}>
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  className={FIELD_CLASS}
                  type="email"
                  autoComplete="email"
                  maxLength={EMAIL_MAX}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                  {...emailField}
                  onChange={(e) => {
                    touched("email");
                    void emailField.onChange(e);
                  }}
                />
                <FieldError id={`${uid}-email-error`} message={errors.email} />
              </div>
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
                  aria-invalid={errors.consentToContact ? true : undefined}
                  aria-describedby={errors.consentToContact ? `${uid}-consent-error` : undefined}
                  {...consentField}
                  onChange={(e) => {
                    touched("consentToContact");
                    void consentField.onChange(e);
                  }}
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
