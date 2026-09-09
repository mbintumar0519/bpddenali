import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS, PERKS, PRIMARY_CTA, STUDY } from "@/lib/study";
import { LinkButton } from "@/components/ui";

export function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    // Root-relative so the lockup still goes home from /thank-you; on the
    // landing page itself this resolves to a same-page anchor.
    <Link href="/#top" className="inline-flex items-center no-underline">
      <Image
        src="/logo.png"
        alt={`${STUDY.siteName} — ${STUDY.city}`}
        width={2724}
        height={838}
        priority={!onDark}
        // The lockup is navy-on-transparent, unreadable on the dark footer;
        // flatten it to solid white there.
        className={`h-9 w-auto sm:h-11 ${onDark ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <>
      <div className="bg-indigo-deep px-3 py-2 text-center text-[12px] font-semibold text-white sm:py-2.5 sm:text-sm">
        <span className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          {PERKS.map((perk, i) => (
            <span key={perk} className="flex items-center gap-2.5">
              {i > 0 ? (
                <span aria-hidden="true" className="text-white/30">
                  ·
                </span>
              ) : null}
              <span className={i === 0 ? "text-sand" : undefined}>{perk}</span>
            </span>
          ))}
        </span>
      </div>

      <header className="site-header sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-xl transition-shadow duration-300">
        <div className="container-page flex min-h-[60px] items-center justify-between gap-4 sm:min-h-[70px] sm:gap-6">
          <Brand />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 text-sm font-semibold whitespace-nowrap lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-ink no-underline transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-indigo after:transition-transform after:duration-200 hover:text-indigo hover:after:scale-x-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden sm:flex">
            <LinkButton
              href="#screen"
              className="min-h-[44px] px-4 text-sm whitespace-nowrap sm:inline-flex sm:min-h-12 sm:px-6 sm:text-base"
            >
              {PRIMARY_CTA}
            </LinkButton>
          </div>

          <a
            href={STUDY.phoneHref}
            data-cta-location="mobile-header"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-3.5 text-sm font-bold text-indigo no-underline sm:hidden"
            aria-label={`Call ${STUDY.siteName} at ${STUDY.phoneDisplay}`}
          >
            Call now
          </a>
        </div>
      </header>
    </>
  );
}
