"use client";

import Image from "next/image";
import { useState } from "react";

import { FAQS, PRIMARY_CTA, STUDY } from "@/lib/study";
import { CheckBadge, Kicker, LinkButton, SectionHead, SectionWave } from "@/components/ui";

/* ---------------------------------------------------------- visual break ---- */

export function VisualBreak() {
  return (
    <section className="bg-cream pb-14 sm:pb-24">
      <div className="container-page">
        <div className="grain relative overflow-hidden rounded-[32px] bg-linear-160 from-indigo-deep via-indigo to-lavender-dark px-6 py-16 text-center shadow-panel sm:rounded-[40px] sm:px-12 sm:py-24">
          <div aria-hidden="true" className="animate-drift absolute -top-24 -left-16 size-[380px] rounded-full bg-sand/20 blur-3xl" />
          <div aria-hidden="true" className="animate-drift absolute -bottom-28 -right-10 size-[340px] rounded-full bg-sage/20 blur-3xl [animation-delay:-5s]" />

          <div className="relative z-1 mx-auto max-w-2xl">
            <h2 className="font-serif text-[clamp(1.75rem,4.6vw,2.75rem)] leading-[1.15] font-medium text-balance text-white">
              You Don&rsquo;t Have to Suffer Alone.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/75">
              Reach out to {STUDY.siteName} {STUDY.city} and see if a clinical
              trial is the right fit for you.
            </p>
            <div className="mt-8">
              <LinkButton href="#screen" variant="onDark" size="xl">
                See If You Qualify
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- who may qualify ---- */

const MAY_QUALIFY = [
  "You're an adult",
  "You've been diagnosed with Bipolar I or Bipolar II",
  "You're currently going through a depressive period",
  "You're still experiencing depression despite treatment",
  `You can attend appointments in the ${STUDY.city} area`,
];

export function WhoMayQualify() {
  return (
    <section id="qualify" className="scroll-mt-24 bg-cream py-14 sm:py-24">
      <div className="container-page">
        <SectionHead kicker="Who may qualify" title="Could This Be For You?" />

        <ul className="mx-auto grid max-w-4xl list-none gap-3 p-0 sm:grid-cols-2">
          {MAY_QUALIFY.map((item, i) => (
            <li
              key={item}
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-[17px] text-muted shadow-card transition duration-200 hover:-translate-y-1 hover:border-lavender hover:shadow-panel last:sm:col-span-2"
            >
              <CheckBadge />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-sm text-muted">
          Other requirements apply. Our team can review them with you.
        </p>

        <div className="mt-8 text-center">
          <LinkButton href="#screen" size="xl">
            Check In About My Symptoms
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ compensation ---- */

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5v9M14.6 9.4c0-1-1.1-1.8-2.6-1.8s-2.6.8-2.6 1.9c0 2.3 5.2 1 5.2 3.4 0 1.1-1.1 1.9-2.6 1.9s-2.6-.8-2.6-1.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVan() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <path
        d="M3 16V8.7a1 1 0 0 1 1-1h7l4.2 3.4V16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M3 16h1.7M12.7 16h3.6M19 16h1.3v-3.2a1 1 0 0 0-.32-.73L18 10.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.4" cy="16.3" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.3" cy="16.3" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Compensation() {
  return (
    <>
      <SectionWave fill="var(--color-indigo-deep)" className="bg-cream" />
      <section
        id="compensation"
        className="relative scroll-mt-24 overflow-hidden bg-indigo-deep py-14 text-white sm:py-24"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-drift absolute -top-20 -left-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(223,196,173,.18),transparent_65%)] blur-3xl" />
          <div className="animate-drift absolute -right-16 -bottom-24 size-[380px] rounded-full bg-[radial-gradient(circle,rgba(152,170,154,.18),transparent_65%)] blur-3xl [animation-delay:-6s]" />
        </div>

        <div className="container-page relative z-1">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-xs font-bold tracking-[0.18em] text-sand uppercase">
              What you receive
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.9rem,4.4vw,2.75rem)] leading-[1.12] font-medium text-balance text-white">
              Your Time Is Valued
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
            <div className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] p-7 text-center transition duration-300 hover:-translate-y-1.5 hover:bg-white/[0.1] sm:p-8 sm:text-left">
              <span
                aria-hidden="true"
                className="mx-auto grid size-14 place-items-center rounded-2xl bg-sand/15 text-sand transition duration-300 group-hover:scale-105 sm:mx-0"
              >
                <IconCoin />
              </span>
              <p className="mt-5 font-serif text-[clamp(3rem,8vw,4.25rem)] leading-none font-medium tracking-[-0.02em] text-white">
                {STUDY.compensationPerVisit}
              </p>
              <p className="mt-1.5 text-base font-semibold text-sand">Per Study Visit</p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Your time matters. Participants may receive {STUDY.compensationPerVisit}{" "}
                for each completed study visit.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] p-7 text-center transition duration-300 hover:-translate-y-1.5 hover:bg-white/[0.1] sm:p-8 sm:text-left">
              <span
                aria-hidden="true"
                className="mx-auto grid size-14 place-items-center rounded-2xl bg-sage/20 text-sage transition duration-300 group-hover:scale-105 sm:mx-0"
              >
                <IconVan />
              </span>
              <h3 className="mt-5 font-serif text-2xl font-medium text-white">
                Transportation Is On Us
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Free transportation to and from study visits is available so
                getting to the research center doesn&rsquo;t have to be
                another thing to worry about.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <LinkButton href="#screen" variant="onDark" size="xl">
              {PRIMARY_CTA}
            </LinkButton>
            <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-white/50">
              Compensation is provided for completed study visits in accordance
              with the approved study payment schedule.
            </p>
          </div>
        </div>
      </section>
      <SectionWave fill="var(--color-cream)" flip className="bg-indigo-deep" />
    </>
  );
}

