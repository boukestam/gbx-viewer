import React, { createRef, useEffect } from "react";
import { CGameCtnChallenge } from "./parser/nodes";
import { GhostSamples } from "./App";
import { render } from "./render/render";

export function Renderer({
  map,
  ghost,
}: {
  map: CGameCtnChallenge;
  ghost: GhostSamples;
}) {
  const canvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!canvasRef.current) return;

    return render(canvasRef.current, map, ghost);
  }, [canvasRef, ghost, map]);

  return <canvas ref={canvasRef} style={{ userSelect: "none" }}></canvas>;
}
