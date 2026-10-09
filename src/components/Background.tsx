import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useTime } from "../lib/motion";
import { CUE } from "../timeline/cues";
import { COLORS, EASE } from "../theme";

type Light = { t: number; x: number; y: number; power: number };

/**
 * Éclairage de plateau : un halo rouge UBA qui accompagne l'action d'une scène à l'autre
 * (positions en % de l'écran). Interpolé en douceur → aucune rupture de lumière aux raccords.
 */
const LIGHTS: Light[] = [
  { t: 0, x: 50, y: 64, power: 0 },
  { t: CUE.avenir, x: 50, y: 62, power: 0.55 },
  { t: CUE.voir, x: 50, y: 52, power: 0.8 },
  { t: CUE.particuliers, x: 52, y: 56, power: 0.55 },
  { t: CUE.uba, x: 64, y: 58, power: 0.65 },
  { t: CUE.cartes, x: 62, y: 48, power: 0.75 },
  { t: CUE.prenez, x: 66, y: 50, power: 0.6 },
  { t: CUE.leo, x: 58, y: 42, power: 0.7 },
  { t: CUE.entrepreneurs, x: 50, y: 70, power: 0.55 },
  { t: CUE.sommets, x: 68, y: 26, power: 0.85 },
  { t: CUE.ubaFinal, x: 50, y: 46, power: 0.75 },
  { t: CUE.voEnd + 2.5, x: 50, y: 48, power: 0.6 },
];

const sampleLight = (t: number) => {
  const i = Math.max(
    0,
    LIGHTS.findIndex((l, k) => t >= l.t && (k === LIGHTS.length - 1 || t < LIGHTS[k + 1].t)),
  );
  const a = LIGHTS[i];
  const b = LIGHTS[Math.min(i + 1, LIGHTS.length - 1)];
  if (a === b) return a;
  const p = interpolate(t, [a.t, Math.min(b.t, a.t + 1.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  return {
    t,
    x: a.x + (b.x - a.x) * p,
    y: a.y + (b.y - a.y) * p,
    power: a.power + (b.power - a.power) * p,
  };
};

export const Background: React.FC = () => {
  const t = useTime();
  const light = sampleLight(t);
  const drift = t * 14; // déplacement lent du sol : la caméra « respire »

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black, overflow: "hidden" }}>
      {/* Fond anthracite profond */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 38%, ${COLORS.anthracite} 0%, ${COLORS.ink} 52%, ${COLORS.black} 100%)`,
        }}
      />
      {/* Halo rouge principal */}
      <AbsoluteFill
        style={{
          opacity: light.power,
          background: `radial-gradient(42% 46% at ${light.x}% ${light.y}%, rgba(227,23,32,0.34) 0%, rgba(227,23,32,0.10) 45%, rgba(227,23,32,0) 75%)`,
        }}
      />
      {/* Contre-jour froid, très discret, pour la profondeur */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(38% 40% at ${100 - light.x}% ${100 - light.y * 0.6}%, rgba(160,170,190,0.06) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {/* Sol en perspective : grille fine qui s'évanouit à l'horizon */}
      <div
        style={{
          position: "absolute",
          left: "-50%",
          width: "200%",
          top: "52%",
          height: "120%",
          transformOrigin: "50% 0%",
          transform: "perspective(900px) rotateX(74deg)",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${drift}px`,
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* Grain fixe : supprime le banding des dégradés sombres */}
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      {/* Vignettage */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(85% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
