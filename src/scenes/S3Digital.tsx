import React from "react";
import { AbsoluteFill } from "remotion";
import { Chip } from "../components/Glass";
import { Icon, IconName } from "../components/Icons";
import { KineticLine } from "../components/KineticText";
import { LeoAvatar } from "../components/LeoAvatar";
import { Phone, PHONE, SCREEN } from "../components/Phone";
import { UbaMark } from "../components/UbaLogo";
import { fcfa, float, mix, prog, rise, useTime } from "../lib/motion";
import { CUE, end, say } from "../timeline/cues";
import { COLORS, EASE, FONTS } from "../theme";

/**
 * S3 · BANQUE DIGITALE — « Plus besoin d'attendre. Prenez le contrôle de votre argent du bout
 * des doigts. Ouvrez votre compte en ligne en quelques minutes, consultez vos soldes en temps
 * réel et laissez Léo, votre banquier virtuel, simplifier vos paiements et transferts 24h/24. »
 */

const PHONE_POS = { x: 1300, y: 540 };
const INK = "#15171B";
const GREY = "#6B7079";
const PANEL = "#F3F4F6";

/** Moments clés internes à la scène. */
const T = {
  phoneIn: CUE.attendre + 0.35,
  formIn: CUE.ouvrez - 0.12,
  formDone: CUE.consultez - 0.45,
  dashIn: CUE.consultez - 0.1,
  chatIn: CUE.leo - 0.45,
  exit: CUE.h24End - 0.1,
};

// ————————————————————————————————————— Écrans de l'application

const ScreenWelcome: React.FC<{ t: number }> = ({ t }) => {
  const tap = prog(t, CUE.doigts - 0.05, 0.7, EASE.out);
  const press = Math.sin(Math.min(1, prog(t, CUE.doigts - 0.05, 0.35, EASE.linear)) * Math.PI);
  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.white }}>
      <div
        style={{
          height: 480,
          background: `linear-gradient(160deg, ${COLORS.redGlow} 0%, ${COLORS.red} 45%, ${COLORS.redDeep} 100%)`,
          padding: "120px 36px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width={SCREEN.width} height={480} style={{ position: "absolute", left: 0, top: 0, opacity: 0.14 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={`M -20 ${420 - i * 22} C 120 ${300 - i * 30}, 260 ${470 - i * 18}, 440 ${220 - i * 26}`}
              stroke="white"
              fill="none"
              strokeWidth={1.4}
            />
          ))}
        </svg>
        <UbaMark size={64} inverted />
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 50,
            color: "white",
            marginTop: 56,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Bienvenue
        </div>
        <div
          style={{
            fontFamily: FONTS.ui,
            fontWeight: 500,
            fontSize: 23,
            color: "rgba(255,255,255,0.86)",
            marginTop: 12,
            lineHeight: 1.35,
          }}
        >
          Votre banque, partout
          <br />
          et à tout moment.
        </div>
      </div>
      <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            position: "relative",
            height: 76,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})`,
            color: "white",
            fontFamily: FONTS.ui,
            fontWeight: 700,
            fontSize: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 - press * 0.04})`,
            boxShadow: "0 16px 30px rgba(227,23,32,0.35)",
            overflow: "visible",
          }}
        >
          Ouvrir un compte
          {/* empreinte du doigt */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 220,
              height: 220,
              marginLeft: -110,
              marginTop: -110,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.9)",
              transform: `scale(${mix(0.1, 1, tap)})`,
              opacity: (1 - tap) * Number(t >= CUE.doigts - 0.05),
            }}
          />
        </div>
        <div
          style={{
            height: 76,
            borderRadius: 22,
            border: `2px solid ${COLORS.red}`,
            color: COLORS.red,
            fontFamily: FONTS.ui,
            fontWeight: 700,
            fontSize: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Se connecter
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
          <div
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: 19,
              color: GREY,
              background: PANEL,
              borderRadius: 999,
              padding: "10px 20px",
            }}
          >
            Magic Banking <span style={{ color: COLORS.red, fontWeight: 700 }}>*919#</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FIELDS = [
  { label: "Nom complet", value: "Amina Mahamat" },
  { label: "Téléphone", value: "+235 66 •• •• ••" },
  { label: "Type de compte", value: "Compte courant" },
  { label: "Agence", value: "N'Djaména · Siège" },
];

