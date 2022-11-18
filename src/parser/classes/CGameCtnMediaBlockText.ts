import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030a8001) {
    const text = p.string();
    const effect = p.nodeRef();
    return { text, effect };
  } else if (chunkId === 0x030a8002) {
    const textColor = p.color();
    return { textColor };
  }
}