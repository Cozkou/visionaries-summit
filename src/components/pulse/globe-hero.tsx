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
const MAX_BAR_HEIGHT = 1.05;
const MIN_BAR_HEIGHT = 0.08;
const SUPPLIER_CONE_HEIGHT = 0.28;

function formatGbp(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(0)}k`;
  return `£${Math.round(n).toLocaleString()}`;
}

export function GlobeHero(props: GlobeHeroProps) {
  const { countries, cities, suppliers, totals } = props;

  const cityBars = useMemo(() => {
    return cities
      .map((c) => {
        const centroid = CITY_CENTROIDS[c.city];
        if (!centroid) return null;
        return { ...c, centroid };
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

  // Top customer city (e.g. London) is the demand sink the trade arcs flow into.
  const topCustomerCity = useMemo(() => {
    return cityBars.reduce<typeof cityBars[number] | null>(
      (best, c) => (!best || c.revenue > best.revenue ? c : best),
      null
    );
  }, [cityBars]);

  const maxRevenue = useMemo(
    () =>
      cityBars.reduce((acc, c) => Math.max(acc, c.revenue), 0) ||
      countries[0]?.revenue ||
      1,
    [cityBars, countries]
  );

  return (
    <section className="relative overflow-hidden border border-slate-900/15 bg-slate-950 text-slate-200">
      {/* Editorial backdrop gradient for depth behind the dark sphere. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 55% 60%, rgba(16,185,129,0.18) 0%, rgba(15,23,42,0) 55%), radial-gradient(ellipse at 20% 30%, rgba(245,158,11,0.10) 0%, rgba(15,23,42,0) 50%)",
        }}
      />

      <div className="relative z-10 flex flex-wrap items-baseline justify-between gap-3 px-5 pt-5 md:px-7">
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

      <div className="hidden md:block">
        <GlobeCanvas
          cityBars={cityBars}
          supplierCones={supplierCones}
          maxRevenue={maxRevenue}
          topCustomerCity={topCustomerCity}
        />
      </div>
      <div className="block md:hidden">
        <MobileBarFallback countries={countries} suppliers={suppliers} />
      </div>

      <footer className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase md:px-7">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-emerald-400" /> Customer
          revenue
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-amber-400" />{" "}
          Supplier origin
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-px w-4 bg-amber-300" /> Supply → demand
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
  topCustomerCity: (GeoCityPoint & { centroid: GeoPoint }) | null;
}

function GlobeCanvas({
  cityBars,
  supplierCones,
  maxRevenue,
  topCustomerCity,
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
    const height = 520;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x0b1120, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.0, 4.4);

    // ---- lighting (warmer key + emerald rim for editorial vibe)
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff4d6, 1.0);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x34d399, 0.55);
    rim.position.set(-4, -1, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x60a5fa, 0.25);
    fill.position.set(-3, 3, -4);
    scene.add(fill);

    // ---- globe
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const sphereGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 5);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x111b2d,
      metalness: 0.15,
      roughness: 0.78,
      flatShading: true,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // Atmosphere — a slightly larger BackSide sphere with emerald tint produces
    // a soft halo around the silhouette without needing custom shaders.
    const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.085, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosphere);

    // Subtle inner wireframe for the "drafted globe" look.
    const wireGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 1.001, 2);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.45,
    });
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireGeo),
      wireMat
    );
    globeGroup.add(wire);

    // Latitude rings.
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
        opacity: lat === 0 ? 0.5 : 0.22,
      });
      latitudeRings.add(new THREE.Line(g, m));
    }
    globeGroup.add(latitudeRings);

    // ---- revenue bars (hex prisms via 6-sided cylinders)
    const barGroup = new THREE.Group();
    globeGroup.add(barGroup);
    const barMeshes: { mesh: THREE.Mesh; instance: BarInstance }[] = [];

    function scaleRevenue(r: number): number {
      // sqrt scale: lets London (~80% of all revenue) dominate while still
      // keeping small markets visible above the surface.
      if (r <= 0) return MIN_BAR_HEIGHT;
      const v = Math.sqrt(r / (maxRevenue || 1));
      return MIN_BAR_HEIGHT + Math.max(0, Math.min(1, v)) * MAX_BAR_HEIGHT;
    }
    function colorForIntensity(intensity: number): THREE.Color {
      // Cool teal -> warm emerald -> bright lime as revenue grows.
      const lo = new THREE.Color(0x67e8f9); // cyan-300
      const mid = new THREE.Color(0x10b981); // emerald-500
      const hi = new THREE.Color(0xa3e635); // lime-400
      if (intensity < 0.5) {
        return lo.clone().lerp(mid, intensity / 0.5);
      }
      return mid.clone().lerp(hi, (intensity - 0.5) / 0.5);
    }

    for (const c of cityBars) {
      const h = scaleRevenue(c.revenue);
      const intensity = c.revenue / (maxRevenue || 1);
      const color = colorForIntensity(intensity);
      const geo = new THREE.CylinderGeometry(0.045, 0.06, h, 6, 1, false);
      geo.translate(0, h / 2, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color.clone().multiplyScalar(0.55),
        emissiveIntensity: 1.0,
        metalness: 0.25,
        roughness: 0.4,
        flatShading: true,
      });
      const bar = new THREE.Mesh(geo, mat);

      const surface = latLngToVec3(c.centroid.lat, c.centroid.lng, GLOBE_RADIUS);
      bar.position.set(surface.x, surface.y, surface.z);
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

    // ---- supplier markers (amber cones with a glowing core sphere)
    for (const s of supplierCones) {
      const coneGeo = new THREE.ConeGeometry(0.06, SUPPLIER_CONE_HEIGHT, 4);
      coneGeo.translate(0, SUPPLIER_CONE_HEIGHT / 2 + 0.02, 0);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xb45309,
        emissiveIntensity: 0.85,
        metalness: 0.3,
        roughness: 0.35,
        flatShading: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      const surface = latLngToVec3(s.centroid.lat, s.centroid.lng, GLOBE_RADIUS);
      cone.position.set(surface.x, surface.y, surface.z);
      cone.lookAt(0, 0, 0);
      cone.rotateX(Math.PI / 2);
      cone.rotateX(Math.PI);
      cone.position.set(surface.x * 1.08, surface.y * 1.08, surface.z * 1.08);
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

    // ---- supply → demand arcs (quadratic bezier curves above the sphere)
    interface ArcEntry {
      curve: THREE.QuadraticBezierCurve3;
      pulse: THREE.Mesh;
    }
    const arcs: ArcEntry[] = [];
    if (topCustomerCity) {
      const sink = latLngToVec3(
        topCustomerCity.centroid.lat,
        topCustomerCity.centroid.lng,
        GLOBE_RADIUS
      );
      const sinkVec = new THREE.Vector3(sink.x, sink.y, sink.z);

      for (const s of supplierCones) {
        const source = latLngToVec3(s.centroid.lat, s.centroid.lng, GLOBE_RADIUS);
        const sourceVec = new THREE.Vector3(source.x, source.y, source.z);

        // Lift the midpoint above the sphere proportional to chord distance.
        const mid = sourceVec.clone().add(sinkVec).multiplyScalar(0.5);
        const chord = sourceVec.distanceTo(sinkVec);
        const lift = 1 + Math.min(0.55, chord / GLOBE_RADIUS * 0.25);
        mid.normalize().multiplyScalar(GLOBE_RADIUS * lift);

        const curve = new THREE.QuadraticBezierCurve3(sourceVec, mid, sinkVec);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.006, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        globeGroup.add(tube);

        // Travelling pulse along the arc.
        const pulseGeo = new THREE.SphereGeometry(0.022, 12, 12);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: 0xfde68a,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        globeGroup.add(pulse);

        arcs.push({ curve, pulse });
      }
    }

    // ---- floating city labels (top 5 markets), drawn as canvas sprites.
    function makeLabelSprite(
      text: string,
      sub: string,
      color = "#a3e635"
    ): THREE.Sprite {
      const canvas = document.createElement("canvas");
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = 320 * dpr;
      canvas.height = 96 * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.font = "600 18px 'Inter', system-ui, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#f8fafc";
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 6;
        ctx.fillText(text, 16, 24);
        ctx.font = "500 11px ui-monospace, monospace";
        ctx.fillStyle = color;
        ctx.shadowBlur = 4;
        ctx.fillText(sub.toUpperCase(), 16, 52);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.85, 0.26, 1);
      return sprite;
    }
    const labelGroup = new THREE.Group();
    globeGroup.add(labelGroup);
    interface CityLabel {
      sprite: THREE.Sprite;
      /** Local-space surface normal (used to test if the label faces camera). */
      normal: THREE.Vector3;
    }
    const cityLabels: CityLabel[] = [];
    const topCityBars = [...cityBars]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    for (const c of topCityBars) {
      const h = scaleRevenue(c.revenue);
      const surface = latLngToVec3(c.centroid.lat, c.centroid.lng, GLOBE_RADIUS);
      const out = new THREE.Vector3(surface.x, surface.y, surface.z)
        .normalize()
        .multiplyScalar(GLOBE_RADIUS + h + 0.18);
      const sprite = makeLabelSprite(c.city, formatGbp(c.revenue));
      sprite.position.copy(out);
      labelGroup.add(sprite);
      cityLabels.push({
        sprite,
        normal: new THREE.Vector3(surface.x, surface.y, surface.z).normalize(),
      });
    }

    // ---- interaction
    const dragState = {
      active: false,
      lastX: 0,
      lastY: 0,
      vx: 0.0012,
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
    const raycaster = new THREE.Raycaster();
    function onPointerMove(ev: PointerEvent) {
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
      dragState.vx = 0;
    }
    function onLeave() {
      setTooltip(null);
      dragState.active = false;
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    globeGroup.rotation.y = -0.6;
    globeGroup.rotation.x = -0.25;

    // ---- animate
    let raf = 0;
    const start = performance.now();
    const tmpWorldNormal = new THREE.Vector3();
    const tmpCameraDir = new THREE.Vector3();
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!dragState.active && dragState.vx !== 0) {
        globeGroup.rotation.y += dragState.vx;
      }
      // Travel each pulse along its arc.
      const t = ((performance.now() - start) % 2400) / 2400;
      for (const arc of arcs) {
        const p = arc.curve.getPoint(t);
        arc.pulse.position.copy(p);
        const scale = 0.6 + 0.6 * Math.sin(t * Math.PI);
        arc.pulse.scale.setScalar(scale);
      }
      // Fade city labels based on facing angle to the camera (hide back-side).
      camera.getWorldDirection(tmpCameraDir).negate();
      for (const lbl of cityLabels) {
        tmpWorldNormal
          .copy(lbl.normal)
          .applyQuaternion(globeGroup.quaternion);
        const facing = tmpWorldNormal.dot(tmpCameraDir);
        // Fully visible when facing >= 0.25, fully hidden below ~0.
        const opacity = Math.max(0, Math.min(1, (facing - 0.0) / 0.35));
        const mat = lbl.sprite.material as THREE.SpriteMaterial;
        mat.opacity = opacity;
        lbl.sprite.visible = opacity > 0.02;
      }
      renderer.render(scene, camera);
    }
    tick();

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
      atmosGeo.dispose();
      atmosMat.dispose();
      barMeshes.forEach((b) => {
        b.mesh.geometry.dispose();
        const mat = b.mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      });
      arcs.forEach((a) => {
        a.pulse.geometry.dispose();
        (a.pulse.material as THREE.Material).dispose();
      });
      labelGroup.children.forEach((sprite) => {
        if (sprite instanceof THREE.Sprite) {
          const mat = sprite.material as THREE.SpriteMaterial;
          mat.map?.dispose();
          mat.dispose();
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, [cityBars, supplierCones, maxRevenue, topCustomerCity]);

  return (
    <div className="relative">
      <div
        ref={mountRef}
        className="h-[520px] w-full cursor-grab active:cursor-grabbing"
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
