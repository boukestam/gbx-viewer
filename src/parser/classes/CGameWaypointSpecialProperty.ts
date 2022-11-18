import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0313b000 || chunkId === 0x2e009000) {
    const version = p.uint32();

    if (version === 1) {
      const spawn = p.uint32();
      const order = p.uint32();

      return { version, spawn, order };
    } else if (version === 2) {
      const tag = p.string();
      const order = p.uint32();

      return { tag, order };
    } else {
      throw new Error(
        "Invalid CGameWaypointSpecialProperty version: " + version
      );
    }
  }
}