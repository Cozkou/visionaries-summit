import Link from "next/link";

import { ConceptHero } from "@/components/store/concept-hero";
import { DropCountdown } from "@/components/store/drop-countdown";
import { buildSocialProof } from "@/lib/social-proof";
import type { PublicListing } from "@/lib/public-listings";

interface Props {
  listing: PublicListing;
}

export function LatestPublishedSection({ listing }: Props) {
  const proof = buildSocialProof(listing.counts);
  const statusLabel =
    listing.status === "published" ? "Live now" : "Early access";

  return (
    <section
      id="latest-drop"
      className="-mt-px px-6 py-10 md:px-[8vw] md:py-14"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
            Latest drop · fresh from the lab
          </p>
          <DropCountdown releaseAt={listing.releaseAt} variant="hero" />
        </div>

        <div className="grid grid-cols-1 gap-6 border border-slate-200/90 bg-white p-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 md:p-7">
          <Link
            href={`/early-releases/${listing.slug}`}
            className="group block"
          >
            <ConceptHero
              name={listing.name}
              productType={listing.productType}
              imageUrl={listing.imageUrl}
              sourceProductId={listing.sourceProductId}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
          </Link>

          <div className="flex min-w-0 flex-col gap-5 md:py-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-slate-900 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.2em] text-white uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {statusLabel}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {listing.productType} · {listing.targetAudience}
              </span>
            </div>

            <div>
              <h2 className="font-street text-[clamp(2rem,4.6vw,3.2rem)] uppercase leading-[0.95] tracking-[0.01em] text-slate-900">
                {listing.name}
              </h2>
              <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-slate-600">
                {listing.description}
              </p>
            </div>

            {listing.highlights.length > 0 && (
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {listing.highlights.slice(0, 4).map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-[12px] text-slate-600"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-900"
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="text-[20px] font-semibold tabular-nums text-slate-900">
                £{Math.round(listing.retailPrice)}
              </span>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  proof.isCold ? "text-slate-400" : "text-emerald-700"
                }`}
              >
                {proof.text}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/early-releases/${listing.slug}`}
                className="inline-flex h-11 items-center bg-slate-900 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
              >
                Reserve a pair →
              </Link>
              <Link
                href="/early-releases"
                className="inline-flex h-11 items-center border border-slate-900 px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
              >
                See all early releases
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
