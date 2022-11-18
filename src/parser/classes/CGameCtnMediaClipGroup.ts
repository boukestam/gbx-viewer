import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0307a003) {
    p.skip(4);

    const clips = p.list(() => {
      const clip = p.nodeRef();
      return clip;
    });

    const referenceClips = p.list(() => {
      const referenceFramePosition = p.vec3();
      const referenceFrameRotation = p.uint32();
      const triggerCondition = p.uint32(); // (0: None, 1: Time < arg, 2: Time > arg, 3: Already triggered, 4: Speed < arg, 5: Speed > arg, 6: Not already triggered)
      const triggerArgument = p.float();

      const numTriggers = p.uint32();
      const triggers: any[] = [];
      for (let j = 0; j < numTriggers; j++) {
        const position = p.vec3();
        triggers.push({ position });
      }

      return {
        referenceFramePosition,
        referenceFrameRotation,
        triggerCondition,
        triggerArgument,
        triggers,
      };
    });

    return { clips, referenceClips };
  }
}