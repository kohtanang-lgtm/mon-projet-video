import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BankCard } from "../components/BankCard";
import { Chip, Glass } from "../components/Glass";
import { Icon, IconName } from "../components/Icons";
import { IsoBox, IsoWorld, isoProject } from "../components/Iso";
import { KineticLine } from "../components/KineticText";
import { float, mix, prog, rise, springAt, useTime } from "../lib/motion";
import { CUE, say } from "../timeline/cues";
import { COLORS, EASE, FONTS } from "../theme";

/**
 * S2 · PARTICULIERS — « Particuliers, familles, bâtisseurs du quotidien… UBA Tchad vous
 * accompagne avec des solutions bancaires de proximité, des comptes adaptés à votre style
 * de vie et des cartes sécurisées pour chaque instant. »
 */

/** Caméra : monde centré pendant l'énumération, puis panoramique vers la droite pour le titrage. */
const worldCx = (t: number) => mix(990, 1190, prog(t, CUE.uba - 0.45, 1.0, EASE.inOut));
const WORLD_CY = 520;
const TILE = { w: 220, h: 26 };
const ROW_Y = -60;

const PROFILES: { label: string; icon: IconName; x: number; at: number }[] = [
  { label: "Particuliers", icon: "user", x: -330, at: CUE.particuliers },
  { label: "Familles", icon: "family", x: 0, at: CUE.familles },
  { label: "Bâtisseurs du quotidien", icon: "builder", x: 330, at: CUE.batisseurs },
];
const HUB = { x: 40, y: 380 };
const PIN = { x: -430, y: 300 };

const tileFaces = (glow: number) => ({
  top: `linear-gradient(135deg, #343841 0%, #22252B 55%, #1A1C21 100%)`,
  south: `linear-gradient(180deg, ${glow > 0 ? "#3A1013" : "#1B1D22"} 0%, #121317 100%)`,
  west: "linear-gradient(90deg, #0F1013 0%, #17191D 100%)",
});

/** Groupe « dalle + pictogramme debout + libellé » d'un profil client. */
const ProfileTile: React.FC<{ t: number; profile: (typeof PROFILES)[number]; exit: number }> = ({
  t,
  profile,
  exit,
}) => {
  const p = prog(t, profile.at - 0.12, 0.9, EASE.out);
  const z = mix(240, 0, p) - exit * 60;
  return (
    <IsoBox
      x={profile.x}
      y={ROW_Y}
      w={TILE.w}
      d={TILE.w}
      h={TILE.h}
      z={z}
      faces={tileFaces(p)}
      opacity={p * (1 - exit)}
      shadow={0.5}
      topStyle={{
        boxShadow: `inset 0 0 0 2px rgba(227,23,32,${0.65 * p}), inset 0 0 40px rgba(227,23,32,${0.25 * p})`,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: `0 0 0 ${mix(0, 22, p)}px rgba(227,23,32,0.06)`,
        }}
      />
    </IsoBox>
  );
};

