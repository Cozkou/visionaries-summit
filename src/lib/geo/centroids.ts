/**
 * Static lat/lng lookups for the geo globe.
 *
 * Pretty Fly's customer base in the data pack collapses to a single city per
 * country (e.g. all GB customers are in London) so plotting at city centroids
 * gives a more visually pleasant globe than country geocenters that land in
 * empty land (e.g. middle of France for Paris).
 *
 * Numbers are decimal degrees, WGS84. Source: city centres rounded to ~3dp.
 */

export interface GeoPoint {
  /** ISO-3166-1 alpha-2 (countries) or "{ISO}:{city}" (cities). */
  id: string;
  /** Human label. */
  label: string;
  /** Country ISO-3166-1 alpha-2 the point sits in. */
  countryCode: string;
  /** Country display name. */
  countryName: string;
  /** Latitude in decimal degrees (north positive). */
  lat: number;
  /** Longitude in decimal degrees (east positive). */
  lng: number;
}

/**
 * City centroids covering every city present in addresses.csv plus a few
 * supplier-country anchor cities. Keyed by city name (case-sensitive matching
 * the CSV exactly).
 */
export const CITY_CENTROIDS: Record<string, GeoPoint> = {
  London: {
    id: "GB:London",
    label: "London",
    countryCode: "GB",
    countryName: "United Kingdom",
    lat: 51.507,
    lng: -0.128,
  },
  Madrid: {
    id: "ES:Madrid",
    label: "Madrid",
    countryCode: "ES",
    countryName: "Spain",
    lat: 40.417,
    lng: -3.704,
  },
  "New York": {
    id: "US:NewYork",
    label: "New York",
    countryCode: "US",
    countryName: "United States",
    lat: 40.713,
    lng: -74.006,
  },
  // Note: "Brooklyn" customers from the data pack are intentionally left
  // without a centroid so they fold into the country aggregation rather than
  // rendering as a duplicate bar/label on top of New York.
  Chicago: {
    id: "US:Chicago",
    label: "Chicago",
    countryCode: "US",
    countryName: "United States",
    lat: 41.878,
    lng: -87.629,
  },
  "Los Angeles": {
    id: "US:LosAngeles",
    label: "Los Angeles",
    countryCode: "US",
    countryName: "United States",
    lat: 34.052,
    lng: -118.244,
  },
  Dublin: {
    id: "IE:Dublin",
    label: "Dublin",
    countryCode: "IE",
    countryName: "Ireland",
    lat: 53.35,
    lng: -6.26,
  },
  Amsterdam: {
    id: "NL:Amsterdam",
    label: "Amsterdam",
    countryCode: "NL",
    countryName: "Netherlands",
    lat: 52.367,
    lng: 4.904,
  },
  Paris: {
    id: "FR:Paris",
    label: "Paris",
    countryCode: "FR",
    countryName: "France",
    lat: 48.857,
    lng: 2.352,
  },
  Berlin: {
    id: "DE:Berlin",
    label: "Berlin",
    countryCode: "DE",
    countryName: "Germany",
    lat: 52.52,
    lng: 13.405,
  },
  Rome: {
    id: "IT:Rome",
    label: "Rome",
    countryCode: "IT",
    countryName: "Italy",
    lat: 41.903,
    lng: 12.496,
  },
};

/**
 * Country centroids for any country we need to anchor (suppliers, fallbacks
 * if the data ever expands beyond the cities above).
 */
