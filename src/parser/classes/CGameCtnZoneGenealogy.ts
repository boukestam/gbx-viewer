import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0311d002) {
    const zoneIds = p.list(() => p.lookBackString());
    const currentIndex = p.uint32();
    const dir = p.uint32();
    const currentZoneId = p.lookBackString();
    return { zoneIds, currentIndex, dir, currentZoneId };
  }
}