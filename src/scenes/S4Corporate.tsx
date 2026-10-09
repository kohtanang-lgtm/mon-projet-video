import React from "react";
import { AbsoluteFill } from "remotion";
import { Chip, Glass } from "../components/Glass";
import { Icon, IconName } from "../components/Icons";
import { IsoBox, IsoWorld, isoProject } from "../components/Iso";
import { Eyebrow, KineticLine } from "../components/KineticText";
import { float, mix, prog, rise, useTime } from "../lib/motion";
import { CUE, say } from "../timeline/cues";
import { COLORS, EASE, FONTS } from "../theme";

/**
 * S4 · CORPORATE — « Entrepreneurs, PME, grandes organisations : propulsez votre activité vers
 * de nouveaux sommets grâce à notre expertise en Corporate Banking et nos solutions de
 * financement sur-mesure. »
 */

const WORLD_CY = 700;
const ROW_Y = 0;

const TOWERS: { label: string; icon: IconName; x: number; w: number; h: number; at: number }[] = [
  { label: "Entrepreneurs", icon: "briefcase", x: -360, w: 170, h: 110, at: CUE.entrepreneurs },
  { label: "PME", icon: "building", x: 0, w: 190, h: 220, at: CUE.pme },
  { label: "Grandes organisations", icon: "tower", x: 360, w: 210, h: 360, at: CUE.organisations },
];

const towerFaces = {
  top: "linear-gradient(135deg, #454A54 0%, #2B2F36 100%)",
  south:
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 2px, rgba(0,0,0,0) 2px 26px), linear-gradient(180deg, #2A2D34 0%, #16181C 100%)",
  west: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0) 2px 26px), linear-gradient(180deg, #1A1C21 0%, #0E0F12 100%)",
};

const SERVICES: { label: string; icon: IconName }[] = [
  { label: "Gestion de trésorerie", icon: "growth" },
  { label: "Commerce international", icon: "globe" },
  { label: "Financements structurés", icon: "building" },
];

