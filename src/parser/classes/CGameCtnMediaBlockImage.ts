import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x030a5000) {
    const effect = p.nodeRef();
    const image = p.fileRef();
    return { effect, image };
  }
}