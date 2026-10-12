import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND } from "../brand";
import { mix, prog } from "../lib/motion";
import { COLORS, EASE, FONTS } from "../theme";

const LEO_RATIO = BRAND.leoSize.height / BRAND.leoSize.width;

/**
 * Pastille ronde de Léo (en-tête de chat, actions rapides) : visage officiel détouré
 * sur un dégradé rouge UBA, cadré du haut du crâne au menton.
 */
export const LeoAvatar: React.FC<{ size: number; online?: boolean }> = ({ size, online = true }) => {
  // la tête (crâne → menton) remplit ~105 % du diamètre
  const imgH = (size * 1.05) / BRAND.leoFace.chin;
  const imgW = imgH / LEO_RATIO;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          background: `radial-gradient(circle at 35% 25%, ${COLORS.redGlow} 0%, ${COLORS.red} 55%, ${COLORS.redDeep} 100%)`,
          boxShadow: `0 ${size * 0.1}px ${size * 0.25}px rgba(214,27,12,0.3)`,
        }}
      >
        <Img
          src={staticFile(BRAND.leoCutout)}
          style={{
            position: "absolute",
            width: imgW,
            height: imgH,
            left: size / 2 - imgW * BRAND.leoFace.x,
            top: size * 0.04,
          }}
        />
      </div>
      {online ? (
        <div
          style={{
            position: "absolute",
            right: size * 0.01,
            bottom: size * 0.03,
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

/**
 * Léo en buste (visuel officiel détouré) avec sa bulle rouge, version française.
 * enter 0 → 1 : Léo monte dans le cadre · bubble 0 → 1 : la bulle éclot depuis sa pointe ·
 * line2 0 → 1 : seconde ligne de la bulle · exit 0 → 1 : sortie.
 */
export const LeoPresenter: React.FC<{
  t: number;
  height: number;
  enter: number;
  bubble: number;
  line2: number;
  exit: number;
}> = ({ t, height, enter, bubble, line2, exit }) => {
  const width = height / LEO_RATIO;
  const breathe = 1 + Math.sin(t * 1.9) * 0.006;
  const tilt = Math.sin(t * 0.8) * 0.8;
  const bubbleIn = bubble * (1 - exit);
  return (
    <div style={{ position: "relative", width, height }}>
      {/* contre-jour rouge derrière la tête */}
      <div
        style={{
          position: "absolute",
          left: width * 0.5 - height * 0.55,
          top: height * 0.02,
          width: height * 1.1,
          height: height * 1.1,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(214,27,12,0.42) 0%, rgba(214,27,12,0.12) 38%, rgba(214,27,12,0) 68%)",
          opacity: enter * (1 - exit),
        }}
      />
      <Img
        src={staticFile(BRAND.leoCutout)}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width,
          height,
          transformOrigin: "50% 100%",
          transform: `translateY(${mix(height * 0.55, 0, enter) + exit * height * 0.4}px) scale(${breathe}) rotate(${tilt}deg)`,
          opacity: Math.min(1, enter * 1.4) * (1 - exit),
          filter: "drop-shadow(0 0 30px rgba(214,27,12,0.28)) drop-shadow(0 30px 40px rgba(0,0,0,0.5))",
          maskImage: "linear-gradient(to bottom, #000 80%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 80%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* Bulle officielle, en français : éclot depuis sa pointe, au-dessus de la tête */}
      <div
        style={{
          position: "absolute",
          left: width * 0.5,
          top: -height * 0.37,
          transformOrigin: "82% 135%",
          transform: `translateX(-56%) scale(${mix(0.5, 1, bubbleIn)}) rotate(${mix(-8, 0, bubbleIn)}deg)`,
          opacity: Math.min(1, bubbleIn * 1.6),
        }}
      >
        <SpeechBubble height={height * 0.36} line2={line2} />
      </div>
    </div>
  );
};

const SpeechBubble: React.FC<{ height: number; line2: number }> = ({ height, line2 }) => {
  const u = height / 100;
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          padding: `${u * 13}px ${u * 22}px ${u * 15}px`,
          borderRadius: u * 30,
          background: "linear-gradient(160deg, #FF1A12 0%, #E80E0A 60%, #C70B08 100%)",
          boxShadow: "0 24px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          color: COLORS.white,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: u * 6 }}>
          <span style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: u * 19, letterSpacing: "-0.01em" }}>
            Bonjour, je suis
          </span>
          <span
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontStyle: "italic",
              fontSize: u * 36,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              display: "inline-block",
              transform: "skewX(-10deg)",
            }}
          >
            Léo
          </span>
        </div>
        <div
          style={{
            overflow: "hidden",
            height: mix(0, u * 25, prog(line2, 0, 1, EASE.out)),
            opacity: line2,
            fontFamily: FONTS.ui,
            fontWeight: 500,
            fontSize: u * 17,
            marginTop: u * 3 * line2,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          votre banquier virtuel
        </div>
      </div>
      {/* pointe vers Léo, comme sur le visuel officiel */}
      <svg
        width={u * 34}
        height={u * 44}
        viewBox="0 0 34 44"
        style={{ position: "absolute", right: u * 18, top: "calc(100% - 2px)" }}
      >
        <path d="M0 0 H34 C32 16 24 32 6 44 C12 30 12 14 0 0 Z" fill="#D50C09" />
      </svg>
    </div>
  );
};
