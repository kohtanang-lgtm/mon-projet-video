import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { loadFonts } from "./fonts";
import { useTime } from "./lib/motion";
import { S1Ambition } from "./scenes/S1Ambition";
import { S2Particuliers } from "./scenes/S2Particuliers";
import { S3Digital } from "./scenes/S3Digital";
import { S4Corporate } from "./scenes/S4Corporate";
import { S5Signature } from "./scenes/S5Signature";
import { SCENES, SceneWindow, TOTAL_DURATION, VO_OFFSET } from "./timeline/cues";

loadFonts();

const SOUND_DESIGN_GAIN = 0.55;

export type UbaSpotProps = {
  /** Cadence de rendu (le montage est indépendant du fps). */
  fps: number;
  /** Habillage sonore discret sous la voix-off (public/audio/sound-design.mp3). */
  soundDesign: boolean;
};

/** Monte une scène uniquement pendant sa fenêtre : rendu plus rapide, aucune fuite visuelle. */
const Scene: React.FC<{ window: SceneWindow; children: React.ReactNode }> = ({ window, children }) => {
  const t = useTime();
  if (t < window.from || t > window.to) return null;
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const UbaSpot: React.FC<UbaSpotProps> = ({ soundDesign }) => {
  const { fps } = useVideoConfig();
  const t = useTime();
  // Ouverture au noir puis fondu au noir final
  const fade = interpolate(t, [0, 0.35, TOTAL_DURATION - 0.7, TOTAL_DURATION], [1, 0, 0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Background />
      <Scene window={SCENES.ambition}>
        <S1Ambition />
      </Scene>
      <Scene window={SCENES.particuliers}>
        <S2Particuliers />
      </Scene>
      <Scene window={SCENES.digital}>
        <S3Digital />
      </Scene>
      <Scene window={SCENES.corporate}>
        <S4Corporate />
      </Scene>
      <Scene window={SCENES.signature}>
        <S5Signature />
      </Scene>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade, pointerEvents: "none" }} />

      <Sequence from={Math.round(VO_OFFSET * fps)} name="Voix-off">
        <Audio src={staticFile("audio/voix-off-uba-tchad.mp3")} volume={0.92} />
      </Sequence>
      {soundDesign ? (
        <Audio
          name="Habillage sonore"
          src={staticFile("audio/sound-design.mp3")}
          // ~12 dB sous la voix-off en moyenne : la VO reste parfaitement intelligible
          volume={(f) =>
            interpolate(
              f / fps,
              [0, 0.4, TOTAL_DURATION - 1.2, TOTAL_DURATION],
              [0, SOUND_DESIGN_GAIN, SOUND_DESIGN_GAIN, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
