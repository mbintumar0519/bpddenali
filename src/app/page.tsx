import Enhancements from "@/components/Enhancements";
import Hero from "@/components/Hero";
import MobileCta from "@/components/MobileCta";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  Compensation,
  Faq,
  FinalConversion,
  MeetTheDoctor,
  Testimonials,
  VisualBreak,
  WhatToExpect,
  WhoMayQualify,
} from "@/components/sections";
import { FAQS, STUDY } from "@/lib/study";

/**
 * Structured data. The FAQ block mirrors the visible accordion (search engines
 * require parity), and MedicalClinic carries the site NAP for local search.
 */
function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        name: `${STUDY.siteName} ${STUDY.city}`,
        telephone: "+1-404-999-2734",
        address: {
          "@type": "PostalAddress",
          streetAddress: STUDY.address.street,
          addressLocality: STUDY.address.locality,
          addressRegion: STUDY.address.region,
          postalCode: STUDY.address.postalCode,
          addressCountry: STUDY.address.country,
        },
      },
      {
        "@type": "MedicalStudy",
        name: STUDY.name,
        status: "Recruiting",
        healthCondition: { "@type": "MedicalCondition", name: "Bipolar Disorder" },
        studyLocation: {
          "@type": "MedicalClinic",
          name: `${STUDY.siteName} ${STUDY.city}`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <StructuredData />

      <a
        href="#screen"
        className="sr-only rounded-lg bg-indigo px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100"
      >
        Skip to the eligibility check
      </a>

      <SiteHeader />

      <main id="top">
        <Hero />
        <Testimonials />
        <MeetTheDoctor />
        <VisualBreak />
        <WhoMayQualify />
        <Compensation />
        <WhatToExpect />
        <div data-reveal>
          <Faq />
        </div>
        <FinalConversion />
      </main>

      <SiteFooter />
      <MobileCta />
      <Enhancements />
    </>
  );
}
