import React from "react";
import { Composition } from "remotion";
import { UbaSpot, UbaSpotProps } from "./UbaSpot";
import { TOTAL_DURATION } from "./timeline/cues";
import { VIDEO } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="UbaTchadSpot"
    component={UbaSpot}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.defaultFps}
    durationInFrames={Math.round(TOTAL_DURATION * VIDEO.defaultFps)}
    defaultProps={{ fps: VIDEO.defaultFps, soundDesign: true } satisfies UbaSpotProps}
    // Toute l'animation est écrite en secondes : on peut rendre en 25, 30, 50 ou 60 i/s
    // sans toucher au montage (ex. --props='{"fps":60}').
    calculateMetadata={({ props }) => ({
      fps: props.fps,
      durationInFrames: Math.round(TOTAL_DURATION * props.fps),
    })}
  />
);
