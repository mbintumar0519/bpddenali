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
          ? "flex flex-col items-center gap-4 rounded-[28px] border border-gray-100 bg-white px-5 py-7 text-center shadow-[0_6px_16px_rgba(15,23,42,0.05)] sm:px-8"
          : "flex flex-col items-center gap-5 rounded-[28px] border border-gray-100 bg-white px-5 py-6 text-left shadow-[0_6px_16px_rgba(15,23,42,0.05)] sm:px-8 sm:py-5 lg:flex-row lg:gap-8 lg:px-8"
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
        <p className="mb-2.5 inline-flex rounded-full bg-[#e8f1ff] px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[#2a5ec4] uppercase">
          Refer a friend
        </p>
        <h2
          id={headingId}
          className={`leading-[1.15] font-extrabold text-[#12224d] ${
            stacked
              ? "text-[1.55rem] sm:text-[1.75rem]"
              : "text-[1.65rem] sm:text-[1.85rem] xl:whitespace-nowrap"
          }`}
        >
          Know Someone Who May Qualify?
        </h2>
        <p
          className={`mt-2 max-w-xl text-[15px] leading-relaxed text-[#5c677a] ${
            stacked ? "mx-auto" : "mx-auto lg:mx-0"
          }`}
        >
          Refer a friend or family member who may be eligible and earn $50 for a successful referral.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e6f7ee] px-3 py-1.5 text-sm font-semibold text-[#1c7a46]">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 8.5A1.5 1.5 0 014.5 7H8V5.5A1.5 1.5 0 019.5 4h1A1.5 1.5 0 0112 5.5V7h3.5A1.5 1.5 0 0117 8.5V10H3V8.5z" />
            <path d="M3 11h6.25v5.5h-4.5A1.75 1.75 0 013 14.75V11zm7.75 0H17v3.75A1.75 1.75 0 0115.25 16.5h-4.5V11z" />
          </svg>
          $50 Referral Reward
        </p>
      </div>

      {stacked ? null : <div className="hidden h-24 w-px shrink-0 bg-[#e5eaf3] lg:block" aria-hidden="true" />}

      <div className={stacked ? "flex w-full flex-col items-center gap-2.5" : "flex w-full flex-col items-center gap-2.5 lg:w-[250px] lg:shrink-0"}>
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Refer someone and earn $50"
          className="group inline-flex h-11 w-auto cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#0B2A6B] via-[#1E3A8A] to-[#2563EB] px-5 text-sm font-bold whitespace-nowrap text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2563EB]/40"
        >
          <span className="whitespace-nowrap">Refer Someone</span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l6 6-6 6M19 12H5" />
            </svg>
          </span>
        </a>
        <p className="text-center text-xs leading-snug text-[#5f6b7a]">
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
    <section aria-labelledby={headingId} className="bg-white pt-12 pb-4 sm:pt-16 sm:pb-6">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">{card}</div>
    </section>
  );
}

export default ReferralBanner;