/* -------------------------------------------------------------- what to expect ---- */

const STEPS = [
  {
    title: "Talk With Us",
    body: "Answer a few questions about your bipolar diagnosis, symptoms, and medications.",
  },
  {
    title: "Come In For a Visit",
    body: "If the study may be a match, our team will schedule a visit and explain everything before you decide whether to participate.",
  },
  {
    title: "Take Part in the Research",
    body: "If you qualify and choose to join, you'll attend scheduled visits and complete study activities with the research team.",
  },
];

export function WhatToExpect() {
  return (
    <section id="expect" className="scroll-mt-24 bg-cream py-14 sm:py-24">
      <div className="container-page">
        <SectionHead kicker="What happens next" title="What Would I Actually Have to Do?" />

        <ol className="mx-auto grid max-w-5xl list-none gap-5 p-0 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              data-reveal
              style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
              className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-7"
            >
              <span className="grid size-11 place-items-center rounded-full bg-sand-tint font-serif text-lg font-medium text-sand-dark">
                {index + 1}
              </span>
              <h3 className="mt-4 mb-1.5 text-lg font-bold text-indigo">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-line bg-sage-tint px-6 py-4 text-center text-[15px] font-medium text-sage-dark sm:text-base">
          You&rsquo;ll receive {STUDY.compensationPerVisit} for each completed study
          visit. Free transportation is available.
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ meet the doctor ---- */

const DOCTOR_POINTS = [
  "Reviews your diagnosis, symptoms, and medication history with you",
  "Answers every question about the study before you decide anything",
  "Oversees your safety and care for the full length of the study",
];

export function MeetTheDoctor() {
  return (
    <section id="doctor" className="scroll-mt-24 bg-lavender-tint py-14 sm:py-24">
      <div className="container-page">
        <div className="mx-auto grid max-w-4xl items-center gap-8 overflow-hidden rounded-[28px] border border-line bg-white shadow-panel sm:grid-cols-[0.85fr_1.15fr]">
          <div className="relative flex flex-col items-center justify-center gap-4 bg-linear-160 from-indigo-deep via-indigo to-lavender-dark px-8 py-10 text-center text-white">
            <div aria-hidden="true" className="animate-drift absolute -bottom-16 -left-16 size-48 rounded-full border border-white/12" />
            <Image
              src={STUDY.investigator.photo}
              alt={STUDY.investigator.name}
              width={400}
              height={400}
              className="relative z-1 size-28 rounded-full border-4 border-white/25 object-cover shadow-[0_18px_45px_rgba(0,0,0,.25)] sm:size-32"
            />
            <div className="relative z-1">
              <p className="text-lg font-semibold">{STUDY.investigator.name}</p>
              <p className="mt-1 text-sm text-white/70">{STUDY.investigator.role}</p>
            </div>
          </div>

          <div className="p-7 sm:p-9">
            <Kicker>Meet the study doctor</Kicker>
            <h2 className="mt-2.5 font-serif text-[clamp(1.6rem,3.6vw,2.1rem)] leading-[1.15] font-medium text-balance text-indigo">
              {STUDY.investigator.specialty}
            </h2>
            <p className="mt-3 text-[17px] leading-relaxed text-muted">
              {STUDY.investigator.shortName} leads this research at{" "}
              {STUDY.siteName}, guiding you from your first conversation
              through every study visit.
            </p>

            <div className="mt-5 grid gap-3">
              {DOCTOR_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckBadge className="mt-0.5" />
                  <p className="text-[15px] text-muted">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <LinkButton href="#screen" size="lg" className="w-full sm:w-auto">
                {PRIMARY_CTA}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- testimonials ---- */

const REVIEWS = [
  {
    quote:
      "My providers were very welcoming, considerate, and knowledgeable. I finally felt like someone was listening.",
    name: "Steve L.",
  },
  {
    quote: "The staff made the whole process easy to understand. I never felt rushed or judged.",
    name: "Vivian F.",
  },
  {
    quote: "Great experience from the first phone call. I'd recommend them to anyone considering it.",
    name: "Darius B.",
  },
];

/**
 * General clinic reviews, not claims about this study or its outcomes — the
 * disclaimer below is required for that reason. Placeholder quotes; swap for
 * verified, IRB-approved reviews before launch.
 */
export function Testimonials() {
  return (
    <section className="bg-sand-tint py-14 sm:py-20">
      <div className="container-page">
        <SectionHead title="What people say" />
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <figure
              key={review.name}
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
              className="m-0 rounded-[22px] border border-line bg-white p-6 shadow-card"
            >
              <div aria-hidden="true" className="mb-3 tracking-[3px] text-sand-dark">
                ★★★★★
              </div>
              <span className="sr-only">Rated 5 out of 5.</span>
              <blockquote className="m-0 mb-4 text-[16px] leading-snug text-muted">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="text-sm font-bold text-indigo">{review.name}</figcaption>
            </figure>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
          General patient reviews of {STUDY.siteName} — not claims about this
          study or its results.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ faq ---- */

export function Faq() {
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([0]));

  const toggle = (index: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section id="faq" className="scroll-mt-24 bg-lavender-tint py-14 sm:py-24">
      <div className="container-page">
        <SectionHead title="FAQ" />
        <div className="mx-auto max-w-3xl">
          {FAQS.map((faq, index) => {
            const isOpen = openSet.has(index);
            return (
              <div
                key={faq.q}
                className={`group mb-2.5 rounded-2xl border bg-white px-4 transition-colors duration-300 sm:px-6 ${isOpen ? "border-lavender" : "border-line hover:border-lavender"}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(index)}
                  className="relative flex w-full cursor-pointer list-none items-center justify-between gap-4 py-5 pr-12 text-left text-lg font-bold text-indigo"
                >
                  <span>{faq.q}</span>
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 right-0 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-lavender-tint text-indigo transition-colors duration-300"
                  >
                    <span className="relative block size-3">
                      <span className="absolute top-1/2 left-1/2 h-0.5 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
                      <span
                        className={`absolute top-1/2 left-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${isOpen ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"}`}
                      />
                    </span>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="m-0 pb-5 text-muted">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- final conversion ---- */

export function FinalConversion() {
  return (
    <section className="relative overflow-hidden bg-linear-160 from-indigo-deep via-indigo to-lavender-dark py-16 text-center text-white sm:py-24">
      <div aria-hidden="true" className="animate-drift pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(223,196,173,.2),transparent_62%)]" />
      <div className="container-page relative z-1">
        <h2 className="mx-auto max-w-[18ch] font-serif text-[clamp(2.25rem,5.4vw,3.5rem)] leading-[1.08] font-medium text-balance">
          Still Not Feeling Like Yourself?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/75">
          If you&rsquo;re living with bipolar disorder and depression has been
          weighing you down, see whether an {STUDY.city} research opportunity
          could be an option.
        </p>
        <p className="mt-5 text-base font-semibold text-white/90">
          {STUDY.compensationPerVisit} per completed visit. Free transportation.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="#screen" variant="onDark" size="xl" className="w-full sm:w-auto">
            {PRIMARY_CTA}
          </LinkButton>
          <LinkButton
            href={STUDY.phoneHref}
            variant="outlineOnDark"
            size="xl"
            data-cta-location="final"
            className="w-full sm:w-auto"
          >
            Call the Research Team
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
