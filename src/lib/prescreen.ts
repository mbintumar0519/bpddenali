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

/** Digits-only US phone check; formatting and country code are tolerated. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isValidZip(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

/** Progressive `(404) 999-2734` formatting as the user types. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export type FormErrors = Partial<Record<keyof PrescreenAnswers, string>>;

const CHOICE_ERROR = "Please choose an option.";

/**
 * The form is a single scrollable list rather than a step wizard, so every
 * field is validated together on submit.
 */
export function validateAnswers(a: PrescreenAnswers): FormErrors {
  const errors: FormErrors = {};

  if (!a.ageRange) errors.ageRange = CHOICE_ERROR;
  if (!a.bipolarDiagnosis) errors.bipolarDiagnosis = CHOICE_ERROR;
  if (!a.diagnosisType) errors.diagnosisType = CHOICE_ERROR;
  if (!a.onMedication) errors.onMedication = CHOICE_ERROR;

  if (!a.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!a.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!a.phone.trim()) {
    errors.phone = "Enter a phone number we can reach you at.";
  } else if (!isValidPhone(a.phone)) {
    errors.phone = "Enter a 10-digit US phone number.";
  }
  if (!a.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!isValidEmail(a.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!a.zip.trim()) {
    errors.zip = "Enter your ZIP code.";
  } else if (!isValidZip(a.zip)) {
    errors.zip = "Enter a 5-digit ZIP code.";
  }
  if (!a.consentToContact) {
    errors.consentToContact = "Please agree to be contacted so we can follow up.";
  }

  return errors;
}
