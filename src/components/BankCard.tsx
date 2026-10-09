import React from "react";
import { COLORS, FONTS } from "../theme";
import { UbaMark } from "./UbaLogo";

/** Format ISO/IEC 7810 ID-1 (85,60 × 53,98 mm). */
export const CARD_RATIO = 85.6 / 53.98;

const Chip: React.FC<{ w: number }> = ({ w }) => (
  <div
    style={{
      width: w,
      height: w * 0.76,
      borderRadius: w * 0.16,
      background: "linear-gradient(135deg, #F5DFA0 0%, #C9A44C 40%, #E8CB7A 60%, #A9832E 100%)",
      position: "relative",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
    }}
  >
    {[0.33, 0.66].map((p) => (
      <div
        key={p}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${p * 100}%`,
          height: 1.5,
          background: "rgba(80,60,20,0.45)",
        }}
      />
    ))}
    <div
      style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1.5, background: "rgba(80,60,20,0.45)" }}
    />
  </div>
);

const Contactless: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <path d="M7 8.5a5 5 0 0 1 0 7" />
    <path d="M10.5 6a8.5 8.5 0 0 1 0 12" />
    <path d="M14 3.5a12 12 0 0 1 0 17" />
  </svg>
);

/**
 * Carte bancaire UBA (rendu vectoriel). `sheen` 0 → 1 fait glisser un reflet lumineux.
 * Les données affichées (numéro masqué, titulaire) sont fictives.
 */
export const BankCard: React.FC<{
  width: number;
  variant?: "red" | "black";
  sheen?: number;
  holder?: string;
  style?: React.CSSProperties;
}> = ({ width, variant = "red", sheen = -1, holder = "A. MAHAMAT", style }) => {
  const h = width / CARD_RATIO;
  const u = width / 100; // unité relative
  const bg =
    variant === "red"
      ? `linear-gradient(130deg, ${COLORS.redGlow} 0%, ${COLORS.red} 38%, ${COLORS.redDeep} 78%, #6E080D 100%)`
      : "linear-gradient(130deg, #3A3E46 0%, #1A1C21 45%, #0B0C0E 100%)";
  return (
    <div style={{ position: "relative", width, height: h, transformStyle: "preserve-3d", ...style }}>
      {/* tranche */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: u * 4.6,
            background: variant === "red" ? "#5E070B" : "#08090A",
            transform: `translateZ(${-i * 1.2}px)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: u * 4.6,
          background: bg,
          overflow: "hidden",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 40px 80px rgba(0,0,0,0.45)",
        }}
      >
        {/* motif d'ondes */}
        <svg
          width={width}
          height={h}
          viewBox="0 0 100 63"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, opacity: 0.16 }}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M ${-10 + i * 3} 70 C ${30 + i * 4} ${40 - i * 3}, ${55 + i * 2} ${55 - i * 5}, ${110} ${8 + i * 4}`}
              fill="none"
              stroke="white"
              strokeWidth={0.25}
            />
          ))}
        </svg>
        {/* reflet glissant */}
        <div
          style={{
            position: "absolute",
            inset: "-40%",
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen * 100 + 5}%, rgba(255,255,255,0.38) ${sheen * 100 + 15}%, rgba(255,255,255,0) ${sheen * 100 + 25}%)`,
            mixBlendMode: "overlay",
          }}
        />
        <div style={{ position: "absolute", left: u * 7, top: u * 6.5 }}>
          <UbaMark size={u * 8.5} inverted={variant === "red"} />
        </div>
        <div style={{ position: "absolute", right: u * 7, top: u * 7, opacity: 0.9 }}>
          <Contactless size={u * 7} color="white" />
        </div>
        <div style={{ position: "absolute", left: u * 7, top: u * 24 }}>
          <Chip w={u * 12} />
        </div>
        <div
          style={{
            position: "absolute",
            left: u * 7,
            top: u * 39,
            fontFamily: FONTS.ui,
            fontWeight: 500,
            fontSize: u * 5.2,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.94)",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 1px 1px rgba(0,0,0,0.25)",
          }}
        >
          5399 •••• •••• 2026
        </div>
        <div
          style={{
            position: "absolute",
            left: u * 7,
            bottom: u * 6,
            fontFamily: FONTS.ui,
            fontWeight: 600,
            fontSize: u * 3.2,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {holder}
          <span style={{ marginLeft: u * 5, opacity: 0.8 }}>12/29</span>
        </div>
        <div
          style={{
            position: "absolute",
            right: u * 7,
            bottom: u * 5,
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: 800,
            fontSize: u * 7.5,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          VISA
        </div>
      </div>
    </div>
  );
};
