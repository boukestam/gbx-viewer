import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03199000) {
    const version = p.int32();

    const keys = p.list(() => {
      const result: any = {};

      result.time = p.float();

      result.intensity = p.float();
      result.skyIntensity = p.float();
      result.distance = p.float();

      if (version >= 1) {
        result.coefficient = p.float();
        result.color = p.color();

        if (version >= 2) {
          result.cloudsOpacity = p.float();
          result.cloudsSpeed = p.float();
        }
      }

      return result;
    });

    return {keys};
  }
}