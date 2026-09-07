"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/tracking";

/**
 * Page-wide behavior that would otherwise force whole sections to become
 * client components. Mounted once; everything it touches stays server-rendered
 * and works without JS, just less smoothly.
 */
export default function Enhancements() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    /* --- every "#screen" CTA lands the user *in* the embedded form, not just near it -- */
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";

      if (href.startsWith("tel:")) {
        trackEvent("phone_clicked", { location: link.dataset.ctaLocation ?? "page" });
        return;
      }
      if (href.startsWith("sms:")) {
        trackEvent("sms_clicked", { location: link.dataset.ctaLocation ?? "page" });
        return;
      }
      if (href !== "#screen") return;

      const form = document.getElementById("screen");
      if (!form) return;

      event.preventDefault();
      trackEvent("cta_clicked", { location: link.dataset.ctaLocation ?? "page" });
      form.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        const field = form.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([tabindex="-1"]), select',
        );
        field?.focus({ preventScroll: true });
      }, 600);
    };

    document.addEventListener("click", onClick);
    cleanups.push(() => document.removeEventListener("click", onClick));

    /* ------------------------------------------------- scroll-depth funnel -- */
    const milestones = [25, 50, 75, 100];
    const fired = new Set<number>();
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const pct = Math.round((scrolled / document.body.scrollHeight) * 100);
      for (const m of milestones) {
        if (pct >= m && !fired.has(m)) {
          fired.add(m);
          trackEvent("scroll_depth", { percent: m });
        }
      }

      // Lifts the sticky header off the page once it stops sitting on the hero.
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    /* ------------------------------------------------------ reveal on scroll -- */
    // The hiding CSS is gated on this attribute, so content stays visible if JS
    // never runs. Reduced-motion users get the attribute but no transition.
    document.documentElement.setAttribute("data-reveal-ready", "");

    const revealTargets = document.querySelectorAll("[data-reveal]");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
    cleanups.push(() => revealObserver.disconnect());

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
