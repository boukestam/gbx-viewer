import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x07010003) {
    const frames = p.list(() => {
      const timestamp = p.float();
      const position = p.vec2();
      const rotation = p.float();
      const scaleX = p.float();
      const scaleY = p.float();
      const opacity = p.float();
      const depth = p.float();
      return {
        timestamp,
        position,
        rotation,
        scaleX,
        scaleY,
        opacity,
        depth,
      };
    });

    const centered = p.bool();

    return { frames, centered };
  } else if (chunkId === 0x07010004) {
    const frames = p.list(() => {
      const timestamp = p.float();
      const position = p.vec2();
      const rotation = p.float();
      const scaleX = p.float();
      const scaleY = p.float();
      const opacity = p.float();
      const depth = p.float();

      p.skip(4);
      const isContinousEffect = p.float();
      p.skip(8);

      return {
        timestamp,
        position,
        rotation,
        scaleX,
        scaleY,
        opacity,
        depth,
        isContinousEffect,
      };
    });

    const centered = p.bool();
    const colorBlendMode = p.uint32();
    const isContinousEffect = p.bool();

    return { frames, centered, colorBlendMode, isContinousEffect };
  } else if (chunkId === 0x07010005) {
    const chunk = parseChunk(p, 0x07010004, node);
    const isInterpolated = p.bool();
    return { ...chunk, isInterpolated };
  }
}