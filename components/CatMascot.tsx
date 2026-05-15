"use client";

import { useState } from "react";

const SCALE = 3;
const FW = 32;
const FH = 32;

export default function CatMascot() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="fixed bottom-4 right-4 z-10 select-none cursor-pointer"
      aria-hidden
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: FW * SCALE,
          height: FH * SCALE,
          backgroundImage: hovered
            ? "url('/CatPackFree/CatPackFree/drculacat.png')"
            : "url('/CatPackFree/CatPackFree/Idle.png')",
          backgroundSize: `auto ${FH * SCALE}px`,
          backgroundPosition: "0 0",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
