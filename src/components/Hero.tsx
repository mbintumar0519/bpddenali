import Image from "next/image";

import { PRIMARY_CTA, PERKS, SECONDARY_CTA, STUDY } from "@/lib/study";
import PrescreenForm from "@/components/PrescreenForm";
import { LinkButton } from "@/components/ui";

/**
 * Above the fold leads with recognition, not the study's mechanics: the
 * headline names the feeling first, and the eligibility check itself sits
 * right beside it — no second scroll or modal between "this sounds like me"
 * and answering the first question.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-cream to-lavender-tint pt-10 pb-14 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -top-28 -right-20 size-[480px] rounded-full bg-[radial-gradient(circle,rgba(169,155,187,.35),transparent_65%)] blur-2xl" />
        <div className="animate-drift absolute -bottom-36 -left-28 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(223,196,173,.4),transparent_65%)] blur-2xl [animation-delay:-6s]" />
      </div>

      <div className="container-page relative z-1 grid items-start gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(400px,0.92fr)] lg:gap-14">
        <div className="pt-2 text-center lg:text-left">
          <h1 className="animate-rise mx-auto max-w-[15ch] font-serif text-[clamp(2.5rem,8.6vw,4.5rem)] leading-[1.03] font-medium tracking-[-0.02em] text-balance text-indigo lg:mx-0">
            Does the Depression <span className="highlight">Keep Coming Back?</span>
          </h1>

          <p className="animate-rise mx-auto mt-5 max-w-[38ch] text-[clamp(1.0625rem,2.1vw,1.3rem)] leading-snug text-balance text-muted [animation-delay:120ms] sm:mt-6 lg:mx-0">
            If you&rsquo;re living with bipolar disorder and going through a
            depressive period right now, you may qualify for a research
            opportunity in {STUDY.city}.
          </p>

          <div className="animate-rise mx-auto mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-white/80 py-1.5 pr-4 pl-1.5 [animation-delay:170ms] lg:mx-0">
            <Image
              src={STUDY.investigator.photo}
              alt={STUDY.investigator.name}
              width={72}
              height={72}
              className="size-8 rounded-full object-cover ring-2 ring-white"
            />
            <span className="text-left text-xs font-semibold text-indigo">
              Led by {STUDY.investigator.name}
              <br className="sm:hidden" />
              <span className="text-muted"> · {STUDY.investigator.specialty}</span>
            </span>
          </div>

          <div className="animate-rise mt-7 grid gap-3 [animation-delay:200ms] sm:flex sm:flex-wrap sm:justify-center lg:justify-start">
            <LinkButton href="#screen" size="xl" className="w-full sm:w-auto">
              {PRIMARY_CTA}
            </LinkButton>
            <LinkButton
              href={STUDY.phoneHref}
              variant="outline"
              size="xl"
              data-cta-location="hero"
              className="w-full sm:w-auto"
            >
              {SECONDARY_CTA}
            </LinkButton>
          </div>

          <div className="animate-rise mx-auto mt-7 flex max-w-md flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm font-bold text-indigo [animation-delay:240ms] lg:mx-0 lg:justify-start">
            {PERKS.map((perk, i) => (
              <span key={perk} className="flex items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-lavender-dark">
                    ·
                  </span>
                ) : null}
                {perk}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-rise mx-auto w-full max-w-[480px] [animation-delay:220ms] lg:max-w-none">
          <PrescreenForm />
        </div>
      </div>
    </section>
  );
}
