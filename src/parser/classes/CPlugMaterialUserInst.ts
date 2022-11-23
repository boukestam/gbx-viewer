import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x090FD000) {
    const version = p.int32();

    const result: any = {};

    if (version >= 11) {
      result.isUsingGameMaterial = p.bool(true);
    }

    result.model = p.lookBackString();
    result.baseTexture = p.string();

    result.surfacePhysicId = p.byte();

    if (version >= 10) {
      result.surfaceGameplayId = p.byte();
    }

    if (version >= 1) {
      if ((version >= 9 && version < 11) || (result.isUsingGameMaterial)) {
        result.link = p.string();
      } else {
        result.link = p.lookBackString();
      }

      if (version >= 2) {
        p.list(() => {
          p.lookBackString();
          p.lookBackString();
          p.int32();
        });

        p.list(() => p.int32());

        if (version >= 3) {
          p.list(() => {
            p.lookBackString();
            p.lookBackString();
            p.float();
            p.skip(8);
          });

          if (version >= 4) {
            p.list(() => p.lookBackString());

            if (version >= 6) {
              result.userTextures = p.list(() => [p.int32(), p.string()]);

              if (version >= 7) {
                result.hidingGroup = p.lookBackString();
              }
            }
          }
        }
      }
    }

    return result;
  } else if (chunkId === 0x090FD001) {
    const version = p.int32();

    p.nodeRef();

    if (version === 2) throw new Error("Version not supported");

    const result: any = {};

    if (version >= 3) {
      result.tilingU = p.int32();
      result.tilingV = p.int32();
      result.textureSizeInMeters = p.float();

      if (version >= 4) {
        p.skip(4);

        if (version >= 5) {
          result.isNatural = p.bool();
        }
      }
    }

    return result;
  } else if (chunkId === 0x090FD002) {
    const version = p.uint32();
    p.uint32();
    return true;
  }
}