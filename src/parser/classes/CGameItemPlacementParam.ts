import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x2E020000) {
    const version = p.int32();
    const flags = p.int16();
    const cubeCenter = p.vec3();
    const cubeSize = p.float();
    const gridSnapHStep = p.float();
    const gridSnapVStep = p.float();
    const gridSnapHOffset = p.float();
    const gridSnapVOffset = p.float();
    const flyVStep = p.float();
    const flyVOffset = p.float();
    const pivotSnapDistance = p.float();

    return {flags, cubeCenter, cubeSize, gridSnapHStep, gridSnapVStep, gridSnapHOffset, gridSnapVOffset, flyVStep, flyVOffset, pivotSnapDistance};
  } else if (chunkId === 0x2E020001) {
    const pivotPositions = p.list(() => p.vec3());
    const pivotRotations = p.list(() => p.quat());
    return {pivotPositions, pivotRotations};
  }
}