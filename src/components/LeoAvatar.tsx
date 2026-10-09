import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND } from "../brand";
import { COLORS } from "../theme";

/**
 * Avatar de Léo, le banquier virtuel (substitut vectoriel : visage minimal et bienveillant).
 * Clignement des yeux toutes les ~3 s pour donner vie au personnage.
 */
export const LeoAvatar: React.FC<{ size: number; t: number; online?: boolean }> = ({ size, t, online = true }) => {
  const phase = (t % 3.1) / 3.1;
  const blink = phase > 0.94 ? 0.15 : 1;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {BRAND.leoAvatar ? (
        <Img
          src={staticFile(BRAND.leoAvatar)}
          style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 32% 28%, ${COLORS.redGlow} 0%, ${COLORS.red} 45%, ${COLORS.redDeep} 100%)`,
            boxShadow: `0 ${size * 0.12}px ${size * 0.3}px rgba(227,23,32,0.35), inset 0 1px 0 rgba(255,255,255,0.35)`,
            position: "relative",
          }}
        >
          <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: "absolute", inset: 0 }}>
            <rect x="12.2" y={15.5 + (1 - blink) * 2.5} width="4.2" height={7 * blink} rx="2.1" fill="white" />
            <rect x="23.6" y={15.5 + (1 - blink) * 2.5} width="4.2" height={7 * blink} rx="2.1" fill="white" />
            <path
              d="M14.5 26.2c1.6 1.7 3.4 2.5 5.5 2.5s3.9-.8 5.5-2.5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}
      {online ? (
        <div
          style={{
            position: "absolute",
            right: size * 0.02,
            bottom: size * 0.04,
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: "50%",
            background: COLORS.success,
            border: `${Math.max(2, size * 0.05)}px solid white`,
          }}
        />
      ) : null}
    </div>
  );
};