export const S4Corporate: React.FC = () => {
  const t = useTime();

  const worldIn = prog(t, CUE.h24End - 0.1, 0.8, EASE.out);
  const pan = prog(t, CUE.propulsez - 0.4, 1.1, EASE.inOut);
  const cx = mix(980, 1160, pan);
  const growth = mix(1, 1.45, prog(t, CUE.propulsez, CUE.sommets - CUE.propulsez + 0.4, EASE.inOut));
  const dim = prog(t, CUE.expertise - 0.3, 0.8, EASE.inOut);
  const worldOut = prog(t, CUE.surMesureEnd - 0.15, 0.5, EASE.in);
  const lift = mix(0, 70, prog(t, CUE.propulsez, 2.4, EASE.inOut)); // la caméra s'élève avec la courbe

  // Courbe de croissance qui part du toit de la plus haute tour
  const top3 = isoProject(TOWERS[2].x, ROW_Y, TOWERS[2].h * growth);
  const start = { x: cx + top3.x, y: WORLD_CY + lift + top3.y };
  const peak = { x: 1720, y: 150 };
  const draw = prog(t, CUE.propulsez - 0.05, CUE.sommets - CUE.propulsez + 0.25, EASE.inOut);
  const peakHit = prog(t, CUE.sommets - 0.05, 0.9, EASE.out);
  const curve = `M ${start.x} ${start.y} C ${start.x + 120} ${start.y - 40}, ${peak.x - 260} ${peak.y + 260}, ${peak.x} ${peak.y}`;

  // Panneau Corporate Banking
  const panel = prog(t, CUE.expertise - 0.15, 1.0, EASE.out);
  const panelOut = prog(t, CUE.surMesureEnd - 0.2, 0.5, EASE.in);
  const amount = prog(t, CUE.financement, 1.2, EASE.inOut);
  const duration = prog(t, CUE.financement + 0.35, 1.1, EASE.inOut);
  const tailored = prog(t, CUE.surMesure - 0.08, 0.6, EASE.out);

  return (
    <AbsoluteFill>
      {/* ——— Skyline isométrique ——— */}
      <AbsoluteFill
        style={{
          opacity: worldIn * mix(1, 0.3, dim) * (1 - worldOut),
          transform: `translateY(${mix(60, 0, worldIn) + lift}px)`,
        }}
      >
        <IsoWorld cx={cx} cy={WORLD_CY}>
          <div
            style={{
              position: "absolute",
              left: -640,
              top: -320,
              width: 1280,
              height: 640,
              borderRadius: 40,
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(227,23,32,0.10), rgba(227,23,32,0) 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 80px), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 80px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          {TOWERS.map((tw) => {
            const p = prog(t, tw.at - 0.1, 1.0, EASE.out);
            return (
              <IsoBox
                key={tw.label}
                x={tw.x}
                y={ROW_Y}
                w={tw.w}
                d={tw.w}
                h={tw.h * p * growth}
                faces={towerFaces}
                opacity={Math.min(1, p * 3)}
                shadow={0.55}
                topStyle={{
                  boxShadow: `inset 0 0 0 2px rgba(227,23,32,${0.8 * p}), inset 0 0 50px rgba(227,23,32,0.3)`,
                }}
              />
            );
          })}
        </IsoWorld>
        {TOWERS.map((tw) => {
          const p = prog(t, tw.at - 0.05, 0.9, EASE.out);
          const a = isoProject(tw.x, ROW_Y, tw.h * prog(t, tw.at - 0.1, 1.0, EASE.out) * growth);
          return (
            <div
              key={tw.label}
              style={{
                position: "absolute",
                left: cx + a.x,
                top: WORLD_CY + a.y,
                transform: `translate(-50%, -100%) translateY(${float(t, 4, 4, tw.x / 300) - 30}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, ...rise(p, dim, 30) }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 14px 30px rgba(227,23,32,0.35)",
                  }}
                >
                  <Icon name={tw.icon} size={36} strokeWidth={1.9} progress={prog(t, tw.at, 1.0, EASE.inOut)} />
                </div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    fontSize: 32,
                    color: COLORS.white,
                    whiteSpace: "nowrap",
                    textShadow: "0 6px 24px rgba(0,0,0,0.6)",
                  }}
                >
                  {tw.label}
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* ——— Courbe de croissance vers les sommets ——— */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, opacity: (1 - dim * 0.65) * (1 - worldOut) }}
      >
        <defs>
          <filter id="s4glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <path
          d={curve}
          fill="none"
          stroke={COLORS.red}
          strokeWidth={20}
          opacity={0.4}
          filter="url(#s4glow)"
          pathLength={1}
          strokeDasharray={`${draw} 1`}
        />
        <path
          d={curve}
          fill="none"
          stroke={COLORS.redGlow}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${draw} 1`}
        />
        {[0, 1, 2].map((k) => {
          const r = prog(t, CUE.sommets + k * 0.25, 1.2, EASE.out);
          return (
            <circle
              key={k}
              cx={peak.x}
              cy={peak.y}
              r={10 + r * 90}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={2}
              opacity={(1 - r) * peakHit}
            />
          );
        })}
        <circle cx={peak.x} cy={peak.y} r={34} fill={COLORS.red} opacity={0.5 * peakHit} filter="url(#s4glow)" />
        <circle cx={peak.x} cy={peak.y} r={11 * peakHit} fill="white" />
      </svg>

      {/* ——— Titrage gauche ——— */}
      <div style={{ position: "absolute", left: 140, top: 160 }}>
        <Eyebrow t={t} at={CUE.entrepreneurs} label="Entreprises & institutions" exitAt={CUE.expertise - 0.3} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 250, width: 900 }}>
        <KineticLine
          t={t}
          words={say("propulsez").map((w) => ({ ...w, text: "Propulsez" }))}
          size={104}
          weight={800}
          color={COLORS.red}
          exitAt={CUE.expertise - 0.3}
        />
        <KineticLine t={t} words={say("votre activité")} size={72} weight={700} exitAt={CUE.expertise - 0.3} />
        <div style={{ height: 12 }} />
        <KineticLine
          t={t}
          words={say("vers de nouveaux sommets")}
          size={52}
          weight={600}
          color={COLORS.silver}
          exitAt={CUE.expertise - 0.3}
        />
      </div>
      <div style={{ position: "absolute", left: 140, top: 320 }}>
        <Eyebrow t={t} at={CUE.expertise} label="Notre expertise" exitAt={CUE.surMesureEnd - 0.2} />
        <div style={{ height: 26 }} />
        <KineticLine t={t} words={say("Corporate")} size={118} weight={800} exitAt={CUE.surMesureEnd - 0.2} />
        <KineticLine
          t={t}
          words={say("Banking")}
          size={118}
          weight={800}
          color={COLORS.red}
          exitAt={CUE.surMesureEnd - 0.2}
        />
      </div>

      {/* ——— Panneau de services (verre dépoli réel) ——— */}
      <div
        style={{
          position: "absolute",
          left: 1010,
          top: 200,
          transform: `translateX(${mix(220, 0, panel) - panelOut * 120}px)`,
          opacity: panel * (1 - panelOut),
          filter: panel < 1 || panelOut > 0 ? `blur(${(1 - panel) * 12 + panelOut * 12}px)` : undefined,
        }}
      >
        <Glass
          frosted
          radius={36}
          style={{
            width: 770,
            padding: "44px 48px 40px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04))",
          }}
        >
          {SERVICES.map((sv, i) => {
            const p = prog(t, CUE.corporate + 0.25 + i * 0.22, 0.7);
            return (
              <div
                key={sv.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "20px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  ...rise(p, 0, 22, 8),
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    name={sv.icon}
                    size={34}
                    color={COLORS.red}
                    strokeWidth={1.9}
                    progress={prog(t, CUE.corporate + 0.3 + i * 0.22, 0.9, EASE.inOut)}
                  />
                </div>
                <div style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: 32, color: COLORS.white }}>
                  {sv.label}
                </div>
              </div>
            );
          })}

          {/* Module de financement sur-mesure */}
          <div style={{ marginTop: 30, ...rise(prog(t, CUE.financement - 0.15, 0.8), 0, 24) }}>
            <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 34, color: COLORS.white }}>
              Financement
            </div>
            {[
              { label: "Montant", value: `${Math.round(mix(50, 250, amount))} M FCFA`, p: amount, to: 72 },
              { label: "Durée", value: `${Math.round(mix(12, 36, duration))} mois`, p: duration, to: 58 },
            ].map((row) => (
              <div key={row.label} style={{ marginTop: 22 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: FONTS.ui,
                    fontWeight: 600,
                    fontSize: 24,
                  }}
                >
                  <span style={{ color: COLORS.silver }}>{row.label}</span>
                  <span style={{ color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 10,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.12)",
                    marginTop: 14,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${mix(18, row.to, row.p)}%`,
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${COLORS.redDeep}, ${COLORS.redGlow})`,
                      boxShadow: "0 0 18px rgba(227,23,32,0.6)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${mix(18, row.to, row.p)}%`,
                      top: "50%",
                      width: 32,
                      height: 32,
                      marginLeft: -16,
                      marginTop: -16,
                      borderRadius: "50%",
                      background: "white",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                    }}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}>
              <div
                style={{
                  transform: `scale(${mix(0.85, 1, tailored)})`,
                  opacity: tailored,
                  transformOrigin: "100% 50%",
                }}
              >
                <Chip
                  icon="check"
                  label="Sur-mesure"
                  tone="red"
                  size={30}
                  iconProgress={prog(t, CUE.surMesure, 0.6, EASE.inOut)}
                />
              </div>
            </div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};
