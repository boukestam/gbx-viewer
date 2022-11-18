import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x03101002) {
    const version = p.int32();
    const itemModel = p.meta();
    const pitchYawRoll = p.vec3();
    const blockUnitCoord = p.byte3();
    const anchorTreeId = p.lookBackString();
    const absolutePositionInMap = p.vec3();

    const waypointSpecialProperty = p.parseNode();

    if (version < 5) p.skip(4);

    let flags, pivotPosition, scale, packDesc;

    if (version >= 4) {
      flags = p.int16();

      if (version >= 5) {
        pivotPosition = p.vec3();

        if (version >= 6) {
          scale = p.float();

          if (version >= 7) {
            if ((flags & 4) === 4) {
              packDesc = p.fileRef();
            }

            if (version >= 8) {
              p.skip(24);
            }

            if (version >= 9) throw new Error("Version not supported");
          }
        }
      }
    }

    return {
      version, 
      itemModel, 
      pitchYawRoll, 
      blockUnitCoord, 
      anchorTreeId, 
      absolutePositionInMap, 
      waypointSpecialProperty, 
      flags, 
      pivotPosition, 
      scale, 
      packDesc
    };
  }
}