import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030a1003) {
    const version = p.int32();
    const positions = p.list(() => {
      const time = p.float();

      const position = p.vec3();
      const pitchYawRoll = p.vec3();
      const fov = p.float();

      let nearZ = 0;

      if (version >= 3) {
        nearZ = p.float();
      }

      const anchorRot = p.bool();
      const anchor = p.int32();
      const anchorVis = p.bool();
      const target = p.int32();
      const targetPosition = p.vec3();

      const weight = p.float();
      p.quat();

      if (version >= 4) {
        p.skip(8);
      }

      return {time, position, pitchYawRoll, fov, nearZ, anchorRot, anchor, anchorVis, target, targetPosition, weight};
    });
    return {positions};
  }
}