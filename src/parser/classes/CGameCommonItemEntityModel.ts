import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x2E027000) {
    const version = p.int32();

    const phyModel = p.nodeRef();
    const visModel = p.nodeRef();

    return {phyModel, visModel};
  }
}