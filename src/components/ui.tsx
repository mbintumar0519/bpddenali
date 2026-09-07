"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const BASE_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold no-underline transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[.985]";

const VARIANTS = {
  primary: "bg-action text-white shadow-cta hover:bg-action-dark",
  secondary: "bg-sand text-indigo-deep hover:bg-sand-dark",
  outline:
    "border border-line bg-white text-indigo hover:border-action hover:bg-lavender-tint",
  ghost: "bg-lavender-tint text-indigo hover:bg-white",
  onDark: "bg-action text-white shadow-cta hover:bg-action-dark",
  outlineOnDark: "border border-white/30 bg-white/10 text-white hover:bg-white/20",
} as const;

const SIZES = {
  md: "min-h-12 px-[18px] py-3",
  lg: "min-h-14 rounded-2xl px-6 py-3.5 text-[17px]",
  xl: "min-h-14 rounded-2xl px-6 py-3.5 text-[17px] tracking-[-0.01em] sm:min-h-16 sm:px-8 sm:py-4 sm:text-lg",
} as const;

export function buttonClass(
  variant: keyof typeof VARIANTS = "primary",
  size: keyof typeof SIZES = "md",
  extra?: string,
): string {
  return cn(BASE_BUTTON, VARIANTS[variant], SIZES[size], extra);
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  children: ReactNode;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a className={buttonClass(variant, size, className)} {...props}>
      {children}
    </a>
  );
}

export function CheckBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full bg-sage-tint text-[13px] font-bold text-sage-dark",
        className,
      )}
    >
      ✓
    </span>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold tracking-[0.18em] text-sage-dark uppercase">
      {children}
    </span>
  );
}

export function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <h2 className="mt-2.5 font-serif text-[clamp(2rem,4.4vw,3rem)] leading-[1.06] font-medium tracking-[-0.02em] text-indigo text-balance">
        {title}
      </h2>
      {children ? <p className="mt-3 text-lg text-muted">{children}</p> : null}
    </div>
  );
}

/**
 * Organic wave cap for section boundaries, so backgrounds meet on a curve
 * instead of a hard rectangle edge. `fill` should match the section the wave
 * is transitioning *into*; place at the top of that section, negatively
 * margined to overlap the section above.
 */
export function SectionWave({
  fill,
  flip = false,
  className,
}: {
  fill: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
      className={cn("block h-[clamp(36px,7vw,80px)] w-full", flip && "-scale-y-100", className)}
    >
      <path
        d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,96 L0,96 Z"
        fill={fill}
      />
    </svg>
  );
}

