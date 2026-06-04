import { cn } from "@/lib/utils";

interface PulsePanelProps {
  title: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
}

export function PulsePanel({
  title,
  caption,
  children,
  className,
}: PulsePanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 border border-neutral-200 bg-white p-4 md:p-5",
        className
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-street text-[clamp(1rem,1.6vw,1.25rem)] tracking-[0.02em] text-neutral-900 uppercase">
          {title}
        </h2>
        {caption && (
          <p className="font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
            {caption}
          </p>
        )}
      </header>
      <div className="min-h-[220px]">{children}</div>
    </section>
  );
}
