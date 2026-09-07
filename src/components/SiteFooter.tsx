import Link from "next/link";

import { STUDY } from "@/lib/study";
import { Brand } from "@/components/SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="bg-indigo-deep px-0 pt-10 pb-28 text-[13px] text-[#c8c8dc] sm:pt-12 sm:pb-12">
      <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-11">
        <div>
          <div className="mb-4">
            <Brand onDark />
          </div>
          <address className="not-italic">
            {STUDY.address.street}
            <br />
            {STUDY.address.locality}, {STUDY.address.region} {STUDY.address.postalCode}
            <br />
            <a href={STUDY.phoneHref} className="text-[#d9d9ea]">
              {STUDY.phoneDisplay}
            </a>
          </address>

          <p className="mt-5 max-w-[26rem] rounded-2xl border border-white/12 bg-white/6 p-4 text-[#d9d9ea]">
            <strong className="text-white">
              This website is not a crisis or emergency service.
            </strong>{" "}
            If you or someone you know is in crisis or having thoughts of
            suicide, call or text{" "}
            <a href="tel:988" className="font-semibold text-white underline">
              988
            </a>{" "}
            (Suicide &amp; Crisis Lifeline) or call 911.
          </p>
        </div>

        <div>
          <nav aria-label="Footer" className="mb-4 flex flex-wrap gap-4.5">
            {/* Root-relative: the footer also renders on /thank-you. */}
            <Link href="/#screen" className="text-[#d9d9ea]">
              Check eligibility
            </Link>
            <Link href="/#faq" className="text-[#d9d9ea]">
              FAQ
            </Link>
            <Link href="/privacy" className="text-[#d9d9ea]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[#d9d9ea]">
              Terms
            </Link>
          </nav>

          <p className="max-w-[54rem] text-[#a3a3ba]">
            <strong className="text-[#dcdcee]">Important:</strong> This page
            describes a research opportunity related to bipolar depression.
            Participation is voluntary, benefits are not guaranteed, and study
            procedures carry risks that the study team will review with you
            during informed consent. Checking eligibility does not enroll you
            in the study or create a doctor-patient relationship. Do not stop
            or change any prescribed medication in order to participate.
            Compensation amounts reflect the current IRB-approved consent
            schedule for completed study visits and may change; the final
            consent form controls.
          </p>

          <p className="mt-4 text-[#a3a3ba]">
            © {new Date().getFullYear()} {STUDY.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
