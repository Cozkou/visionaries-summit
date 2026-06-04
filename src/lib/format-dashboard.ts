import type { MetricUnit } from "@/types/dashboard";

export function formatMetricValue(value: number, unit: MetricUnit): string {
  switch (unit) {
    case "currency":
      return `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    case "hours":
      return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} h`;
    case "count":
    default:
      return value.toLocaleString();
  }
}

export function formatGbp(value: number): string {
  return `£${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
