import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03120001) {
    const offset = p.int3();
    const genealogy = p.nodeRef();
    return { offset, genealogy };
  }
}