export const COUNTRY_CENTROIDS: Record<string, GeoPoint> = {
  GB: {
    id: "GB",
    label: "United Kingdom",
    countryCode: "GB",
    countryName: "United Kingdom",
    lat: 54.0,
    lng: -2.0,
  },
  US: {
    id: "US",
    label: "United States",
    countryCode: "US",
    countryName: "United States",
    lat: 39.5,
    lng: -98.35,
  },
  ES: {
    id: "ES",
    label: "Spain",
    countryCode: "ES",
    countryName: "Spain",
    lat: 40.46,
    lng: -3.75,
  },
  NL: {
    id: "NL",
    label: "Netherlands",
    countryCode: "NL",
    countryName: "Netherlands",
    lat: 52.13,
    lng: 5.29,
  },
  IE: {
    id: "IE",
    label: "Ireland",
    countryCode: "IE",
    countryName: "Ireland",
    lat: 53.41,
    lng: -8.24,
  },
  FR: {
    id: "FR",
    label: "France",
    countryCode: "FR",
    countryName: "France",
    lat: 46.23,
    lng: 2.21,
  },
  DE: {
    id: "DE",
    label: "Germany",
    countryCode: "DE",
    countryName: "Germany",
    lat: 51.17,
    lng: 10.45,
  },
  IT: {
    id: "IT",
    label: "Italy",
    countryCode: "IT",
    countryName: "Italy",
    lat: 41.87,
    lng: 12.57,
  },
  PT: {
    id: "PT",
    label: "Portugal",
    countryCode: "PT",
    countryName: "Portugal",
    lat: 39.4,
    lng: -8.22,
  },
  TR: {
    id: "TR",
    label: "Turkey",
    countryCode: "TR",
    countryName: "Turkey",
    lat: 38.96,
    lng: 35.24,
  },
  // Light coverage of plausible neighbours in case the data ever expands.
  CA: { id: "CA", label: "Canada", countryCode: "CA", countryName: "Canada", lat: 56.13, lng: -106.35 },
  AU: { id: "AU", label: "Australia", countryCode: "AU", countryName: "Australia", lat: -25.27, lng: 133.78 },
  JP: { id: "JP", label: "Japan", countryCode: "JP", countryName: "Japan", lat: 36.2, lng: 138.25 },
  CN: { id: "CN", label: "China", countryCode: "CN", countryName: "China", lat: 35.86, lng: 104.2 },
  BR: { id: "BR", label: "Brazil", countryCode: "BR", countryName: "Brazil", lat: -14.24, lng: -51.93 },
  MX: { id: "MX", label: "Mexico", countryCode: "MX", countryName: "Mexico", lat: 23.63, lng: -102.55 },
  BE: { id: "BE", label: "Belgium", countryCode: "BE", countryName: "Belgium", lat: 50.5, lng: 4.47 },
  PL: { id: "PL", label: "Poland", countryCode: "PL", countryName: "Poland", lat: 51.92, lng: 19.15 },
  SE: { id: "SE", label: "Sweden", countryCode: "SE", countryName: "Sweden", lat: 60.13, lng: 18.64 },
  NO: { id: "NO", label: "Norway", countryCode: "NO", countryName: "Norway", lat: 60.47, lng: 8.47 },
  DK: { id: "DK", label: "Denmark", countryCode: "DK", countryName: "Denmark", lat: 56.26, lng: 9.5 },
  FI: { id: "FI", label: "Finland", countryCode: "FI", countryName: "Finland", lat: 61.92, lng: 25.75 },
  CH: { id: "CH", label: "Switzerland", countryCode: "CH", countryName: "Switzerland", lat: 46.82, lng: 8.23 },
  AT: { id: "AT", label: "Austria", countryCode: "AT", countryName: "Austria", lat: 47.52, lng: 14.55 },
};

export function getCityCentroid(city: string): GeoPoint | undefined {
  return CITY_CENTROIDS[city];
}

export function getCountryCentroid(code: string): GeoPoint | undefined {
  return COUNTRY_CENTROIDS[code];
}

/**
 * Convert WGS84 lat/lng to a unit vector on a sphere of `radius`. The result
 * is in three.js right-handed coords: +Y is up (north pole), +X exits at
 * 0°N 90°E, +Z exits at 0°N 0°E.
 */
export function latLngToVec3(
  lat: number,
  lng: number,
  radius: number
): { x: number; y: number; z: number } {
  const phi = (90 - lat) * (Math.PI / 180); // polar angle from +Y
  const theta = (lng + 180) * (Math.PI / 180); // azimuth
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
