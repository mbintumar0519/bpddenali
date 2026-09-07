import type { Metadata } from "next";

import SiteFooter from "@/components/SiteFooter";
import ThankYouTracking from "@/components/ThankYouTracking";
import { Brand } from "@/components/SiteHeader";
import { LinkButton } from "@/components/ui";
import { STUDY } from "@/lib/study";

/**
 * Confirmation page for a completed prescreen.
 *
 * A real URL rather than an in-place success panel: ad platforms count
 * conversions on a destination pageview, and the coordinator team can link
 * people straight here. It is noindex — this page is only meaningful to
 * someone who just submitted.
 */
export const metadata: Metadata = {
  title: `Thanks — we got your request | ${STUDY.siteName}`,
  description: `Your request to be contacted about the ${STUDY.name} has been received.`,
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

const STEPS = [
  {
    title: "A coordinator reaches out",
    body: `Within one business day, from ${STUDY.phoneDisplay}. Save the number so you know it's us.`,
  },
  {
    title: "A few more questions",
    body: "A short conversation to review your diagnosis, symptoms, and medications.",
  },
  {
    title: "You decide, together",
    body: "If it may be a fit, we'll schedule a visit and explain everything before you decide anything.",
  },
];

export default function ThankYouPage() {
  return (
    <>
      <ThankYouTracking />

      <header className="border-b border-line/80 bg-white">
        <div className="container-page flex min-h-[60px] items-center sm:min-h-[70px]">
          <Brand />
        </div>
      </header>

      <main className="bg-linear-to-b from-lavender-tint to-cream py-10 sm:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <div
              aria-hidden="true"
              className="animate-rise mx-auto mb-5 grid size-[72px] place-items-center rounded-full bg-sage-tint text-4xl text-sage-dark"
            >
              ✓
            </div>
            <h1 className="animate-rise font-serif text-[clamp(2rem,5.2vw,3rem)] leading-[1.1] font-medium text-balance text-indigo [animation-delay:80ms]">
              This May Be Worth a Conversation.
            </h1>
            <p className="animate-rise mx-auto mt-3 max-w-[46ch] text-lg text-balance text-muted [animation-delay:140ms]">
              Based on your answers, a research coordinator can review the
              opportunity with you and ask a few additional questions.
            </p>

            <div className="animate-rise mx-auto mt-6 flex max-w-sm flex-col gap-2 rounded-2xl border border-line bg-white p-4 text-base font-semibold text-indigo shadow-card [animation-delay:180ms] sm:flex-row sm:justify-center sm:gap-4">
              <span>{STUDY.compensationPerVisit} per completed study visit</span>
              <span aria-hidden="true" className="hidden text-lavender-dark sm:inline">
                ·
              </span>
              <span>Free transportation available</span>
            </div>
          </div>

          <ol className="mx-auto mt-9 grid max-w-4xl list-none gap-3 p-0 sm:mt-12 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="animate-rise rounded-2xl border border-line bg-white p-5 shadow-card sm:rounded-3xl sm:p-6"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <span className="grid size-8 place-items-center rounded-full bg-indigo text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h2 className="mt-3 mb-1.5 text-lg leading-snug font-bold text-indigo">
                  {step.title}
                </h2>
                <p className="text-[15px] leading-snug text-muted">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-9 max-w-2xl rounded-2xl border border-line bg-white p-5 shadow-card sm:mt-12 sm:rounded-3xl sm:p-6">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <LinkButton
                href={STUDY.phoneHref}
                size="lg"
                data-cta-location="thank-you"
                className="flex-1"
              >
                Call {STUDY.phoneDisplay}
              </LinkButton>
              <LinkButton href="/" variant="outline" size="lg" className="flex-1">
                Back to the study
              </LinkButton>
            </div>
            <p className="mt-3 text-center text-[13px] leading-relaxed text-muted">
              Questions before we call? Reach us any weekday, 9am–5pm.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
