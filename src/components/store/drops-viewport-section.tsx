import { LatestDropPanel } from "@/components/store/latest-drop-panel";
import type { PublicListing } from "@/lib/public-listings";

interface Props {
  latestPublished: PublicListing | null;
}

export function DropsViewportSection({ latestPublished }: Props) {
  if (!latestPublished) return null;

  return (
    <section
      id="drops"
      className="flex min-h-[100dvh] flex-col"
      style={{ backgroundColor: "#f7f6f3" }}
    >
      <div className="flex min-h-0 flex-1 flex-col justify-end px-6 pb-10 pt-16 md:px-[8vw] md:pb-14 md:pt-24">
        <div className="mx-auto w-full max-w-6xl min-h-0">
          <LatestDropPanel listing={latestPublished} />
        </div>
      </div>
    </section>
  );
}
