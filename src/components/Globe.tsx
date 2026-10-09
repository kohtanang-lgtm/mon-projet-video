import React from "react";
import { COLORS } from "../theme";

/**
 * Globe filaire (méridiens + parallèles) en projection orthographique, avec un réseau de
 * places financières reliées à N'Djaména. Aucun tracé de continent : la géographie est
 * suggérée par la position réelle des villes (latitude / longitude).
 */

type City = { name: string; lat: number; lon: number; hub?: boolean };

export const CITIES: City[] = [
  { name: "N'Djaména", lat: 12.1, lon: 15.0, hub: true },
  { name: "Lagos", lat: 6.5, lon: 3.4 },
  { name: "Dakar", lat: 14.7, lon: -17.4 },
  { name: "Abidjan", lat: 5.3, lon: -4.0 },
  { name: "Kinshasa", lat: -4.3, lon: 15.3 },
  { name: "Nairobi", lat: -1.3, lon: 36.8 },
  { name: "Londres", lat: 51.5, lon: -0.1 },
  { name: "Paris", lat: 48.9, lon: 2.35 },
  { name: "Dubaï", lat: 25.2, lon: 55.3 },
  { name: "New York", lat: 40.7, lon: -74.0 },
];

const RAD = Math.PI / 180;

export const Globe: React.FC<{
  radius: number;
  /** Longitude placée face caméra (degrés). */
  facing: number;
  tilt?: number;
  /** 0 → 1 : apparition du graticule. */
  reveal: number;
  /** 0 → 1 : déploiement des liaisons depuis N'Djaména. */
  links: number;
  t: number;
}> = ({ radius: R, facing, tilt = 16, reveal, links, t }) => {
  const a = tilt * RAD;
  const project = (lat: number, lon: number, lift = 1) => {
    const phi = lat * RAD;
    const lam = (lon - facing) * RAD;
    const x = R * lift * Math.cos(phi) * Math.sin(lam);
    const y = -R * lift * Math.sin(phi);
    const z = R * lift * Math.cos(phi) * Math.cos(lam);
    return { x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) };
  };

  /** Polyligne échantillonnée, séparée en parties avant / arrière. */
  const trace = (pts: { x: number; y: number; z: number }[]) => {
    let front = "";
    let back = "";
    pts.forEach((p, i) => {
      const prev = pts[i - 1];
      const cmd = (vis: boolean) => (!prev || prev.z > 0 !== vis ? "M" : "L");
      if (p.z > 0) front += `${cmd(true)}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
      else back += `${cmd(false)}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    });
    return { front, back };
  };

  const lines: { front: string; back: string }[] = [];
  for (let lon = 0; lon < 360; lon += 20) {
    lines.push(trace(Array.from({ length: 49 }, (_, i) => project(-90 + (180 * i) / 48, lon))));
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    lines.push(trace(Array.from({ length: 73 }, (_, i) => project(lat, (360 * i) / 72))));
  }

  const hub = CITIES.find((c) => c.hub)!;
  const arcs = CITIES.filter((c) => !c.hub).map((c, k) => {
    // interpolation sphérique simple (lat/lon) avec élévation au milieu de l'arc
    const pts = Array.from({ length: 33 }, (_, i) => {
      const s = i / 32;
      return project(
        hub.lat + (c.lat - hub.lat) * s,
        hub.lon + (c.lon - hub.lon) * s,
        1 + Math.sin(Math.PI * s) * 0.12,
      );
    });
    const local = Math.max(0, Math.min(1, links * 1.6 - k * 0.07));
    return { ...trace(pts), local };
  });

  return (
    <svg
      width={R * 2.6}
      height={R * 2.6}
      viewBox={`${-R * 1.3} ${-R * 1.3} ${R * 2.6} ${R * 2.6}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="globeShade" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="nodeGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g opacity={reveal}>
        <circle r={R} fill="url(#globeShade)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
        {lines.map((l, i) => (
          <g key={i}>
            <path d={l.back} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <path d={l.front} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.3} />
          </g>
        ))}
      </g>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arc.front}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={2.8}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${arc.local} 1`}
          opacity={0.9}
        />
      ))}
      {CITIES.map((c) => {
        const p = project(c.lat, c.lon);
        if (p.z <= 0) return null;
        const pulse = c.hub ? 1 + 0.25 * Math.sin(t * 4) : 1;
        const on = c.hub ? reveal : Math.min(1, links * 1.4);
        return (
          <g key={c.name} transform={`translate(${p.x} ${p.y})`} opacity={on}>
            <circle r={c.hub ? 16 : 9} fill={COLORS.red} opacity={0.7} filter="url(#nodeGlow)" />
            <circle r={(c.hub ? 6 : 3.6) * pulse} fill={c.hub ? "white" : "#FF8A8F"} />
          </g>
        );
      })}
    </svg>
  );
};
