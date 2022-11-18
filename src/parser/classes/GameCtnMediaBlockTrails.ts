import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030A9000) {
    const start = p.float();
    const end = p.float();
    return {start, end};
  }
}