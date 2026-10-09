import React from "react";
import { COLORS, FONTS } from "../theme";

export const PHONE = { width: 430, height: 880, radius: 68, bezel: 12 } as const;
export const SCREEN = {
  width: PHONE.width - PHONE.bezel * 2,
  height: PHONE.height - PHONE.bezel * 2,
  radius: PHONE.radius - PHONE.bezel,
} as const;

/** Épaisseur simulée : tranches empilées en Z (bord métal visible dès que le téléphone pivote). */
const SLICES = 12;

/**
 * Smartphone en 3D. Le contenu `screen` est découpé à la forme de l'écran (calque plat) ;
 * `floating` reçoit les éléments d'interface « éclatés » qui flottent devant l'écran en Z.
 */
export const Phone: React.FC<{
  screen: React.ReactNode;
  floating?: React.ReactNode;
  /** Couleur de la barre d'état (blanche sur un en-tête rouge). */
  statusColor?: string;
  glare?: number; // position du reflet 0 → 1
  style?: React.CSSProperties;
}> = ({ screen, floating, glare = 0.3, statusColor = "#111", style }) => (
  <div
    style={{
      position: "relative",
      width: PHONE.width,
      height: PHONE.height,
      transformStyle: "preserve-3d",
      ...style,
    }}
  >
    {Array.from({ length: SLICES }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: PHONE.radius,
          background: i === SLICES - 1 ? "#0A0B0D" : `rgb(${46 - i * 2}, ${48 - i * 2}, ${54 - i * 2})`,
          transform: `translateZ(${-(i + 1) * 1.6}px)`,
        }}
      />
    ))}
    {/* Façade : cadre noir + liseré métal */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: PHONE.radius,
        background: "linear-gradient(145deg, #2C3038 0%, #0C0D10 30%, #0C0D10 70%, #3A3F48 100%)",
        padding: 2,
        boxShadow: "0 60px 120px rgba(0,0,0,0.55)",
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: PHONE.radius - 2, background: "#050506" }} />
    </div>
    {/* Écran */}
    <div
      style={{
        position: "absolute",
        left: PHONE.bezel,
        top: PHONE.bezel,
        width: SCREEN.width,
        height: SCREEN.height,
        borderRadius: SCREEN.radius,
        overflow: "hidden",
        background: COLORS.white,
        transform: "translateZ(0.5px)",
      }}
    >
      {screen}
      <StatusBar color={statusColor} />
      {/* Île dynamique */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          width: 124,
          height: 36,
          marginLeft: -62,
          borderRadius: 20,
          background: "#000",
        }}
      />
      {/* Reflet vitre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(115deg, rgba(255,255,255,0) ${glare * 100 - 30}%, rgba(255,255,255,0.22) ${glare * 100}%, rgba(255,255,255,0) ${glare * 100 + 22}%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </div>
    {/* Calques d'interface éclatés (devant l'écran) */}
    <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>{floating}</div>
  </div>
);

const StatusBar: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 62,
      padding: "0 34px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: FONTS.ui,
      fontWeight: 600,
      fontSize: 18,
      color,
      zIndex: 5,
    }}
  >
    <span>09:41</span>
    <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {[6, 9, 12, 15].map((h) => (
        <span key={h} style={{ width: 4, height: h, borderRadius: 1, background: "currentColor" }} />
      ))}
      <span
        style={{
          marginLeft: 8,
          width: 30,
          height: 14,
          borderRadius: 4,
          border: "2px solid currentColor",
          padding: 1.5,
          display: "inline-flex",
        }}
      >
        <span style={{ flex: 1, borderRadius: 2, background: "currentColor" }} />
      </span>
    </span>
  </div>
);
