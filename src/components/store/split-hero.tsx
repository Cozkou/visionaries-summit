"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ScrollReveal } from "@/components/store/scroll-reveal";
import { StoreNav } from "@/components/store/store-nav";

type SplitPanelProps = {
  image: string;
  imageAlt: string;
  label: string;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

function SplitPanel({ href, onClick, image, imageAlt, label }: SplitPanelProps) {
  const className =
    "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-black text-left";

  const content = (
    <>
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
        <span className="font-street text-[clamp(1.75rem,5vw,3.25rem)] uppercase leading-[0.95] tracking-[0.06em] text-white/85">
          {label}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function SplitHero() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black text-white">
      <div className="absolute inset-x-0 top-0 z-20">
        <StoreNav
          variant="overlay"
          minimal
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <ScrollReveal variant="left" delay={120} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <SplitPanel
            href="/early-releases"
            image="/storefront.png"
            imageAlt="Pretty Fly storefront, early releases"
            label="Early Releases"
          />
        </ScrollReveal>
        <div className="hidden shrink-0 bg-white/10 md:block md:h-auto md:w-px" aria-hidden />
        <ScrollReveal variant="right" delay={280} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <SplitPanel
            onClick={() => setSearchOpen(true)}
            image="/storefront1.png"
            imageAlt="Pretty Fly storefront, shopping"
            label="Shopping"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
