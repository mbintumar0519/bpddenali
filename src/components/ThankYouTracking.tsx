"use client";

import { useEffect, useRef } from "react";

import { STUDY } from "@/lib/study";
import { trackEvent } from "@/lib/tracking";

/**
 * Fires the conversion event tied to the thank-you *pageview*.
 *
 * The form already reports `prescreen_submitted` at the moment of the POST.
 * This is the destination-URL signal ad platforms prefer, and it is the only
 * one that still fires when someone reaches this page by other means (an
 * external redirect target, a bookmark shared by a coordinator).
 */
export default function ThankYouTracking() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent("thank_you_view", { study: STUDY.protocol });
  }, []);

  return null;
}
