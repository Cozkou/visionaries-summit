import Image from "next/image";
import Link from "next/link";

import { StoreNav } from "@/components/store/store-nav";

const STEPS = [
  {
    step: "01",
    title: "Ingest past performance",
    body: "Line items, refunds, and variant velocity from the Pretty Fly data pack set the baseline.",
  },
  {
    step: "02",
    title: "Generate from bestsellers",
    body: "Concepts are drafted from real SKUs in products.csv — revenue, refunds, and achieved prices from the data pack.",
  },
  {
    step: "03",
    title: "Release what wins",
    body: "Only concepts that clear commercial thresholds move into early release — everything else stays in the lab.",
  },
] as const;

export default function LabPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <StoreNav variant="solid" />

      <section className="relative flex min-h-[55vh] items-end overflow-hidden bg-neutral-900">
        <Image
          src="/jacket.png"
          alt="AI design lab — jacket concept"
          fill
          priority
          className="object-cover object-center opacity-85"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-28 md:px-10 md:pb-20">
          <p className="text-[11px] font-medium tracking-[0.28em] text-white/70 uppercase">
            AI × Past Metrics
          </p>
          <h1 className="mt-3 max-w-2xl font-street text-[clamp(2.5rem,7vw,5rem)] uppercase leading-[0.92] tracking-[0.02em] text-white">
            The Lab
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75">
            We don&apos;t guess the next drop. Sales history, returns, and demand signals
            rank every concept — your favourites are what ship.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
          How it works
        </p>
        <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map(({ step, title, body }) => (
            <article key={step} className="border-t border-neutral-200 pt-6">
              <span className="font-mono text-[12px] text-neutral-400">{step}</span>
              <h2 className="mt-4 text-[15px] font-medium text-neutral-900">{title}</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-neutral-200 pt-10">
          <p className="max-w-md text-[14px] text-neutral-500">
            Explore generated concepts and commercial scoring in the creative director
            workspace.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/early-releases"
              className="inline-flex min-w-[10rem] items-center justify-center border border-neutral-900 px-6 py-3 text-[11px] font-semibold tracking-[0.2em] text-neutral-900 uppercase transition-colors hover:bg-neutral-900 hover:text-white"
            >
              View drops
            </Link>
            <Link
              href="/"
              className="inline-flex min-w-[10rem] items-center justify-center border border-neutral-200 px-6 py-3 text-[11px] font-semibold tracking-[0.2em] text-neutral-600 uppercase transition-colors hover:border-neutral-400"
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
