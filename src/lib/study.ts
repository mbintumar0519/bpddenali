/**
 * Single source of truth for every study-specific fact shown on the page.
 *
 * Recruitment copy is IRB-controlled: numbers, claims, and contact details must
 * be changed here (and re-approved) rather than edited into individual
 * components, so nothing drifts out of sync with approved materials.
 */

export const STUDY = {
  name: "Bipolar Depression Research Study",
  protocol: "Bipolar Depression Study",
  siteName: "Denali Health",
  siteTagline: "CLINICAL RESEARCH",
  city: "Atlanta",
  state: "Georgia",
  address: {
    street: "5329 Memorial Drive, Suite A",
    locality: "Stone Mountain",
    region: "GA",
    postalCode: "30083",
    country: "US",
  },
  phoneDisplay: "(404) 999-2734",
  phoneHref: "tel:+14049992734",
  smsHref:
    "sms:+14049992734?&body=I%20am%20interested%20in%20the%20bipolar%20depression%20research%20study.",
  compensationPerVisit: "$200",
  eligibility: {
    ageMin: 18,
  },
  investigator: {
    name: "Dr. Maria E. Johnson",
    shortName: "Dr. Johnson",
    photo: "/doctor-headshot.jpg",
    role: "Principal Investigator",
    specialty: "Board-Certified Psychiatrist",
  },
} as const;

export const PRIMARY_CTA = "See If I May Qualify";
export const SECONDARY_CTA = "Talk to Someone";

export const NAV_LINKS = [
  { href: "#qualify", label: "Could I Qualify?" },
  { href: "#compensation", label: "Compensation" },
  { href: "#doctor", label: "Your Doctor" },
  { href: "#faq", label: "FAQ" },
] as const;

/** The three offers in the announcement bar and hero benefit row. */
export const PERKS = [
  `${STUDY.compensationPerVisit} Per Visit`,
  "Free Transportation",
  "Atlanta Area",
] as const;

export const FAQS = [
  {
    q: "Do I need a bipolar diagnosis?",
    a: "This research is intended for people living with bipolar disorder who are currently experiencing depression. A research coordinator can review your diagnosis and history with you.",
  },
  {
    q: "Do I have to stop my current medication?",
    a: "Do not stop or change any prescription medication on your own. The research team will review your medications and explain what is and is not permitted.",
  },
  {
    q: "How much will I be paid?",
    a: `Participants may receive ${STUDY.compensationPerVisit} for each completed study visit.`,
  },
  {
    q: "What if I don't have transportation?",
    a: "Transportation to and from study visits is available at no cost.",
  },
  {
    q: "Does filling this out mean I have agreed to join?",
    a: "No. The online form only helps the research team determine whether it may be worth speaking with you.",
  },
  {
    q: "What happens after I submit the form?",
    a: "A research coordinator will contact you, review a few additional questions, and explain the next steps.",
  },
] as const;
