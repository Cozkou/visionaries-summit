"use client";

function Bird({
  top,
  scale,
  duration,
  delay,
  flap,
}: {
  top: string;
  scale: number;
  duration: number;
  delay: number;
  flap: number;
}) {
  return (
    <div
      className="bird-fly absolute left-0"
      style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <svg
        width={26 * scale}
        height={12 * scale}
        viewBox="0 0 26 12"
        fill="none"
        className="bird-flap text-sky-700/40"
        style={{ animationDuration: `${flap}s` }}
      >
        <path
          d="M1 8 C5 2 9 2 13 6 C17 2 21 2 25 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function SkyBackground({
  variant = "full",
}: {
  variant?: "full" | "subtle";
}) {
  return (
    <div
      aria-hidden
      className="sky-gradient pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {variant === "full" && (
        <>
          <Bird top="16%" scale={1} duration={38} delay={-4} flap={0.5} />
          <Bird top="22%" scale={0.75} duration={46} delay={-22} flap={0.45} />
        </>
      )}
    </div>
  );
}
