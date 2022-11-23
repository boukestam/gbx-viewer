import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030A4000) {
    const keys = p.list(() => {
      const time = p.float();
      const intensity = p.float();
      const speed = p.float();
      return {time, intensity, speed};
    });
    return {keys};
  }
}