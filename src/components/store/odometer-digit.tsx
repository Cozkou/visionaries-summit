"use client";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

function clampDigit(n: number) {
  return Math.max(0, Math.min(9, n));
}

export function OdometerDigit({ value }: { value: number }) {
  const index = clampDigit(value);

  return (
    <span className="odometer-digit" aria-hidden>
      <span
        className="odometer-digit-strip"
        style={{ ["--odometer-index" as string]: index }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="odometer-digit-cell">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Two-digit odometer (minutes / seconds) */
export function OdometerPair({
  value,
  placeholder = "--",
}: {
  value: number | null;
  placeholder?: string;
}) {
  if (value === null) {
    return <span className="tabular-nums">{placeholder}</span>;
  }

  const padded = String(value).padStart(2, "0");
  const tens = Number(padded[0]);
  const ones = Number(padded[1]);

  return (
    <span className="odometer-pair tabular-nums" aria-label={padded}>
      <OdometerDigit value={tens} />
      <OdometerDigit value={ones} />
    </span>
  );
}
