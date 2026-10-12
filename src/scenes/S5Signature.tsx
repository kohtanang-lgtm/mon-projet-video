import React from "react";
import { AbsoluteFill } from "remotion";
import { Globe } from "../components/Globe";
import { Icon } from "../components/Icons";
import { KineticLine } from "../components/KineticText";
import { UbaSignature } from "../components/UbaLogo";
import { BRAND } from "../brand";
import { mix, prog, rise, useTime } from "../lib/motion";
import { CUE, TOTAL_DURATION, say } from "../timeline/cues";
import { COLORS, EASE, FONTS } from "../theme";

/**
 * S5 · SIGNATURE — « UBA Tchad, la banque globale de l'Afrique.
 * Rejoignez-nous dès aujourd'hui sur ubachad.com. »
 *
 * Le fil rouge s'épaissit en icône officielle UBA, les deux formes de la marque glissent
 * l'une contre l'autre et se verrouillent, « UBA » monte, puis la signature se déploie.
 * Le globe relie ensuite N'Djaména aux places financières du groupe. Pack-shot tenu
 * jusqu'au fondu final.
 */

const LOGO_SIZE = 180;
const LOGO_Y = 268;
/** Décalage initial : l'icône naît au centre exact de l'écran, puis la signature s'ouvre. */
const LOCKUP_SHIFT = 306;

export const S5Signature: React.FC = () => {
  const t = useTime();

  const line = prog(t, CUE.surMesureEnd - 0.05, CUE.ubaFinal - CUE.surMesureEnd + 0.05, EASE.inOut);
  const reveal = prog(t, CUE.ubaFinal - 0.05, 0.55, EASE.out); // trait → carré
  const mark = prog(t, CUE.ubaFinal + 0.15, 0.85, EASE.out); // assemblage de la marque
  const word = prog(t, CUE.ubaFinal + 0.38, 0.6, EASE.out); // « UBA » sur « Tchad »
  const name = prog(t, CUE.ubaFinal + 0.42, 1.0, EASE.inOut);
  const globe = prog(t, CUE.banqueGlobale - 0.4, 1.6, EASE.out);
  const links = prog(t, CUE.banqueGlobale + 0.3, 2.4, EASE.inOut);
  const facing = 15 + (t - CUE.afriqueEnd) * 4; // l'Afrique passe face caméra sur « l'Afrique »
  const cta = prog(t, CUE.rejoignez - 0.1, 0.9, EASE.out);
  const urlBox = prog(t, CUE.url - 0.6, 0.7, EASE.out);
  const typed = prog(t, CUE.url - 0.05, 0.75, EASE.linear);
  const caretOn = Math.floor(t * 2.2) % 2 === 0 || typed < 1;
  const sheen = prog(t, CUE.voEnd + 0.3, 1.4, EASE.inOut);
  const breathe = mix(1, 1.03, prog(t, CUE.ubaFinal, TOTAL_DURATION - CUE.ubaFinal, EASE.linear));

  return (
    <AbsoluteFill style={{ transform: `scale(${breathe})` }}>
      {/* Globe */}
      <div
        style={{
          position: "absolute",
          left: 960 - 330 * 1.3,
          top: 470 - 330 * 1.3,
          opacity: globe,
          transform: `scale(${mix(0.9, 1, globe)})`,
        }}
      >
        <Globe radius={330} facing={facing} reveal={globe} links={links} t={t} />
      </div>
      {/* voile pour détacher la signature du globe */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(32% 20% at 50% 34%, rgba(6,6,7,0.82) 0%, rgba(6,6,7,0) 100%)",
          opacity: globe,
        }}
      />

      {/* Fil rouge → bloc-marque */}
      {reveal <= 0 ? (
        <div
          style={{
            position: "absolute",
            left: 960 - (LOGO_SIZE * line) / 2,
            top: LOGO_Y + LOGO_SIZE / 2 - LOGO_SIZE * 0.016,
            width: LOGO_SIZE * line,
            height: LOGO_SIZE * 0.032,
            borderRadius: 3,
            background: COLORS.red,
            boxShadow: `0 0 30px ${COLORS.red}, 0 0 80px rgba(214,27,12,0.6)`,
            opacity: Math.min(1, line * 3),
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LOGO_Y,
          height: LOGO_SIZE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          visibility: reveal > 0 ? "visible" : "hidden",
        }}
      >
        <div style={{ transform: `translateX(${(1 - name) * LOCKUP_SHIFT}px)`, position: "relative" }}>
          <UbaSignature size={LOGO_SIZE} square={reveal} mark={mark} word={word} nameReveal={name} />
          {/* reflet final sur la signature */}
          <div
            style={{
              position: "absolute",
              inset: -10,
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen * 140 - 30}%, rgba(255,255,255,0.35) ${sheen * 140 - 15}%, rgba(255,255,255,0) ${sheen * 140}%)`,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Signature verbale */}
      <div style={{ position: "absolute", top: 525, width: 1920 }}>
        <KineticLine
          t={t}
          words={say("la banque globale de l'Afrique").map((w, i) => ({
            ...w,
            text: i === 0 ? "La" : w.text,
            accent: w.text === "globale",
          }))}
          size={50}
          weight={600}
          align="center"
          tracking="-0.01em"
        />
      </div>

      {/* Appel à l'action */}
      <div style={{ position: "absolute", top: 660, width: 1920 }}>
        <KineticLine
          t={t}
          words={say("Rejoignez-nous dès aujourd'hui")}
          size={34}
          weight={500}
          font={FONTS.ui}
          color={COLORS.silver}
          align="center"
          tracking="0"
        />
      </div>
      <div style={{ position: "absolute", top: 740, width: 1920, display: "flex", justifyContent: "center", gap: 24 }}>
        <div style={rise(urlBox, 0, 24)}>
          <div
            style={{
              height: 84,
              minWidth: 420,
              padding: "0 34px 0 26px",
              borderRadius: 42,
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 38,
              color: COLORS.anthracite,
              letterSpacing: "-0.01em",
            }}
          >
            <Icon name="globe" size={40} color={COLORS.red} strokeWidth={2} />
            <span>
              {BRAND.url.slice(0, Math.round(typed * BRAND.url.length))}
              <span style={{ color: COLORS.red, opacity: caretOn ? 1 : 0 }}>|</span>
            </span>
          </div>
        </div>
        <div style={rise(cta, 0, 24)}>
          <div
            style={{
              height: 84,
              padding: "0 40px",
              borderRadius: 42,
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: `linear-gradient(135deg, ${COLORS.redGlow}, ${COLORS.red} 50%, ${COLORS.redDeep})`,
              boxShadow: `0 24px 50px rgba(214,27,12,${0.35 + 0.15 * Math.sin(t * 3)})`,
              fontFamily: FONTS.ui,
              fontWeight: 700,
              fontSize: 32,
              color: COLORS.white,
            }}
          >
            Ouvrir un compte
            <span style={{ fontSize: 34, transform: `translateX(${Math.max(0, Math.sin(t * 3)) * 6}px)` }}>→</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