const ScreenForm: React.FC<{ t: number }> = ({ t }) => {
  const span = T.formDone - (T.formIn + 0.5);
  const success = prog(t, T.formDone, 0.6, EASE.out);
  return (
    <div style={{ position: "absolute", inset: 0, background: COLORS.white, padding: "86px 30px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: FONTS.ui, fontSize: 30, color: INK }}>‹</div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 30, color: INK, letterSpacing: "-0.02em" }}>
          Ouvrir un compte
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "22px 0 8px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: "#E7E8EB", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${prog(t, T.formIn + 0.4 + (i * span) / 3, span / 3, EASE.inOut) * 100}%`,
                background: COLORS.red,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ fontFamily: FONTS.ui, fontWeight: 500, fontSize: 18, color: GREY, marginBottom: 22 }}>
        Demande en ligne · 100 % digitale
      </div>
      {FIELDS.map((f, i) => {
        const start = T.formIn + 0.45 + (i * span) / FIELDS.length;
        const typed = prog(t, start, (span / FIELDS.length) * 0.85, EASE.linear);
        const shown = f.value.slice(0, Math.round(typed * f.value.length));
        const focus = typed > 0 && typed < 1;
        return (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: 17, color: GREY, marginBottom: 7 }}>
              {f.label}
            </div>
            <div
              style={{
                height: 62,
                borderRadius: 16,
                border: `2px solid ${focus ? COLORS.red : "#E4E5E8"}`,
                background: focus ? "#FFF6F6" : PANEL,
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: FONTS.ui,
                fontWeight: 600,
                fontSize: 22,
                color: INK,
              }}
            >
              <span>
                {shown}
                {focus ? <span style={{ color: COLORS.red }}>|</span> : null}
              </span>
              {typed >= 1 ? <Icon name="check" size={24} color={COLORS.success} strokeWidth={3} /> : null}
            </div>
          </div>
        );
      })}
      {/* Confirmation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(255,255,255,${0.96 * success})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          opacity: success,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: "50%",
            background: COLORS.success,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${mix(0.6, 1, success)})`,
            boxShadow: "0 20px 40px rgba(43,212,125,0.35)",
          }}
        >
          <Icon name="check" size={76} strokeWidth={2.6} progress={prog(t, T.formDone + 0.1, 0.5, EASE.inOut)} />
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 36, color: INK, letterSpacing: "-0.02em" }}>
          Compte ouvert !
        </div>
        <div style={{ fontFamily: FONTS.ui, fontWeight: 500, fontSize: 21, color: GREY }}>Bienvenue chez UBA Tchad</div>
      </div>
    </div>
  );
};

const ACTIONS: { label: string; icon: IconName }[] = [
  { label: "Envoyer", icon: "send" },
  { label: "Payer", icon: "card" },
  { label: "Recharger", icon: "bolt" },
  { label: "Léo", icon: "chat" },
];

const ScreenDashboard: React.FC<{ t: number }> = ({ t }) => {
  const count = prog(t, CUE.consultez + 0.1, 1.5, EASE.out);
  const live = (t * 1.4) % 1;
  const spark = prog(t, CUE.soldes, 1.2, EASE.inOut);
  return (
    <div style={{ position: "absolute", inset: 0, background: PANEL, padding: "84px 26px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FONTS.ui, fontWeight: 500, fontSize: 18, color: GREY }}>Bonjour,</div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 28, color: INK }}>Amina</div>
        </div>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: INK,
            color: "white",
            fontFamily: FONTS.ui,
            fontWeight: 700,
            fontSize: 19,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          AM
        </div>
      </div>
      {/* Carte de solde */}
      <div
        style={{
          marginTop: 22,
          borderRadius: 28,
          padding: "26px 26px 24px",
          background: `linear-gradient(140deg, ${COLORS.redGlow} 0%, ${COLORS.red} 45%, ${COLORS.redDeep} 100%)`,
          color: "white",
          boxShadow: "0 22px 40px rgba(227,23,32,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: 18, opacity: 0.85 }}>
            Compte courant · Solde disponible
          </div>
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 40,
            marginTop: 12,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {fcfa(1_250_000 * count, false)}
          <span style={{ fontSize: 22, fontWeight: 700, marginLeft: 8, opacity: 0.85 }}>FCFA</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            fontFamily: FONTS.ui,
            fontWeight: 600,
            fontSize: 17,
          }}
        >
          <span style={{ position: "relative", width: 12, height: 12 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#7CFFB8" }} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid #7CFFB8",
                transform: `scale(${1 + live * 1.8})`,
                opacity: 1 - live,
              }}
            />
          </span>
          Mis à jour en temps réel
        </div>
      </div>
      {/* Actions rapides */}
      <div style={{ display: "flex", justifyContent: "space-between", margin: "26px 6px" }}>
        {ACTIONS.map((a, i) => (
          <div
            key={a.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              ...rise(prog(t, T.dashIn + 0.35 + i * 0.08, 0.6), 0, 16, 0),
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 22,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
              }}
            >
              <Icon name={a.icon} size={32} color={COLORS.red} strokeWidth={2} />
            </div>
            <div style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: 16, color: INK }}>{a.label}</div>
          </div>
        ))}
      </div>
      {/* Activité */}
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: "20px 22px",
          boxShadow: "0 8px 18px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontFamily: FONTS.ui, fontWeight: 700, fontSize: 19, color: INK }}>Activité</div>
        <svg width={330} height={80} viewBox="0 0 330 80" style={{ marginTop: 8 }}>
          <path
            d="M0 62 C 30 58, 45 40, 75 44 S 120 66, 150 48 S 200 20, 230 30 S 290 12, 330 8"
            fill="none"
            stroke={COLORS.red}
            strokeWidth={3.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${spark} 1`}
          />
        </svg>
        {[
          { l: "Transfert reçu", v: "+75 000 FCFA", c: "#16A35A" },
          { l: "Paiement marchand", v: "−18 500 FCFA", c: INK },
        ].map((r) => (
          <div
            key={r.l}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: 18,
              marginTop: 12,
            }}
          >
            <span style={{ color: GREY }}>{r.l}</span>
            <span style={{ color: r.c }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Bubble: React.FC<{ t: number; at: number; from: "leo" | "me"; children: React.ReactNode }> = ({
  t,
  at,
  from,
  children,
}) => {
  const p = prog(t, at - 0.08, 0.55, EASE.out);
  const mine = from === "me";
  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: 300,
        padding: "16px 20px",
        borderRadius: 24,
        borderBottomRightRadius: mine ? 8 : 24,
        borderBottomLeftRadius: mine ? 24 : 8,
        background: mine ? `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})` : "white",
        color: mine ? "white" : INK,
        fontFamily: FONTS.ui,
        fontWeight: 500,
        fontSize: 20,
        lineHeight: 1.35,
        boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
        opacity: p,
        transform: `translateY(${mix(26, 0, p)}px) scale(${mix(0.92, 1, p)})`,
        transformOrigin: mine ? "100% 100%" : "0% 100%",
        display: p > 0 ? "block" : "none",
      }}
    >
      {children}
    </div>
  );
};

const ScreenLeo: React.FC<{ t: number }> = ({ t }) => {
  const typing = t > CUE.paiements - 0.1 && t < CUE.transferts - 0.1;
  return (
    <div style={{ position: "absolute", inset: 0, background: PANEL, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "white",
          padding: "78px 24px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontFamily: FONTS.ui, fontSize: 30, color: INK }}>‹</div>
        <LeoAvatar size={60} t={t} />
        <div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 26, color: INK }}>Léo</div>
          <div style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: 16, color: "#16A35A" }}>
            Banquier virtuel · en ligne
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          justifyContent: "flex-end",
        }}
      >
        <Bubble t={t} at={CUE.banquier} from="leo">
          Bonjour Amina ! Je suis Léo. Que puis-je faire pour vous ?
        </Bubble>
        <Bubble t={t} at={CUE.simplifier} from="me">
          Envoie 50 000 FCFA à Moussa
        </Bubble>
        {typing ? (
          <div
            style={{
              alignSelf: "flex-start",
              background: "white",
              borderRadius: 22,
              padding: "16px 20px",
              display: "flex",
              gap: 7,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: GREY,
                  opacity: 0.35 + 0.65 * Math.max(0, Math.sin((t * 7 - i * 0.9) % (Math.PI * 2))),
                }}
              />
            ))}
          </div>
        ) : null}
        <Bubble t={t} at={CUE.transferts - 0.05} from="leo">
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, color: "#16A35A" }}>
            <Icon
              name="check"
              size={24}
              color="#16A35A"
              strokeWidth={3}
              progress={prog(t, CUE.transferts, 0.5, EASE.inOut)}
            />
            Transfert effectué
          </div>
          <div style={{ marginTop: 6, fontSize: 18, color: GREY }}>50 000 FCFA envoyés à Moussa · instantané</div>
        </Bubble>
      </div>
      <div style={{ background: "white", padding: "16px 20px 36px", display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            height: 54,
            borderRadius: 27,
            background: PANEL,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            fontFamily: FONTS.ui,
            fontSize: 18,
            color: GREY,
          }}
        >
          Écrire à Léo…
        </div>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: COLORS.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="send" size={26} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

/** Pile d'écrans avec transition « push » horizontale façon iOS. */
const ScreenStack: React.FC<{ t: number; screens: { at: number; node: React.ReactNode }[] }> = ({ t, screens }) => (
  <>
    {screens.map((s, i) => {
      const pIn = i === 0 ? 1 : prog(t, s.at, 0.6, EASE.inOut);
      const next = screens[i + 1];
      const pNext = next ? prog(t, next.at, 0.6, EASE.inOut) : 0;
      if (pIn <= 0 || pNext >= 1) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateX(${(1 - pIn) * SCREEN.width - pNext * SCREEN.width * 0.3}px)`,
            filter: pNext > 0 ? `brightness(${1 - pNext * 0.25})` : undefined,
            boxShadow: i > 0 ? "-20px 0 40px rgba(0,0,0,0.15)" : undefined,
          }}
        >
          {s.node}
        </div>
      );
    })}
  </>
);

