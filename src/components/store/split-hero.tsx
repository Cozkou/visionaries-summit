"use client";

import Image from "next/image";
import Link from "next/link";

import { StoreNav } from "@/components/store/store-nav";

type SplitPanelProps = {
  href: string;
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  cta: string;
};

function SplitPanel({ href, image, imageAlt, eyebrow, title, cta }: SplitPanelProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-1 overflow-hidden"
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/35" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center text-white md:px-10">
        <p className="mb-3 text-[11px] font-medium tracking-[0.28em] uppercase md:mb-4 md:text-[12px]">
          {eyebrow}
        </p>
        <h2 className="font-street text-[clamp(2.25rem,6vw,4.5rem)] uppercase leading-[0.92] tracking-[0.02em]">
          {title}
        </h2>
        <span className="mt-8 inline-flex min-w-[9.5rem] items-center justify-center border border-white/80 bg-black/30 px-6 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase backdrop-blur-sm transition-colors duration-300 group-hover:bg-black/50 md:mt-10">
          {cta}
        </span>
      </div>
    </Link>
  );
}

export function SplitHero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col bg-black">
      <div className="absolute inset-x-0 top-0 z-20">
        <StoreNav variant="overlay" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SplitPanel
          href="/early-releases"
          image="/varsity.PNG"
          imageAlt="Pretty Fly varsity jacket — early release drop"
          eyebrow="Members First"
          title="Early Releases"
          cta="Discover"
        />
        <div className="hidden w-px shrink-0 bg-white/15 md:block" aria-hidden />
        <SplitPanel
          href="/lab"
          image="/varsity2.PNG"
          imageAlt="Pretty Fly design lab — AI concepts from sales data"
          eyebrow="AI × Past Metrics"
          title="The Lab"
          cta="Explore"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6 md:pb-8">
        <Link
          href="#drop-countdown"
          aria-label="Scroll to next drop"
          className="text-white/50 transition-colors hover:text-white/80"
        >
          <svg viewBox="0 0 10 18" fill="none" className="h-6 w-auto md:h-7">
            <path
              d="M5 1v12M1 9l4 6 4-6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
