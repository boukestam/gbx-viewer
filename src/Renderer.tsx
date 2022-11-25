import React, { createRef, useEffect } from "react";
import { CGameCtnChallenge } from "./parser/nodes";
import { GhostSamples } from "./App";
import { startRender } from "./render/render";

export function Renderer({
  map,
  ghost,
}: {
  map: CGameCtnChallenge;
  ghost?: GhostSamples;
}) {
  const containerRef = createRef<HTMLDivElement>();
  const canvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    return startRender(containerRef.current, canvasRef.current, map, ghost);
  }, [containerRef, canvasRef, ghost, map]);

  return (
    <>
      <canvas ref={canvasRef} style={{ userSelect: "none", width: '100vw', height: '100vh' }}></canvas>
      <div ref={containerRef} style={{ position: "fixed", left: '0px', top: '0px', width: '100vw', height: '100vh' }}></div>
    </>
  );
}
