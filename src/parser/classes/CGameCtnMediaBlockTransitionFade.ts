import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030ab000) {
    const keys = p.list(() => {
      const time = p.float();
      const opacity = p.float();
      return {time, opacity};
    });

    const color = p.color();

    p.skip(4);

    return { keys, color };
  }
}