import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x2E025000) {
    const version = p.int32();

    const archeTypeBlockInfoId = p.lookBackString();
    const archeTypeBlockInfoCollectionId = p.lookBackString();

    const customizedVariants = p.dict(() => {
      const key = p.int32();
      const value = p.nodeRef();
      return {key, value};
    });

    return {archeTypeBlockInfoId, archeTypeBlockInfoCollectionId, customizedVariants};
  }
}