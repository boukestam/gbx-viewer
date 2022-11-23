import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03195000) {
    const version = p.int32();

    const start = p.float();
    const end = p.float();
    const showInterface = p.bool();
    const maniaLink = p.string();

    return {start, end, showInterface, maniaLink};
  }
}