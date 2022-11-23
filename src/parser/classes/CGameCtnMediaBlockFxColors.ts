import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03080000) {
    const keys = p.list(() => {
      const result: any = {};

      result.time = p.float();

      result.intensity = p.float();
      result.blendZ = p.float();
      result.distance = p.float();
      result.farDistance = p.float();
      result.inverse = p.float();
      result.hue = p.float();
      result.saturation = p.float();
      result.brightness = p.float();
      result.contrast = p.float();
      result.rgb = p.color();

      p.skip(16);

      result.farInverse = p.float();
      result.farHue = p.float();
      result.farSaturation = p.float();
      result.farBrightness = p.float();
      result.farContrast = p.float();
      result.farRgb = p.color();

      p.skip(16);

      return result;
    });
    return {keys};
  } else if (chunkId === 0x03080001) {
    return parseChunk(p, 0x03080000, node);
  } else if (chunkId === 0x03080002) {
    return parseChunk(p, 0x03080000, node);
  } else if (chunkId === 0x03080003) {
    return parseChunk(p, 0x03080000, node);
  }
}