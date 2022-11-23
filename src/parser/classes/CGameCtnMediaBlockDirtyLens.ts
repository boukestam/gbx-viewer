import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03165000) {
    const version = p.int32();

    const keys = p.list(() => {
      const time = p.float();
      const intensity = p.float();
      return {time, intensity};
    });

    return {keys};
  }
}