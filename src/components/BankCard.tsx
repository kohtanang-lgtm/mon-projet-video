import React from "react";
import { COLORS, FONTS } from "../theme";
import { UbaLockup } from "./UbaLogo";

/** Format ISO/IEC 7810 ID-1 (85,60 × 53,98 mm). */
export const CARD_RATIO = 85.6 / 53.98;

export type CardVariant = "debit" | "prepaid";

/**
 * Cartes UBA Visa redessinées en vectoriel d'après les visuels fournis (Débit, Prépayée).
 * Disposition fidèle : mention de gamme en haut à gauche, signature UBA en haut à droite,
 * puce, sans contact, numéro, validité, VISA en bas à droite.
 * Données fictives : numéro masqué, titulaire inventé — aucune donnée réelle n'est reproduite.
 */
const DESIGN: Record<
  CardVariant,
  { label: string; background: string; edge: string; facets: number; number: string; expiry: string }
> = {
  debit: {
    label: "Debit",
    background: `linear-gradient(125deg, #F0262A 0%, #E01B22 42%, #C9141B 100%)`,
    edge: "#6E0A0E",
    facets: 0.07,
    number: "4512 •••• •••• 2026",
    expiry: "12/29",
  },
  prepaid: {
    label: "Prepaid",
    background: `linear-gradient(100deg, #5E0A16 0%, ${COLORS.burgundy} 30%, #A8152A 72%, #C21B30 100%)`,
    edge: "#3A050C",
    facets: 0.035,
    number: "4572 •••• •••• 0626",
    expiry: "02/29",
  },
};

/** Facettes « low-poly » très discrètes du fond de carte (repère 100 × 63). */
const FACETS = [
  "0,0 38,0 22,30",
  "38,0 70,0 52,24",
  "22,30 52,24 40,63",
  "52,24 100,10 78,48",
  "70,0 100,0 100,10 52,24",
  "0,30 22,30 0,63",
  "40,63 78,48 100,63",
  "78,48 100,10 100,63",
];

const Chip: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 50 40">
    <defs>
      <linearGradient id="chipGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F3DA9C" />
        <stop offset="0.45" stopColor="#C9A250" />
        <stop offset="0.7" stopColor="#E6C579" />
        <stop offset="1" stopColor="#9C7629" />
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="49" height="39" rx="7" fill="url(#chipGold)" stroke="rgba(70,50,10,0.45)" />
    <g fill="none" stroke="rgba(80,58,15,0.6)" strokeWidth="1.1">
      <path d="M0.5 13.5h14M0.5 26.5h14M35.5 13.5h14M35.5 26.5h14" />
      <path d="M14.5 0.5v39M35.5 0.5v39" />
      <rect x="14.5" y="9" width="21" height="22" rx="4" />
    </g>
  </svg>
);

const Contactless: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
    <path d="M6.5 8.5a5 5 0 0 1 0 7" />
    <path d="M10 6a8.5 8.5 0 0 1 0 12" />
    <path d="M13.5 3.5a12 12 0 0 1 0 17" />
    <path d="M17 1.5a15 15 0 0 1 0 21" />
  </svg>
);

export const BankCard: React.FC<{
  width: number;
  variant?: CardVariant;
  /** Position du reflet lumineux qui balaie la carte (-1 → 2). */
  sheen?: number;
  holder?: string;
  style?: React.CSSProperties;
}> = ({ width, variant = "debit", sheen = -1, holder = "AMINA MAHAMAT", style }) => {
  const design = DESIGN[variant];
  const h = width / CARD_RATIO;
  const u = width / 100; // unité relative (largeur = 100 u, hauteur = 63 u)
  const text = (size: number, weight = 600): React.CSSProperties => ({
    position: "absolute",
    fontFamily: FONTS.ui,
    fontWeight: weight,
    fontSize: u * size,
    color: "rgba(255,255,255,0.96)",
    whiteSpace: "nowrap",
  });
  return (
    <div style={{ position: "relative", width, height: h, transformStyle: "preserve-3d", ...style }}>
      {/* tranche : épaisseur visible quand la carte pivote */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: u * 4.4,
            background: design.edge,
            transform: `translateZ(${-i * 0.9}px)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: u * 4.4,
          background: design.background,
          overflow: "hidden",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.25), 0 40px 80px rgba(0,0,0,0.45)",
        }}
      >
        <svg
          width={width}
          height={h}
          viewBox="0 0 100 63"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0 }}
        >
          {FACETS.map((pts, i) => (
            <polygon
              key={pts}
              points={pts}
              fill={i % 2 ? "black" : "white"}
              opacity={design.facets * (i % 3 === 0 ? 1 : 0.6)}
            />
          ))}
        </svg>
        {/* reflet glissant */}
        <div
          style={{
            position: "absolute",
            inset: "-40%",
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen * 100 + 5}%, rgba(255,255,255,0.42) ${sheen * 100 + 15}%, rgba(255,255,255,0) ${sheen * 100 + 25}%)`,
            mixBlendMode: "overlay",
          }}
        />
        {/* gamme */}
        <div
          style={{
            ...text(variant === "debit" ? 4.2 : 3.4, 600),
            left: u * (variant === "debit" ? 11 : 15),
            top: u * 6.4,
          }}
        >
          {design.label}
        </div>
        {/* signature UBA officielle */}
        <div style={{ position: "absolute", right: u * 5.5, top: u * 3.6 }}>
          <UbaLockup height={u * 9.8} />
        </div>
        <div style={{ position: "absolute", left: u * 11, top: u * 21 }}>
          <Chip w={u * 13} />
        </div>
        <div style={{ position: "absolute", right: u * 5, top: u * 20 }}>
          <Contactless size={u * 7.5} />
        </div>
        <div
          style={{
            ...text(6.3, 500),
            left: u * 11,
            top: u * 33,
            letterSpacing: "0.1em",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 1px 0 rgba(0,0,0,0.18)",
          }}
        >
          {design.number}
        </div>
        {/* validité */}
        <div
          style={{
            position: "absolute",
            left: u * 39,
            top: u * 45,
            display: "flex",
            alignItems: "center",
            gap: u * 1.2,
          }}
        >
          <div style={{ ...text(1.9, 600), position: "static", lineHeight: 1.1, letterSpacing: "0.04em" }}>
            EXPIRES
            <br />
            END OF
          </div>
          <div style={{ ...text(1.6, 700), position: "static" }}>▸</div>
          <div style={{ ...text(4.2, 500), position: "static", fontVariantNumeric: "tabular-nums" }}>
            {design.expiry}
          </div>
        </div>
        {variant === "debit" ? (
          <div style={{ ...text(3.4, 600), left: u * 14, bottom: u * 4.2, letterSpacing: "0.06em" }}>{holder}</div>
        ) : (
          <svg
            width={u * 3.4}
            height={u * 3.4}
            viewBox="0 0 10 10"
            style={{ position: "absolute", left: u * 6, bottom: u * 8 }}
          >
            <path d="M5 1 L9.2 9 L0.8 9 Z" fill="white" />
          </svg>
        )}
        <div
          style={{
            position: "absolute",
            right: u * 5.5,
            bottom: u * 4.2,
            fontFamily: FONTS.display,
            fontStyle: "italic",
            fontWeight: 800,
            fontSize: u * 8.6,
            lineHeight: 1,
            color: "white",
            letterSpacing: "-0.01em",
            transform: "skewX(-6deg)",
          }}
        >
          VISA
        </div>
      </div>
    </div>
  );
};
