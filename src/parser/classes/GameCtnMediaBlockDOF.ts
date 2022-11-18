import GameBoxParser from "../parser";
import { Node } from "../types";

function parseCGameCtnMediaBlockDOFKey(p: GameBoxParser, version: number) {
  const time = p.float();

  const zFocus = p.float();
  const lensSize = p.float();

  let target, targetPosition;

  if (version >= 1) {
    target = p.int32();

    if (version >= 2) {
      targetPosition = p.vec3();
    }
  }

  return {time, zFocus, lensSize, target, targetPosition};
}

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03126000) {
    return p.list(() => parseCGameCtnMediaBlockDOFKey(p, 0));
  } else if (chunkId === 0x03126001) {
    return p.list(() => parseCGameCtnMediaBlockDOFKey(p, 1));
  } else if (chunkId === 0x03126002) {
    return p.list(() => parseCGameCtnMediaBlockDOFKey(p, 2));
  }
}