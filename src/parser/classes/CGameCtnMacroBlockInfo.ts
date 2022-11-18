import GameBoxParser from "../parser";
import { Node } from "../types";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x0310d000) {
    const blockSpawns = p.list(() => {
      const version = p.uint32();
      const blockModel = p.meta();

      let coord, direction, absolutePositionInMap, pitchYawRoll, waypoint;

      if (version < 2) {
        coord = p.int3();
        direction = p.uint32();

        throw new Error(
          "CGameCtnMacroBlockInfo version not supported " + version
        );
      }

      if (version >= 2) {
        if (version < 5) {
          coord = p.byte3();
          direction = p.byte();
        }

        const flags = p.uint32();

        if (version >= 3) {
          if (version >= 5) {
            if (((flags >> 26) & 1) !== 0) {
              absolutePositionInMap = p.vec3();
              pitchYawRoll = p.vec3();
            } else {
              coord = p.byte3();
              direction = p.byte();
            }
          }

          waypoint = p.nodeRef();

          if (version >= 4) {
            if (version >= 6 && version < 8) {
              throw new Error(
                "CGameCtnMacroBlockInfo version not supported " + version
              );
            }

            if (version < 6) {
              const unsupported = p.nodeRef();

              if (unsupported) {
                throw new Error("Not implemented");
              }
            }

            if (version >= 8) {
              p.skip(2);
            }
          }
        }
      }

      return {
        version,
        blockModel,
        coord,
        direction,
        absolutePositionInMap,
        pitchYawRoll,
        waypoint,
      };
    });

    return { blockSpawns };
  } else if (chunkId === 0x0310d001) {
    const blockSkinSpawns = p.list(() => {
      const version = p.uint32();
      const skin = p.nodeRef();

      if (version === 0) {
        p.int3();
      }

      const blockSpawnIndex = p.uint32();

      return { version, skin, blockSpawnIndex };
    });

    return { blockSkinSpawns };
  } else if (chunkId === 0x0310d002) {
    const cardEventsSpawns = p.list(() => {
      const version = p.uint32();
      p.list(() => p.meta());
      p.int3();

      return { version };
    });

    return { cardEventsSpawns };
  } else if (chunkId === 0x0310d006) {
    p.uint32();
    const size = p.uint32();
    p.skip(size);
  } else if (chunkId === 0x0310d007) {
    p.list(() => p.nodeRef());
  } else if (chunkId === 0x0310d008) {
    const listVersion = p.uint32();
    const autoTerrains = p.list(() => p.nodeRef());
    p.uint32();
    p.bool();
    return { listVersion, autoTerrains };
  } else if (chunkId === 0x0310d00e) {
    const version = p.uint32();
    const objectSpawns = p.list(() => {
      const ver = p.uint32();
      const itemModel = p.meta();

      let quarterY, additionalDir, pitchYawRoll;
      let pivotPosition, waypointSpecialProperty;
      let scale;

      if (ver < 3) {
        quarterY = p.byte();

        if (ver >= 1) {
          additionalDir = p.byte();
        }
      } else {
        pitchYawRoll = p.vec3();
      }

      const blockCoord = p.int3();
      const anchorTreeId = p.lookBackString();
      const absolutePositionInMap = p.vec3();

      if (ver < 5) {
        p.uint32();
      }

      if (ver < 6) {
        p.uint32();
      }

      let packDesc, foregroundPackDesc;

      if (ver >= 6) {
        p.uint16();

        if (ver >= 7) {
          pivotPosition = p.vec3();

          if (ver >= 8) {
            waypointSpecialProperty = p.nodeRef();

            if (ver >= 9) {
              scale = p.float();

              if (ver >= 10) {
                p.int3();

                if (ver >= 11 && ver < 14) {
                  throw new Error("Version not supported: " + ver);
                }

                if (ver >= 14) {
                  p.uint32();
                  const ignored = p.byte();

                  if (ignored === 1) {
                    packDesc = p.fileRef();
                    foregroundPackDesc = p.fileRef();
                  }

                  const ignored2 = p.uint32();

                  if (ignored2 !== -1) {
                    throw new Error("U08 !== -1");
                  }
                }
              }
            }
          }
        }
      }

      return {
        ver,
        itemModel,
        quarterY,
        additionalDir,
        pitchYawRoll,
        blockCoord,
        anchorTreeId,
        absolutePositionInMap,
        pivotPosition,
        waypointSpecialProperty,
        scale,
        packDesc,
        foregroundPackDesc,
      };
    });

    if (version < 3) {
      if (version >= 1) {
        p.list(() => p.int2());
      }
    }

    if (version >= 3) {
      p.list(() => p.int4());
    }

    return { version, objectSpawns };
  } else if (chunkId === 0x0310d00f) {
    const version = p.uint32();
    p.int3();

    p.int3();
    p.list(() => p.int3());

    return { version };
  }
}