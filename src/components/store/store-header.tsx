import Link from "next/link";

const NAV = [
  { href: "#shop", label: "Shop" },
  { href: "#early-releases", label: "Early Releases" },
  { href: "#about", label: "About" },
] as const;

export function StoreHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-sky-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 md:px-8">
        <Link
          href="/"
          className="font-street text-[20px] uppercase tracking-[0.04em] text-sky-700 transition-opacity hover:opacity-70"
        >
          Pretty Fly
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] font-medium tracking-wide text-slate-500 transition-colors hover:text-sky-700"
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Cart"
          className="group relative flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/60 py-1.5 pr-4 pl-3 text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
            <path
              d="M3 4h2l1.6 9.2a1.5 1.5 0 0 0 1.48 1.3h6.3a1.5 1.5 0 0 0 1.47-1.2L17.5 7H6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="17" r="1.1" fill="currentColor" />
            <circle cx="15" cy="17" r="1.1" fill="currentColor" />
          </svg>
          <span className="text-[12px] font-semibold tabular-nums">0</span>
        </button>
      </div>
    </header>
  );
}
