import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03084007) {
    const version = p.uint32();
    const start = p.float();
    const end = p.float();

    let gameCam;
    if (version < 2) {
      gameCam = p.lookBackString();
    }

    if (version >= 2) {
      gameCam = p.uint32();
    }

    const clipEntId = p.uint32();

    const camPosition = p.vec3();
    const camPitchYawRoll = p.vec3();

    const camFov = p.float() || 90;

    p.skip(8);

    const camNearClipPlane = p.float();
    const camFarClipPlane = p.float();

    p.skip(12);

    if (version >= 1) {
      p.skip(4);

      if (version >= 3) {
        p.skip(4);
      }
    }

    return {
      version,
      start,
      end,
      gameCam,
      clipEntId,
      camPosition,
      camPitchYawRoll,
      camFov,
      camNearClipPlane,
      camFarClipPlane,
    };
  }
}