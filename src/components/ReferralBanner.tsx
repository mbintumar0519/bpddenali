import Image from "next/image";

const REFERRAL_URL = "https://denali-forms.netlify.app/referral.html";

type ReferralBannerProps = {
  layout?: "row" | "stack";
};

export function ReferralBanner({ layout = "row" }: ReferralBannerProps) {
  const stacked = layout === "stack";
  const headingId = stacked ? "referral-heading-thank-you" : "referral-heading";

  const card = (
    <div
      className={
        stacked
          ? "flex flex-col items-center gap-4 rounded-2xl border border-line bg-white px-5 py-7 text-center shadow-card sm:rounded-3xl sm:px-8"
          : "flex flex-col items-center gap-5 rounded-2xl border border-line bg-white px-5 py-6 text-left shadow-card sm:rounded-3xl sm:px-8 sm:py-6 lg:flex-row lg:gap-8 lg:px-8"
      }
    >
      <Image
        src="/referral-friends.png"
        alt=""
        width={632}
        height={543}
        className={stacked ? "h-[168px] w-auto" : "h-[168px] w-auto shrink-0 sm:h-[188px]"}
      />

      <div className={stacked ? "text-center" : "min-w-0 flex-1 text-center lg:text-left"}>
        <p className="mb-2.5 inline-flex rounded-full bg-sage-tint px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-sage-dark uppercase">
          Refer a friend
        </p>
        <h2
          id={headingId}
          className={`leading-[1.15] font-serif font-medium text-indigo ${
            stacked
              ? "text-[1.55rem] sm:text-[1.75rem]"
              : "text-[1.65rem] sm:text-[1.85rem] xl:whitespace-nowrap"
          }`}
        >
          Know Someone Who May Qualify?
        </h2>
        <p
          className={`mt-2 max-w-xl text-[15px] leading-relaxed text-muted ${
            stacked ? "mx-auto" : "mx-auto lg:mx-0"
          }`}
        >
          Refer a friend or family member who may be eligible and earn $50 for a successful referral.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-3 py-1.5 text-sm font-semibold text-sage-dark">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 8.5A1.5 1.5 0 014.5 7H8V5.5A1.5 1.5 0 019.5 4h1A1.5 1.5 0 0112 5.5V7h3.5A1.5 1.5 0 0117 8.5V10H3V8.5z" />
            <path d="M3 11h6.25v5.5h-4.5A1.75 1.75 0 013 14.75V11zm7.75 0H17v3.75A1.75 1.75 0 0115.25 16.5h-4.5V11z" />
          </svg>
          $50 Referral Reward
        </p>
      </div>

      {stacked ? null : <div className="hidden h-24 w-px shrink-0 bg-line lg:block" aria-hidden="true" />}

      <div className={stacked ? "flex w-full flex-col items-center gap-2.5" : "flex w-full flex-col items-center gap-2.5 lg:w-[250px] lg:shrink-0"}>
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Refer someone and earn $50"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-action px-[18px] py-3 font-bold text-white no-underline shadow-cta transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-action-dark"
        >
          <span className="whitespace-nowrap">Refer Someone</span>
        </a>
        <p className="text-center text-xs leading-snug text-muted">
          It only takes a minute to submit a referral.
        </p>
      </div>
    </div>
  );

  if (stacked) {
    return (
      <section aria-labelledby={headingId} className="mb-6 sm:mb-8">
        {card}
      </section>
    );
  }

  return (
    <section aria-labelledby={headingId} className="py-10 sm:py-14">
      <div className="container-page">{card}</div>
    </section>
  );
}

export default ReferralBanner;
