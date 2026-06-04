"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  CITY_CENTROIDS,
  COUNTRY_CENTROIDS,
  latLngToVec3,
  type GeoPoint,
} from "@/lib/geo/centroids";
import type {
  GeoCityPoint,
  GeoCountryPoint,
  SupplierOriginPoint,
} from "@/lib/data/pulse-analytics";
import { cn } from "@/lib/utils";

interface GlobeHeroProps {
  countries: GeoCountryPoint[];
  cities: GeoCityPoint[];
  suppliers: SupplierOriginPoint[];
  totals: { revenue: number; orders: number; customers: number };
}

interface BarInstance {
  kind: "revenue" | "supplier";
  point: GeoPoint;
  revenue?: number;
  orders?: number;
  customers?: number;
  supplierName?: string;
  supplierPoCount?: number;
  supplierCostGbp?: number;
  supplierLeadTime?: number;
}

const GLOBE_RADIUS = 1.4;
const MAX_BAR_HEIGHT = 0.6;
const MIN_BAR_HEIGHT = 0.04;
const SUPPLIER_CONE_HEIGHT = 0.22;

function formatGbp(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(0)}k`;
  return `£${Math.round(n).toLocaleString()}`;
}

export function GlobeHero(props: GlobeHeroProps) {
  const { countries, cities, suppliers, totals } = props;

  // Match city/supplier rows to their lat/lng centroids.
  const cityBars = useMemo(() => {
    return cities
      .map((c) => {
        const centroid = CITY_CENTROIDS[c.city];
        if (!centroid) return null;
        return {
          ...c,
          centroid,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cities]);

  const supplierCones = useMemo(() => {
    return suppliers
      .map((s) => {
        const centroid = COUNTRY_CENTROIDS[s.countryCode];
        if (!centroid) return null;
        return { ...s, centroid };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [suppliers]);

  const maxRevenue = useMemo(
    () =>
      cityBars.reduce((acc, c) => Math.max(acc, c.revenue), 0) ||
      countries[0]?.revenue ||
      1,
    [cityBars, countries]
  );

  return (
    <section className="relative overflow-hidden border border-slate-900/15 bg-slate-950 text-slate-200">
      <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-baseline justify-between gap-3 px-5 pt-5 md:px-7">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-slate-400 uppercase">
            Customer base · supplier origins
          </p>
          <h1 className="mt-1 font-street text-[clamp(1.8rem,3.4vw,2.6rem)] tracking-[0.02em] text-white uppercase">
            Pretty Fly, Pretty Far
          </h1>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] tracking-[0.14em] text-slate-300 uppercase">
          <li>{formatGbp(totals.revenue)} revenue</li>
          <li>{totals.orders.toLocaleString()} orders</li>
          <li>{totals.customers.toLocaleString()} customers</li>
        </ul>
      </div>

      {/* The globe canvas (lg+) — switches to a 2D bar fallback on small screens. */}
      <div className="hidden md:block">
        <GlobeCanvas
          cityBars={cityBars}
          supplierCones={supplierCones}
          maxRevenue={maxRevenue}
        />
      </div>
      <div className="block md:hidden">
        <MobileBarFallback countries={countries} suppliers={suppliers} />
      </div>

      <footer className="z-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase md:px-7">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-emerald-400" /> Customer
          revenue
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-amber-400" />{" "}
          Supplier origin
        </span>
        <span className="ml-auto text-slate-500">
          drag to rotate · hover for detail
        </span>
      </footer>
    </section>
  );
}

interface GlobeCanvasProps {
  cityBars: (GeoCityPoint & { centroid: GeoPoint })[];
  supplierCones: (SupplierOriginPoint & { centroid: GeoPoint })[];
  maxRevenue: number;
}

function GlobeCanvas({
  cityBars,
  supplierCones,
  maxRevenue,
}: GlobeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    instance: BarInstance;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = 480;

    // ---- renderer / scene / camera
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x0b1120, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 4.6);

    // ---- lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff7e8, 0.85);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6ee7b7, 0.4);
    rim.position.set(-4, -1, -3);
    scene.add(rim);

    // ---- globe sphere (low-poly icosahedron + wireframe overlay)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const sphereGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 4);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.1,
      roughness: 0.85,
      flatShading: true,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    const wireGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 1.001, 2);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.5,
    });
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireGeo),
      wireMat
    );
    globeGroup.add(wire);

    // Equator + tropic latitude lines for a "drafted globe" feel.
    const latitudeRings = new THREE.Group();
    for (const lat of [-66.5, -23.5, 0, 23.5, 66.5]) {
      const r = Math.cos((lat * Math.PI) / 180) * GLOBE_RADIUS * 1.002;
      const y = Math.sin((lat * Math.PI) / 180) * GLOBE_RADIUS * 1.002;
      const segments = 96;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
      }
      const g = new THREE.BufferGeometry().setFromPoints(points);
      const m = new THREE.LineBasicMaterial({
        color: lat === 0 ? 0x475569 : 0x334155,
        transparent: true,
        opacity: lat === 0 ? 0.5 : 0.25,
      });
      latitudeRings.add(new THREE.Line(g, m));
    }
    globeGroup.add(latitudeRings);

    // ---- bars (per city, height = log-scaled revenue)
    const barGroup = new THREE.Group();
    globeGroup.add(barGroup);
    const barMeshes: { mesh: THREE.Mesh; instance: BarInstance }[] = [];

    const minRevForScale = Math.max(1, maxRevenue / 1000);
    const logMax = Math.log10(maxRevenue + 1) - Math.log10(minRevForScale);
    function scaleRevenue(r: number): number {
      if (r <= 0) return MIN_BAR_HEIGHT;
      const v =
        (Math.log10(r + 1) - Math.log10(minRevForScale)) / (logMax || 1);
      return MIN_BAR_HEIGHT + Math.max(0, Math.min(1, v)) * MAX_BAR_HEIGHT;
    }
    function colorForIntensity(intensity: number): THREE.Color {
      // Cream (#f7f2e1) -> emerald (#10b981)
      const cream = new THREE.Color(0xf7f2e1);
      const emerald = new THREE.Color(0x10b981);
      return cream.clone().lerp(emerald, Math.max(0, Math.min(1, intensity)));
    }

    for (const c of cityBars) {
      const h = scaleRevenue(c.revenue);
      const intensity = c.revenue / (maxRevenue || 1);
      const geo = new THREE.BoxGeometry(0.04, h, 0.04);
      geo.translate(0, h / 2, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: colorForIntensity(intensity),
        emissive: colorForIntensity(intensity).multiplyScalar(0.18),
        metalness: 0.2,
        roughness: 0.55,
      });
      const bar = new THREE.Mesh(geo, mat);

      const surface = latLngToVec3(c.centroid.lat, c.centroid.lng, GLOBE_RADIUS);
      bar.position.set(surface.x, surface.y, surface.z);
      // Orient bar so +Y aligns with the surface normal (outward).
      bar.lookAt(0, 0, 0);
      bar.rotateX(Math.PI / 2);
      barGroup.add(bar);
      barMeshes.push({
        mesh: bar,
        instance: {
          kind: "revenue",
          point: c.centroid,
          revenue: c.revenue,
          orders: c.orders,
          customers: c.customers,
        },
      });
    }

    // ---- supplier cones (amber, inverted, pointing at the surface)
    for (const s of supplierCones) {
      const geo = new THREE.ConeGeometry(0.05, SUPPLIER_CONE_HEIGHT, 4);
      geo.translate(0, SUPPLIER_CONE_HEIGHT / 2 + 0.02, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0x78350f,
        emissiveIntensity: 0.4,
        metalness: 0.3,
        roughness: 0.4,
        flatShading: true,
      });
      const cone = new THREE.Mesh(geo, mat);
      const surface = latLngToVec3(s.centroid.lat, s.centroid.lng, GLOBE_RADIUS);
      cone.position.set(surface.x, surface.y, surface.z);
      cone.lookAt(0, 0, 0);
      cone.rotateX(Math.PI / 2);
      // Flip cone so the point sits on the surface.
      cone.rotateX(Math.PI);
      cone.position.set(surface.x * 1.06, surface.y * 1.06, surface.z * 1.06);
      barGroup.add(cone);
      barMeshes.push({
        mesh: cone,
        instance: {
          kind: "supplier",
          point: s.centroid,
          supplierName: s.name,
          supplierPoCount: s.poCount,
          supplierCostGbp: s.totalCostGbp,
          supplierLeadTime: s.leadTimeDays,
        },
      });
    }

    // ---- interaction: drag to rotate
    const dragState = {
      active: false,
      lastX: 0,
      lastY: 0,
      vx: 0.0014, // auto-spin
      vy: 0,
    };

    function onPointerDown(ev: PointerEvent) {
      dragState.active = true;
      dragState.lastX = ev.clientX;
      dragState.lastY = ev.clientY;
      renderer.domElement.setPointerCapture(ev.pointerId);
    }
    function onPointerUp(ev: PointerEvent) {
      dragState.active = false;
      renderer.domElement.releasePointerCapture(ev.pointerId);
    }
    function onPointerMove(ev: PointerEvent) {
      // Tooltip hit-test on hover regardless of drag.
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const intersects = raycaster.intersectObjects(
        barMeshes.map((b) => b.mesh),
        false
      );
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const match = barMeshes.find((b) => b.mesh === hit);
        if (match) {
          setTooltip({
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top,
            instance: match.instance,
          });
        }
      } else {
        setTooltip(null);
      }

      if (!dragState.active) return;
      const dx = ev.clientX - dragState.lastX;
      const dy = ev.clientY - dragState.lastY;
      dragState.lastX = ev.clientX;
      dragState.lastY = ev.clientY;
      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x = Math.max(
        -1.0,
        Math.min(1.0, globeGroup.rotation.x + dy * 0.004)
      );
      dragState.vx = 0; // user took control, pause auto-spin
    }
    function onLeave() {
      setTooltip(null);
      dragState.active = false;
    }

    const raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    // Initial tilt: tip the globe so Europe + North America face the camera.
    globeGroup.rotation.y = -0.6;
    globeGroup.rotation.x = -0.25;

    // ---- animate
    let raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!dragState.active && dragState.vx !== 0) {
        globeGroup.rotation.y += dragState.vx;
      }
      renderer.render(scene, camera);
    }
    tick();

    // ---- resize
    function onResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      barMeshes.forEach((b) => {
        b.mesh.geometry.dispose();
        const mat = b.mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      });
      mount.removeChild(renderer.domElement);
    };
  }, [cityBars, supplierCones, maxRevenue]);

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="h-[480px] w-full cursor-grab active:cursor-grabbing"
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-sm border border-white/20 bg-slate-950/95 px-3 py-2 font-mono text-[11px] text-slate-100 shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y - 12 }}
        >
          <TooltipBody instance={tooltip.instance} />
        </div>
      )}
    </div>
  );
}

function TooltipBody({ instance }: { instance: BarInstance }) {
  if (instance.kind === "supplier") {
    return (
      <>
        <div className="text-[10px] tracking-[0.16em] text-amber-300 uppercase">
          Supplier
        </div>
        <div className="mt-0.5 text-[13px] font-medium text-white">
          {instance.supplierName}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-300">
          {instance.point.countryName} · {instance.supplierPoCount} POs
        </div>
        <div className="text-[11px] text-slate-400">
          {instance.supplierCostGbp != null &&
            `${formatGbp(instance.supplierCostGbp)} ordered`}
          {instance.supplierLeadTime != null &&
            ` · ${instance.supplierLeadTime}d lead`}
        </div>
      </>
    );
  }
  return (
    <>
      <div className="text-[10px] tracking-[0.16em] text-emerald-300 uppercase">
        {instance.point.countryName}
      </div>
      <div className="mt-0.5 text-[13px] font-medium text-white">
        {instance.point.label}
      </div>
      <div className="mt-0.5 text-[11px] text-slate-300">
        {formatGbp(instance.revenue ?? 0)} revenue
      </div>
      <div className="text-[11px] text-slate-400">
        {instance.customers?.toLocaleString()} customers ·{" "}
        {instance.orders?.toLocaleString()} orders
      </div>
    </>
  );
}

function MobileBarFallback({
  countries,
  suppliers,
}: {
  countries: GeoCountryPoint[];
  suppliers: SupplierOriginPoint[];
}) {
  const top = countries.slice(0, 6);
  const max = top[0]?.revenue ?? 1;
  return (
    <div className="space-y-4 px-5 py-6">
      <p className="font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase">
        Top markets
      </p>
      <ul className="space-y-2">
        {top.map((c) => {
          const width = `${Math.max(4, (c.revenue / max) * 100)}%`;
          return (
            <li key={c.countryCode} className="flex items-center gap-3">
              <span className="w-10 font-mono text-[11px] text-slate-300">
                {c.countryCode}
              </span>
              <span
                className={cn(
                  "h-3 bg-gradient-to-r from-slate-700 to-emerald-500"
                )}
                style={{ width }}
              />
              <span className="ml-auto font-mono text-[11px] text-slate-300">
                {formatGbp(c.revenue)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-amber-300 uppercase">
        Supplier origins
      </p>
      <ul className="grid grid-cols-1 gap-1.5 font-mono text-[11px] text-slate-300">
        {suppliers.map((s) => (
          <li key={s.supplierId} className="flex justify-between gap-3">
            <span>{s.name}</span>
            <span className="text-slate-500">{s.countryName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
