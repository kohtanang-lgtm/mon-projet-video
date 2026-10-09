import React from "react";

/**
 * Fausse 3D isométrique : projection orthographique (aucune perspective) obtenue
 * par rotateX puis rotateZ. `isoProject` applique exactement la même matrice que le
 * CSS : les éléments 2D (libellés, courbes SVG) s'accrochent au pixel près aux volumes.
 */
export const ISO = { rx: 58, rz: -42 } as const;

const rad = (deg: number) => (deg * Math.PI) / 180;

export const isoTransform = (rx: number = ISO.rx, rz: number = ISO.rz) => `rotateX(${rx}deg) rotateZ(${rz}deg)`;

export const isoProject = (x: number, y: number, z: number, rx: number = ISO.rx, rz: number = ISO.rz) => {
  const a = rad(rz);
  const b = rad(rx);
  const x1 = x * Math.cos(a) - y * Math.sin(a);
  const y1 = x * Math.sin(a) + y * Math.cos(a);
  return { x: x1, y: y1 * Math.cos(b) - z * Math.sin(b) };
};

/** Monde isométrique ancré en (cx, cy) à l'écran. */
export const IsoWorld: React.FC<{
  cx: number;
  cy: number;
  rx?: number;
  rz?: number;
  scale?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ cx, cy, rx = ISO.rx, rz = ISO.rz, scale = 1, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: cx,
      top: cy,
      width: 0,
      height: 0,
      transformStyle: "preserve-3d",
      transform: `scale(${scale}) ${isoTransform(rx, rz)}`,
      ...style,
    }}
  >
    {children}
  </div>
);

type Faces = { top: string; south: string; west: string; north?: string; east?: string };

/**
 * Volume (pavé) isométrique centré sur (x, y), posé au sol, hauteur h.
 * `top` reçoit le contenu de la face supérieure (icône, texture…).
 */
export const IsoBox: React.FC<{
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z?: number;
  faces: Faces;
  radius?: number;
  topStyle?: React.CSSProperties;
  children?: React.ReactNode;
  shadow?: number;
  /** Opacité appliquée face par face (une opacité sur le conteneur aplatirait la 3D). */
  opacity?: number;
}> = ({ x, y, w, d, h, z = 0, faces, radius = 0, topStyle, children, shadow = 0.55, opacity = 1 }) => {
  const face: React.CSSProperties = { position: "absolute", backfaceVisibility: "visible", opacity };
  const hh = Math.max(0.01, h);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - d / 2,
        width: w,
        height: d,
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
      }}
    >
      {/* Ombre portée au sol */}
      {shadow > 0 && opacity > 0 ? (
        <div
          style={{
            ...face,
            inset: -h * 0.18,
            borderRadius: radius + 20,
            background: `rgba(0,0,0,${shadow})`,
            filter: `blur(${18 + h * 0.12}px)`,
            transform: `translate3d(${h * 0.22}px, ${h * 0.26}px, ${-z + 0.5}px)`,
          }}
        />
      ) : null}
      {/* Faces latérales : montent depuis chaque arête du sol */}
      <div
        style={{
          ...face,
          left: 0,
          top: d,
          width: w,
          height: hh,
          background: faces.south,
          transformOrigin: "50% 0",
          transform: "rotateX(90deg)",
        }}
      />
      <div
        style={{
          ...face,
          left: 0,
          top: 0,
          width: w,
          height: hh,
          background: faces.north ?? faces.south,
          transformOrigin: "50% 0",
          transform: "rotateX(90deg)",
        }}
      />
      <div
        style={{
          ...face,
          left: 0,
          top: 0,
          width: hh,
          height: d,
          background: faces.west,
          transformOrigin: "0 50%",
          transform: "rotateY(-90deg)",
        }}
      />
      <div
        style={{
          ...face,
          left: w,
          top: 0,
          width: hh,
          height: d,
          background: faces.east ?? faces.west,
          transformOrigin: "0 50%",
          transform: "rotateY(-90deg)",
        }}
      />
      {/* Face supérieure */}
      <div
        style={{
          ...face,
          inset: 0,
          borderRadius: radius,
          background: faces.top,
          transform: `translateZ(${hh}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          ...topStyle,
          opacity: opacity * ((topStyle?.opacity as number | undefined) ?? 1),
        }}
      >
        {children}
      </div>
    </div>
  );
};