const ProfileBillboard: React.FC<{ t: number; cx: number; profile: (typeof PROFILES)[number]; exit: number }> = ({
  t,
  cx,
  profile,
  exit,
}) => {
  const p = prog(t, profile.at - 0.05, 0.9, EASE.out);
  const draw = prog(t, profile.at, 1.1, EASE.inOut);
  const anchor = isoProject(profile.x, ROW_Y, TILE.h);
  return (
    <div
      style={{
        position: "absolute",
        left: cx + anchor.x,
        top: WORLD_CY + anchor.y,
        transform: `translate(-50%, -100%) translateY(${float(t, 5, 4, profile.x / 200) - 18}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, ...rise(p, exit, 50) }}>
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.16), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 24px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Icon name={profile.icon} size={60} strokeWidth={1.7} progress={draw} />
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 32,
            color: COLORS.white,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            textShadow: "0 6px 24px rgba(0,0,0,0.6)",
          }}
        >
          {profile.label}
        </div>
      </div>
    </div>
  );
};

/** Fil lumineux au sol (plan isométrique) du bloc UBA vers chaque profil. */
const FloorLinks: React.FC<{ t: number; exit: number }> = ({ t, exit }) => {
  const draw = prog(t, CUE.accompagne - 0.1, 1.0, EASE.inOut);
  const flow = -t * 0.6;
  return (
    <svg
      width={1600}
      height={1200}
      viewBox="-800 -600 1600 1200"
      style={{
        position: "absolute",
        left: -800,
        top: -600,
        overflow: "visible",
        transform: "translateZ(1px)",
        opacity: 1 - exit,
      }}
    >
      {PROFILES.map((pr) => (
        <g key={pr.label}>
          <path
            d={`M ${HUB.x} ${HUB.y} C ${HUB.x} ${(HUB.y + ROW_Y) / 2}, ${pr.x} ${(HUB.y + ROW_Y) / 2}, ${pr.x} ${ROW_Y + TILE.w / 2}`}
            fill="none"
            stroke={COLORS.red}
            strokeWidth={14}
            opacity={0.4}
            pathLength={1}
            strokeDasharray={`${draw} 1`}
            style={{ filter: "blur(6px)" }}
          />
          <path
            d={`M ${HUB.x} ${HUB.y} C ${HUB.x} ${(HUB.y + ROW_Y) / 2}, ${pr.x} ${(HUB.y + ROW_Y) / 2}, ${pr.x} ${ROW_Y + TILE.w / 2}`}
            fill="none"
            stroke={COLORS.redGlow}
            strokeWidth={4.5}
            pathLength={1}
            strokeDasharray={draw < 1 ? `${draw} 1` : "0.06 0.04"}
            strokeDashoffset={draw < 1 ? 0 : flow}
            strokeLinecap="round"
          />
        </g>
      ))}
      {/* ondes de proximité autour de l'agence */}
      {[0, 1, 2].map((k) => {
        const start = CUE.solutions + k * 0.45;
        const r = prog(t, start, 1.6, EASE.out);
        const loop = t > start + 1.6 ? ((t - start - 1.6) % 1.4) / 1.4 : 0;
        const radius = t > start + 1.6 ? 40 + loop * 150 : 40 + r * 150;
        const alpha = t > start + 1.6 ? 0.55 * (1 - loop) : 0.55 * (1 - r) * Number(t >= start);
        return (
          <circle
            key={k}
            cx={PIN.x}
            cy={PIN.y}
            r={radius}
            fill="none"
            stroke={COLORS.red}
            strokeWidth={2.5}
            opacity={alpha}
          />
        );
      })}
    </svg>
  );
};

export const S2Particuliers: React.FC = () => {
  const t = useTime();
  const { fps } = useVideoConfig();

  // — Phase A/B : profils + bloc UBA + proximité —
  const worldIn = prog(t, CUE.ambitionsEnd - 0.1, 1.0, EASE.out);
  const worldOut = prog(t, CUE.comptes - 0.5, 0.6, EASE.in);
  const hub = springAt(t, CUE.uba - 0.1, fps, { damping: 18, mass: 0.9 });
  const pinDrop = prog(t, CUE.solutions - 0.1, 0.7, EASE.out);
  const hubPos = isoProject(HUB.x, HUB.y, 70);
  const pinPos = isoProject(PIN.x, PIN.y, 0);
  const cx = worldCx(t);

  // — Phase C : comptes —
  const accA = prog(t, CUE.comptes - 0.15, 0.9, EASE.out);
  const accB = prog(t, CUE.comptes + 0.15, 0.9, EASE.out);
  const accOut = prog(t, CUE.cartes - 0.45, 0.5, EASE.in);
  const fit = prog(t, CUE.style - 0.1, 0.7, EASE.out);

  // — Phase D : cartes —
  const card = prog(t, CUE.cartes - 0.3, 1.2, EASE.out);
  const card2 = prog(t, CUE.cartes - 0.12, 1.2, EASE.out);
  const cardOut = prog(t, CUE.instantEnd - 0.1, 0.55, EASE.in);
  const sheen = mix(-0.6, 1.4, prog(t, CUE.securisees, 1.3, EASE.inOut));

  return (
    <AbsoluteFill>
      {/* ——— Monde isométrique ——— */}
      <AbsoluteFill
        style={{ opacity: worldIn * (1 - worldOut), transform: `translateY(${mix(40, 0, worldIn) + worldOut * 60}px)` }}
      >
        <IsoWorld cx={cx} cy={WORLD_CY}>
          {/* plateau */}
          <div
            style={{
              position: "absolute",
              left: -620,
              top: -380,
              width: 1240,
              height: 880,
              borderRadius: 48,
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.05), rgba(255,255,255,0) 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 80px), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 80px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <FloorLinks t={t} exit={worldOut} />
          {PROFILES.map((pr) => (
            <ProfileTile key={pr.label} t={t} profile={pr} exit={worldOut} />
          ))}
          {/* Bloc UBA en volume */}
          <IsoBox
            x={HUB.x}
            y={HUB.y}
            w={190}
            d={190}
            h={70 * hub}
            z={0}
            faces={{
              top: `linear-gradient(135deg, ${COLORS.redGlow} 0%, ${COLORS.red} 50%, ${COLORS.redDeep} 100%)`,
              south: `linear-gradient(180deg, ${COLORS.redDeep} 0%, #5C070B 100%)`,
              west: "linear-gradient(90deg, #4A0609 0%, #7A0A10 100%)",
            }}
            shadow={0.6 * hub}
            topStyle={{ opacity: Math.min(1, hub * 1.5) }}
          >
            <div style={{ transform: "rotate(42deg)", opacity: prog(t, CUE.uba + 0.2, 0.6) }}>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 800,
                  fontSize: 64,
                  color: "white",
                  letterSpacing: "-0.03em",
                }}
              >
                UBA
              </span>
            </div>
          </IsoBox>
        </IsoWorld>

        {PROFILES.map((pr) => (
          <ProfileBillboard key={pr.label} t={t} cx={cx} profile={pr} exit={worldOut} />
        ))}

        {/* Repère de proximité */}
        <div
          style={{
            position: "absolute",
            left: cx + pinPos.x,
            top: WORLD_CY + pinPos.y,
            transform: `translate(-50%, -100%) translateY(${mix(-160, 0, pinDrop)}px)`,
            opacity: pinDrop,
          }}
        >
          <Icon
            name="pin"
            size={92}
            color={COLORS.red}
            strokeWidth={2.2}
            style={{ filter: `drop-shadow(0 0 18px ${COLORS.red})` }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: cx + pinPos.x - 70,
            top: WORLD_CY + pinPos.y + 10,
            transform: "translateX(-100%)",
          }}
        >
          <div style={rise(prog(t, CUE.proximite - 0.1, 0.7), 0, 24)}>
            <Chip icon="pin" label="Solutions de proximité" size={28} />
          </div>
        </div>
        {/* Halo au-dessus du bloc UBA */}
        <div
          style={{
            position: "absolute",
            left: cx + hubPos.x - 160,
            top: WORLD_CY + hubPos.y - 160,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(227,23,32,0.35) 0%, rgba(227,23,32,0) 70%)",
            opacity: hub,
          }}
        />
      </AbsoluteFill>

      {/* Titrage gauche — phase B */}
      <div style={{ position: "absolute", left: 140, top: 210, width: 640 }}>
        <KineticLine
          t={t}
          words={say("UBA Tchad")}
          size={92}
          weight={800}
          color={COLORS.red}
          exitAt={CUE.comptes - 0.5}
        />
        <KineticLine t={t} words={say("vous accompagne")} size={64} weight={600} exitAt={CUE.comptes - 0.5} />
      </div>

      {/* ——— Phase C : comptes adaptés ——— */}
      <div style={{ position: "absolute", left: 140, top: 380, width: 820 }}>
        <KineticLine t={t} words={say("des comptes adaptés")} size={76} weight={700} exitAt={CUE.cartes - 0.45} />
        <KineticLine
          t={t}
          words={say("à votre style de vie").map((w) => ({
            ...w,
            accent: /style|de|vie/.test(w.text) && w.text !== "à",
          }))}
          size={76}
          weight={700}
          exitAt={CUE.cartes - 0.45}
        />
      </div>
      <AbsoluteFill style={{ perspective: 1800 }}>
        {[
          {
            title: "Compte courant",
            sub: "Pour le quotidien",
            icon: "card" as IconName,
            p: accA,
            x: 1000,
            y: 300,
            z: 0,
          },
          {
            title: "Compte épargne",
            sub: "Pour vos projets",
            icon: "growth" as IconName,
            p: accB,
            x: 1060,
            y: 560,
            z: -60,
          },
        ].map((a, i) => (
          <div
            key={a.title}
            style={{
              position: "absolute",
              left: a.x,
              top: a.y,
              transform: `translateX(${mix(260, 0, a.p) - accOut * 340}px) translateZ(${a.z}px) rotateY(${mix(-38, -14, a.p)}deg) rotateX(5deg)`,
              opacity: a.p * (1 - accOut),
              filter: a.p < 1 || accOut > 0 ? `blur(${(1 - a.p) * 10 + accOut * 10}px)` : undefined,
            }}
          >
            <Glass
              style={{ width: 720, height: 200, padding: "0 44px", display: "flex", alignItems: "center", gap: 32 }}
              accent={i === 0 ? fit : 0}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 26,
                  background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 16px 30px rgba(227,23,32,0.35)",
                }}
              >
                <Icon name={a.icon} size={54} strokeWidth={1.9} progress={prog(t, CUE.comptes + i * 0.3, 1)} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    fontSize: 42,
                    color: COLORS.white,
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.title}
                </div>
                <div
                  style={{ fontFamily: FONTS.ui, fontWeight: 500, fontSize: 26, color: COLORS.silver, marginTop: 6 }}
                >
                  {a.sub}
                </div>
              </div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: fit > 0 ? `rgba(43,212,125,${0.18 * fit})` : "transparent",
                  border: `2px solid rgba(43,212,125,${fit})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name="check"
                  size={32}
                  color={COLORS.success}
                  strokeWidth={2.6}
                  progress={prog(t, CUE.style + i * 0.18, 0.6, EASE.inOut)}
                />
              </div>
            </Glass>
          </div>
        ))}
      </AbsoluteFill>

      {/* ——— Phase D : cartes sécurisées ——— */}
      <div style={{ position: "absolute", left: 140, top: 380, width: 700 }}>
        <KineticLine
          t={t}
          words={say("des cartes sécurisées").map((w) => ({ ...w, accent: w.text === "sécurisées" }))}
          size={76}
          weight={700}
          exitAt={CUE.instantEnd - 0.15}
        />
        <KineticLine
          t={t}
          words={say("pour chaque instant")}
          size={76}
          weight={700}
          color={COLORS.silver}
          exitAt={CUE.instantEnd - 0.15}
        />
      </div>
      <AbsoluteFill style={{ perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: 1010,
            top: 300,
            transformStyle: "preserve-3d",
            transform: `translateZ(${mix(-700, -120, card2) + cardOut * 500}px) translateX(${mix(300, 120, card2)}px) translateY(${mix(-60, -90, card2)}px) rotateY(${mix(70, -20, card2)}deg) rotateZ(${mix(-14, -9, card2)}deg)`,
            opacity: card2 * (1 - cardOut),
          }}
        >
          <BankCard width={560} variant="black" />
        </div>
        <div
          style={{
            position: "absolute",
            left: 1010,
            top: 330,
            transformStyle: "preserve-3d",
            transform: `translateZ(${mix(-800, 0, card) + cardOut * 1300}px) translateX(${mix(420, 0, card) - cardOut * 120}px) rotateY(${mix(75, -16, card) - cardOut * 30}deg) rotateX(${mix(18, 6, card) + float(t, 1.5, 5)}deg) rotateZ(${mix(10, 3, card)}deg)`,
            opacity: card * (1 - prog(t, CUE.instantEnd + 0.15, 0.3, EASE.in)),
            filter: cardOut > 0 ? `blur(${cardOut * 14}px)` : undefined,
          }}
        >
          <BankCard width={600} variant="red" sheen={sheen} />
        </div>
      </AbsoluteFill>
      <div
        style={{ position: "absolute", left: 980, top: 770, ...rise(prog(t, CUE.securisees + 0.05, 0.8), cardOut, 30) }}
      >
        <Chip icon="shield" label="Paiements sécurisés" iconProgress={prog(t, CUE.securisees + 0.1, 0.9, EASE.inOut)} />
      </div>
      <div style={{ position: "absolute", left: 1290, top: 190, ...rise(prog(t, CUE.chaque - 0.1, 0.8), cardOut, 30) }}>
        <Chip icon="globe" label="Acceptée dans +200 pays" iconProgress={prog(t, CUE.chaque, 0.9, EASE.inOut)} />
      </div>
    </AbsoluteFill>
  );
};
