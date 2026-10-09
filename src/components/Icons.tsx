import React from "react";
import { COLORS } from "../theme";

type Shape = { d: string } | { circle: [number, number, number] } | { rect: [number, number, number, number, number] };

/** Pictogrammes vectoriels au trait (grille 24 × 24), dessinés à la volée. */
const ICONS = {
  user: [{ circle: [12, 8, 4] }, { d: "M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" }],
  family: [
    { circle: [7, 6.5, 2.6] },
    { circle: [17, 6.5, 2.6] },
    { circle: [12, 12.2, 2] },
    { d: "M1.8 19.5c0-3.4 2.3-6.2 5.2-6.2 1.2 0 2.2.4 3 1.1" },
    { d: "M22.2 19.5c0-3.4-2.3-6.2-5.2-6.2-1.2 0-2.2.4-3 1.1" },
    { d: "M8.6 21c0-2 1.5-3.6 3.4-3.6s3.4 1.6 3.4 3.6" },
  ],
  builder: [
    { d: "M2.5 18.5h19" },
    { d: "M4.8 18.5v-2.2a7.2 7.2 0 0 1 14.4 0v2.2" },
    { d: "M9.8 9.4V6.2h4.4v3.2" },
    { d: "M12 9.4v4" },
  ],
  pin: [{ d: "M12 21.5s-7-6.1-7-11.6a7 7 0 0 1 14 0c0 5.5-7 11.6-7 11.6z" }, { circle: [12, 9.8, 2.6] }],
  shield: [
    { d: "M12 2.8l7.4 3v5.4c0 5-3.5 8.6-7.4 10-3.9-1.4-7.4-5-7.4-10V5.8l7.4-3z" },
    { d: "M8.6 12.2l2.3 2.3 4.5-4.6" },
  ],
  clock: [{ circle: [12, 12, 9] }, { d: "M12 7v5.2l3.4 2.1" }],
  chat: [{ d: "M4 4.5h16a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H9.5L4 20.5V5.5a1 1 0 0 1 1-1" }],
  send: [{ d: "M21 3L3 10.5l7.2 2.6L13 21z" }, { d: "M21 3l-10.8 10.1" }],
  building: [
    { d: "M4 21V7.5L12 3l8 4.5V21" },
    { d: "M2.5 21h19" },
    { d: "M9.5 21v-4.5h5V21" },
    { d: "M8.5 9.5h1.5M14 9.5h1.5M8.5 13h1.5M14 13h1.5" },
  ],
  growth: [{ d: "M3 18l6-6 4 4 8-8.5" }, { d: "M15 7.5h6v6" }],
  briefcase: [
    { rect: [3, 7.5, 18, 13, 2] },
    { d: "M8.5 7.5V5.2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2.3" },
    { d: "M3 13h18" },
  ],
  check: [{ d: "M5 12.6l4.4 4.4L19 7.4" }],
  bolt: [{ d: "M13.5 2.5L4.5 13.5h6.5l-1 8 9-11h-6.5z" }],
  globe: [
    { circle: [12, 12, 9] },
    { d: "M3 12h18" },
    { d: "M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" },
  ],
  card: [{ rect: [2.5, 5.5, 19, 13, 2.2] }, { d: "M2.5 10h19" }, { d: "M6 15h4" }],
  tower: [{ d: "M6 21V4.5h8V21" }, { d: "M14 9.5h4V21" }, { d: "M3 21h18" }, { d: "M9 8h2M9 11.5h2M9 15h2" }],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Progression du tracé : 0 = invisible, 1 = dessiné. */
  progress?: number;
  style?: React.CSSProperties;
}> = ({ name, size = 48, color = COLORS.white, strokeWidth = 1.6, progress = 1, style }) => {
  const shapes: Shape[] = ICONS[name];
  const common = {
    pathLength: 1,
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeDasharray: "1 1",
    strokeDashoffset: 1 - Math.min(1, Math.max(0, progress)),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible", ...style }}>
      {shapes.map((s, i) => {
        if ("d" in s) return <path key={i} d={s.d} {...common} />;
        if ("circle" in s) return <circle key={i} cx={s.circle[0]} cy={s.circle[1]} r={s.circle[2]} {...common} />;
        const [x, y, w, h, r] = s.rect;
        return <rect key={i} x={x} y={y} width={w} height={h} rx={r} {...common} />;
      })}
    </svg>
  );
};
