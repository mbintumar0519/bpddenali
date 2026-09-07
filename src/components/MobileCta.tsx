"use client";

import { useEffect, useState } from "react";

import { STUDY } from "@/lib/study";
import { trackEvent } from "@/lib/tracking";

/** Always-on mobile action bar — hidden while the embedded form itself is on screen. */
export default function MobileCta() {
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("screen");
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { rootMargin: "-80px 0px -120px 0px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 border-t border-line bg-white/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(53,59,94,.14)] backdrop-blur-md transition-transform duration-300 ease-out sm:hidden ${
        formVisible ? "translate-y-full" : "translate-y-0"
      }`}
      aria-hidden={formVisible}
    >
      <div className="flex flex-col justify-center leading-none">
        <span className="text-[10px] font-bold tracking-[0.08em] text-muted uppercase">
          {STUDY.compensationPerVisit}
        </span>
        <span className="text-[10px] font-bold tracking-[0.08em] text-muted uppercase">
          / Visit
        </span>
      </div>

      <a
        href="#screen"
        tabIndex={formVisible ? -1 : undefined}
        className="flex flex-1 items-center justify-center rounded-xl bg-action px-3 text-sm font-bold text-white no-underline shadow-cta"
      >
        See If I Qualify
      </a>

      <a
        href={STUDY.phoneHref}
        data-cta-location="sticky-bar"
        tabIndex={formVisible ? -1 : undefined}
        onClick={() => trackEvent("sticky_cta_clicked", { study: STUDY.protocol, type: "call" })}
        aria-label={`Call ${STUDY.siteName} at ${STUDY.phoneDisplay}`}
        className="flex items-center justify-center rounded-xl border border-line bg-white px-3.5 text-sm font-bold text-indigo no-underline"
      >
        Call
      </a>
    </div>
  );
}
