import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/early-releases", label: "Early Releases" },
  { href: "/#drops", label: "Latest Drop" },
  { href: "/#newsletter", label: "Newsletter" },
] as const;

export function StoreFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-[#f7f6f3] px-6 py-10 md:px-[8vw] md:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Link
          href="/"
          className="font-street text-[18px] tracking-[0.08em] text-slate-900 uppercase md:text-[20px]"
        >
          Pretty Fly
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase transition-colors hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/internal"
            className="border border-slate-300/90 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-slate-400 uppercase transition-colors hover:border-slate-500 hover:text-slate-700"
          >
            Internal
          </Link>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-[10px] tracking-[0.16em] text-slate-400 uppercase">
        © {new Date().getFullYear()} Pretty Fly
      </p>
    </footer>
  );
}
