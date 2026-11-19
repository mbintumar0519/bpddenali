import { z } from "zod";
import { formatUsPhone, isValidUsPhone } from "./usPhone";

/**
 * Pre-screen data model and eligibility triage.
 *
 * Shared by the client form and the /api/lead route so the browser and the
 * server agree on what a valid submission looks like. Nothing here decides
 * eligibility for real — it only sorts leads so coordinators can prioritize
 * callbacks. The study team confirms every requirement, and the visitor is
 * never told they do or do not qualify — only that a coordinator will follow
 * up, which keeps the door open for the many self-reported answers that turn
 * out to be wrong.
 */

export type YesNoUnsure = "yes" | "no" | "unsure" | "";
export type AgeBand = "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+" | "";
export type DiagnosisType = "bipolar-1" | "bipolar-2" | "unsure" | "";
export type ContactPreference = "Text me" | "Call me";

export type PrescreenAnswers = {
  ageRange: AgeBand;
  bipolarDiagnosis: YesNoUnsure;
  diagnosisType: DiagnosisType;
  onMedication: YesNoUnsure;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zip: string;
  contactPreference: ContactPreference;
  consentToContact: boolean;
};

export const EMPTY_ANSWERS: PrescreenAnswers = {
  ageRange: "",
  bipolarDiagnosis: "",
  diagnosisType: "",
  onMedication: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  zip: "",
  contactPreference: "Call me",
  consentToContact: false,
};

export type Triage = "likely" | "review" | "unlikely";

export type TriageResult = {
  status: Triage;
  /**
   * Participant-facing message. Deliberately the same warm tone across every
   * status — the page never tells anyone they don't qualify. `status` alone
   * drives internal callback priority (CRM tags, coordinator queue order).
   */
  message: string;
};

const CLOSE_MATCH_MESSAGE =
  "This sounds like something our research team should take a closer look at. A coordinator will review your answers and reach out.";

const GENERAL_MESSAGE =
  "Thanks for sharing that. A research coordinator will review your answers and reach out to talk through the details.";

/**
 * Sort the answers into a callback priority. Deliberately generous: any
 * "unsure" answer routes to `review` rather than `unlikely`, because
 * self-reported answers are frequently wrong and only a conversation with
 * the team settles it.
 */
export function triage(answers: PrescreenAnswers): TriageResult {
  const hardStop = answers.bipolarDiagnosis === "no";

  if (hardStop) {
    return { status: "unlikely", message: GENERAL_MESSAGE };
  }

  const strongMatch =
    answers.bipolarDiagnosis === "yes" &&
    (answers.diagnosisType === "bipolar-1" || answers.diagnosisType === "bipolar-2");

  if (strongMatch) {
    return { status: "likely", message: CLOSE_MATCH_MESSAGE };
  }

  return { status: "review", message: CLOSE_MATCH_MESSAGE };
}

/** Strict US (NANP) phone check; formatting and country code are tolerated. */
export function isValidPhone(value: string): boolean {
  return isValidUsPhone(value);
}

export const NAME_MAX = 50;
export const EMAIL_MAX = 254;

/** Letters in any language (José, Nguyễn), with inner spaces, ' - . */
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;

export function isValidName(value: string): boolean {
  const v = value.trim();
  return v.length >= 2 && v.length <= NAME_MAX && NAME_PATTERN.test(v);
}

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** 5-digit US ZIP; 00000 is not a real ZIP code. */
export function isValidZip(value: string): boolean {
  const v = value.trim();
  return /^\d{5}$/.test(v) && v !== "00000";
}

/**
 * Progressive phone formatting as the user types or pastes.
 * Tolerates US country code (+1 or leading 1) without dropping the final digit.
 * Output: `(404) 999-2734`
 */
export function formatPhone(value: string): string {
  return formatUsPhone(value);
}

export type FormErrors = Partial<Record<keyof PrescreenAnswers, string>>;

const CHOICE_ERROR = "Please choose an option.";

/** A chip question: "" is the unanswered starting value. */
const choice = <const T extends readonly [string, ...string[]]>(values: T) =>
  z
    .enum([...values, ""] as [...T, ""], { error: CHOICE_ERROR })
    .refine((v) => v !== "", CHOICE_ERROR);

/**
 * Required text: an empty value gets `emptyMessage`; a filled but invalid
 * value gets `invalidMessage`. The invalid check skips empty values, so each
 * field reports exactly one clear message.
 */
const requiredText = (
  emptyMessage: string,
  isValid: (v: string) => boolean,
  invalidMessage: string,
) =>
  z
    .string({ error: emptyMessage })
    .trim()
    .min(1, emptyMessage)
    .refine((v) => v === "" || isValid(v), invalidMessage);

const nameField = (emptyMessage: string, label: string) =>
  requiredText(
    emptyMessage,
    isValidName,
    `Enter a valid ${label} (letters only, 2–${NAME_MAX} characters).`,
  );

/**
 * Single source of truth for the pre-screen form (react-hook-form +
 * zodResolver). The form is one scrollable list rather than a step wizard,
 * so every field is validated together on submit.
 */
export const prescreenSchema = z.object({
  ageRange: choice(["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]),
  bipolarDiagnosis: choice(["yes", "no", "unsure"]),
  diagnosisType: choice(["bipolar-1", "bipolar-2", "unsure"]),
  onMedication: choice(["yes", "no", "unsure"]),
  firstName: nameField("Enter your first name.", "first name"),
  lastName: nameField("Enter your last name.", "last name"),
  phone: requiredText(
    "Enter a phone number we can reach you at.",
    isValidPhone,
    "Enter a 10-digit US phone number.",
  ),
  email: requiredText("Enter your email address.", isValidEmail, "Enter a valid email address."),
  zip: requiredText("Enter your ZIP code.", isValidZip, "Enter a valid 5-digit ZIP code."),
  contactPreference: z.enum(["Text me", "Call me"], { error: CHOICE_ERROR }),
  consentToContact: z
    .boolean({ error: "Please agree to be contacted so we can follow up." })
    .refine((v) => v, "Please agree to be contacted so we can follow up."),
});

export type PrescreenInput = z.input<typeof prescreenSchema>;

/** Plain-function validation (same rules as the schema), first error per field. */
export function validateAnswers(a: PrescreenAnswers): FormErrors {
  const result = prescreenSchema.safeParse(a);
  if (result.success) return {};
  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof PrescreenAnswers;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