// ————————————————————————————————————— Scène

export const S3Digital: React.FC = () => {
  const t = useTime();

  // Anneau d'attente qui se résout instantanément
  const ringIn = prog(t, CUE.plus - 0.2, 0.6, EASE.out);
  const ringDone = prog(t, end("d'attendre") - 0.2, 0.45, EASE.inOut);
  const ringOut = prog(t, T.phoneIn - 0.1, 0.5, EASE.in);

  // Téléphone : arrivée en vue isométrique, redressement, retour à l'iso en sortie
  const enter = prog(t, T.phoneIn, 1.5, EASE.out);
  const leave = prog(t, T.exit, 0.9, EASE.inOut);
  const drift = prog(t, T.phoneIn + 1.5, T.exit - T.phoneIn - 1.5, EASE.inOut);
  const rx = mix(mix(56, 9, enter), 58, leave) + float(t, 1.2, 6);
  const ry = mix(mix(0, -17, enter) + drift * 7, 0, leave) + float(t, 1.5, 7, 1);
  const rz = mix(mix(-38, -4, enter), -42, leave);
  const ty = mix(760, 0, enter) + leave * 60;
  const scale = mix(1, 0.62, leave);
  const phoneOpacity = enter * (1 - prog(t, T.exit + 0.45, 0.45, EASE.in));

  const minutesChip = prog(t, CUE.minutes - 0.1, 0.7);
  const liveChip = prog(t, CUE.tempsReel - 0.1, 0.7);
  const badge = prog(t, CUE.h24 - 0.1, 0.8);
  const chipsOut = prog(t, T.exit - 0.1, 0.4, EASE.in);

  return (
    <AbsoluteFill>
      {/* ——— Titrage gauche ——— */}
      <div style={{ position: "absolute", left: 140, top: 390, width: 820 }}>
        <KineticLine t={t} words={say("Plus besoin")} size={104} weight={800} exitAt={T.phoneIn - 0.15} />
        <KineticLine
          t={t}
          words={say("d'attendre.")}
          size={104}
          weight={800}
          color={COLORS.red}
          exitAt={T.phoneIn - 0.15}
        />
      </div>
      <div style={{ position: "absolute", left: 140, top: 360, width: 820 }}>
        <KineticLine t={t} words={say("Prenez le contrôle")} size={88} weight={800} exitAt={T.formIn - 0.05} />
        <KineticLine
          t={t}
          words={say("de votre argent")}
          size={60}
          weight={600}
          color={COLORS.silver}
          exitAt={T.formIn - 0.05}
        />
        <div style={{ height: 18 }} />
        <KineticLine
          t={t}
          words={say("du bout des doigts.")}
          size={60}
          weight={700}
          color={COLORS.red}
          exitAt={T.formIn - 0.05}
        />
      </div>
      <div style={{ position: "absolute", left: 140, top: 380, width: 920 }}>
        <KineticLine t={t} words={say("Ouvrez votre compte")} size={80} weight={800} exitAt={T.dashIn - 0.1} />
        <KineticLine t={t} words={say("en ligne")} size={80} weight={800} color={COLORS.red} exitAt={T.dashIn - 0.1} />
        <div style={{ height: 14 }} />
        <KineticLine
          t={t}
          words={say("en quelques minutes")}
          size={56}
          weight={600}
          color={COLORS.silver}
          exitAt={T.dashIn - 0.1}
        />
      </div>
      <div style={{ position: "absolute", left: 140, top: 400, width: 920 }}>
        <KineticLine t={t} words={say("Consultez vos soldes")} size={80} weight={800} exitAt={T.chatIn - 0.05} />
        <KineticLine
          t={t}
          words={say("en temps réel")}
          size={80}
          weight={800}
          color={COLORS.red}
          exitAt={T.chatIn - 0.05}
        />
      </div>
      <div style={{ position: "absolute", left: 140, top: 330, width: 820 }}>
        <KineticLine t={t} words={say("Léo,")} size={140} weight={800} color={COLORS.red} exitAt={T.exit - 0.15} />
        <KineticLine t={t} words={say("votre banquier virtuel")} size={60} weight={700} exitAt={T.exit - 0.15} />
        <div style={{ height: 26 }} />
        <KineticLine
          t={t}
          words={[...say("paiements"), { text: "&", at: CUE.transferts - 0.15 }, ...say("transferts")].map((w) => ({
            ...w,
            text: w.text[0].toUpperCase() + w.text.slice(1),
          }))}
          size={46}
          weight={600}
          color={COLORS.silver}
          exitAt={T.exit - 0.15}
        />
      </div>

      {/* ——— Anneau « attente → instantané » ——— */}
      <svg
        width={260}
        height={260}
        viewBox="-130 -130 260 260"
        style={{
          position: "absolute",
          left: PHONE_POS.x - 130,
          top: PHONE_POS.y - 130,
          opacity: ringIn * (1 - ringOut),
          transform: `scale(${mix(0.8, 1, ringIn) + ringOut * 0.6})`,
        }}
      >
        <circle r={96} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
        <circle
          r={96}
          fill="none"
          stroke={ringDone > 0 ? COLORS.success : COLORS.red}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${mix(0.22, 1, ringDone)} 1`}
          transform={`rotate(${ringDone > 0 ? -90 : t * 420})`}
          style={{ filter: `drop-shadow(0 0 12px ${ringDone > 0 ? COLORS.success : COLORS.red})` }}
        />
        <g transform="translate(-40 -40) scale(3.33)">
          <path
            d="M5 12.6l4.4 4.4L19 7.4"
            fill="none"
            stroke="white"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={`${ringDone} 1`}
          />
        </g>
      </svg>

      {/* ——— Smartphone ——— */}
      <AbsoluteFill style={{ perspective: 2600, opacity: phoneOpacity }}>
        <div
          style={{
            position: "absolute",
            left: PHONE_POS.x - PHONE.width / 2,
            top: PHONE_POS.y - PHONE.height / 2,
            transformStyle: "preserve-3d",
            transform: `translateY(${ty}px) scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          }}
        >
          <Phone
            statusColor={t < T.formIn + 0.3 ? "#fff" : "#111"}
            glare={mix(0.15, 0.75, (ry + 20) / 20)}
            screen={
              <ScreenStack
                t={t}
                screens={[
                  { at: 0, node: <ScreenWelcome t={t} /> },
                  { at: T.formIn, node: <ScreenForm t={t} /> },
                  { at: T.dashIn, node: <ScreenDashboard t={t} /> },
                  { at: T.chatIn, node: <ScreenLeo t={t} /> },
                ]}
              />
            }
            floating={
              <>
                <div style={{ position: "absolute", right: -250, top: 330, transform: "translateZ(110px)" }}>
                  <div style={rise(minutesChip, prog(t, T.dashIn, 0.4, EASE.in), 30)}>
                    <Chip
                      icon="clock"
                      label="≈ 4 minutes"
                      tone="light"
                      size={30}
                      iconProgress={prog(t, CUE.minutes, 0.8)}
                    />
                  </div>
                </div>
                <div style={{ position: "absolute", right: -215, top: 470, transform: "translateZ(120px)" }}>
                  <div style={rise(liveChip, prog(t, T.chatIn, 0.4, EASE.in), 30)}>
                    <Chip icon="bolt" label="Temps réel" tone="red" size={30} />
                  </div>
                </div>
                <div style={{ position: "absolute", right: -300, top: 250, transform: "translateZ(140px)" }}>
                  <div style={rise(badge, chipsOut, 40)}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        padding: "22px 30px",
                        borderRadius: 30,
                        background: "rgba(255,255,255,0.97)",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
                      }}
                    >
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 22,
                          background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="clock" size={40} strokeWidth={2.2} progress={prog(t, CUE.h24, 0.9, EASE.inOut)} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: FONTS.display,
                            fontWeight: 800,
                            fontSize: 46,
                            color: INK,
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                          }}
                        >
                          24h/24
                        </div>
                        <div style={{ fontFamily: FONTS.ui, fontWeight: 600, fontSize: 20, color: GREY, marginTop: 6 }}>
                          7j/7, où que vous soyez
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            }
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
