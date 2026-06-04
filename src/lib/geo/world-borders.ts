/**
 * World country borders for the Pulse globe.
 *
 * Loads the Natural Earth 1:110m topojson (≈100 KB, 177 countries) from the
 * `world-atlas` package, decodes it into GeoJSON polygons with the
 * `topojson-client` `feature()` helper, then flattens every ring into a flat
 * array of `[lng, lat]` polylines tagged with the country's ISO alpha-2 code
 * and human-readable name.
 *
 * Consumed by `globe-hero.tsx`, which projects the points onto the 3D sphere
 * and renders them as `THREE.LineSegments` so the globe shows real continents
 * instead of an abstract dark ball.
 *
 * Data is precomputed at module-load time so the per-render cost in the
 * three.js scene is zero geo work — just GPU buffer uploads.
 */
import countries from "i18n-iso-countries";
import { feature } from "topojson-client";
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

import worldTopojson from "world-atlas/countries-110m.json";

/** A single polyline along a country border, in lng/lat degrees. */
export interface CountryBorderRing {
  /** ISO 3166-1 alpha-2 code (e.g. "GB"). Empty string when no mapping exists. */
  countryCode: string;
  /** Display name from Natural Earth (e.g. "United Kingdom"). */
  countryName: string;
  /** Closed ring of [lng, lat] vertices in degrees. */
  points: [number, number][];
}

type CountryProps = { name: string };

function buildBorderRings(): CountryBorderRing[] {
  const topo = worldTopojson as unknown as Topology<{
    countries: GeometryCollection<CountryProps>;
  }>;
  const fc = feature(topo, topo.objects.countries) as FeatureCollection<
    Polygon | MultiPolygon,
    CountryProps
  >;

  const rings: CountryBorderRing[] = [];
  for (const feat of fc.features) {
    const numericId = String((feat as Feature).id ?? "");
    const alpha2 = numericId
      ? countries.numericToAlpha2(numericId.padStart(3, "0")) ?? ""
      : "";
    const countryName = feat.properties?.name ?? "";

    const geom = feat.geometry;
    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates) {
        rings.push({
          countryCode: alpha2,
          countryName,
          points: ring as [number, number][],
        });
      }
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          rings.push({
            countryCode: alpha2,
            countryName,
            points: ring as [number, number][],
          });
        }
      }
    }
  }
  return rings;
}

/**
 * Densify a polyline along great-circle arcs so long edges between two
 * sparse vertices don't cut straight through the sphere. We split any edge
 * longer than `maxStepDegrees` into approximately equal chunks.
 */
function densifyRing(
  ring: [number, number][],
  maxStepDegrees: number
): [number, number][] {
  if (ring.length < 2) return ring;
  const out: [number, number][] = [ring[0]];
  for (let i = 1; i < ring.length; i++) {
    const [aLng, aLat] = ring[i - 1];
    const [bLng, bLat] = ring[i];
    const dLng = bLng - aLng;
    const dLat = bLat - aLat;
    const dist = Math.hypot(dLng, dLat);
    if (dist > maxStepDegrees) {
      const steps = Math.ceil(dist / maxStepDegrees);
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        out.push([aLng + dLng * t, aLat + dLat * t]);
      }
    } else {
      out.push([bLng, bLat]);
    }
  }
  return out;
}

/**
 * All world borders, densified so polylines hug the sphere instead of
 * chord-cutting through it. Computed once at module import.
 */
export const WORLD_BORDER_RINGS: CountryBorderRing[] = buildBorderRings().map(
  (r) => ({ ...r, points: densifyRing(r.points, 2.5) })
);
