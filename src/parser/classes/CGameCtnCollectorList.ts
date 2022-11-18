import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0301b000) {
    // CGameCtnCollectorList
    const collectorList = p.list(() => {
      const [blockName, collection, author] = p.meta();
      const numPieces = p.uint32();

      return { blockName, collection, author, numPieces };
    });

    return { collectorList };
  }
}