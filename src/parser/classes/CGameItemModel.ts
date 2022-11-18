import GameBoxParser from "../parser";
import { Node } from "../types";

export enum EItemType {
  Undefined,
  Ornament,
  PickUp,
  Character,
  Vehicle,
  Spot,
  Cannon,
  Group,
  Decal,
  Turret,
  Wagon,
  Block,
  EntitySpawner,
  DeprecV,
  Procedural
};

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x2E002000) {
    const itemType = p.int32();
    return {itemType};
  } else if (chunkId === 0x2E002008) {
    const nadeoSkinFids = p.list(() => p.nodeRef());
    return {nadeoSkinFids};
  } else if (chunkId === 0x2E002009) {
    const version = p.int32();
    const cameras = p.list(() => p.nodeRef());
    return {cameras};
  } else if (chunkId === 0x2E00200c) {
    const raceInterfaceFid = p.nodeRef();
    return {raceInterfaceFid};
  } else if (chunkId === 0x2E002012) {
    const groundPoint = p.vec3();
    const painterGroundMargin = p.float();
    const orbitalCenterHeightFromGround = p.float();
    const orbitalRadiusBase = p.float();
    const orbitalPreviewAngle = p.float();
    return {groundPoint, painterGroundMargin, orbitalCenterHeightFromGround, orbitalRadiusBase, orbitalPreviewAngle};
  } else if (chunkId === 0x2E002015) {
    const itemTypeE = p.int32();
    return {itemTypeE};
  } else if (chunkId === 0x2E002019) {
    const version = p.int32();
    const result: any = {};

    if ((node.itemTypeE === EItemType.Ornament && version < 9) || (node.itemTypeE === EItemType.Vehicle && version < 10)) {
      result.phyModelCustom = p.nodeRef();
      result.visModelCustom = p.nodeRef();
    }

    if (version >= 3) {
      result.defaultWeaponName = p.lookBackString();

      if (version >= 4) {
        const phyModelCustom = p.nodeRef();
        if (!result.phyModelCustom) result.phyModelCustom = phyModelCustom;

        if (version >= 5) {
          const visModelCustom = p.nodeRef();
          if (!result.visModelCustom) result.visModelCustom = visModelCustom;

          if (version >= 6) {
            p.skip(4);

            if (version >= 7) {
              result.defaultCam = p.int32();

              if (version >= 8) {
                result.entityModelEdition = p.nodeRef();
                result.entityModel = p.nodeRef();

                if (version >= 13) {
                  p.nodeRef();

                  if (version >= 15) {
                    p.nodeRef();
                  }
                }
              }
            }
          }
        }
      }
    }

    return result;
  } else if (chunkId === 0x2E00201c) {
    const version = p.int32();

    if (version >= 5) {
      const defaultPlacement = p.nodeRef();
      return {defaultPlacement}
    }

    const length = p.int32();

    if (version >= 1) {
      p.skip(24);

      if (version >= 2) {
        p.skip(20);

        if (version >= 3) {
          p.skip(8);

          p.list(() => p.vec3(), length);

          if (version >= 4) {
            p.skip(4);
          }
        }
      }
    }

    return true;
  } else if (chunkId === 0x2E00201E) {
    const version = p.int32();

    const archeTypeRef = p.string();

    if (archeTypeRef.length === 0) {
      p.skip(4);
    }

    if (version >= 6) {
      p.skip(4);

      if (version >= 7) {
        p.skip(4);
      }
    }

    return {archeTypeRef};
  } else if (chunkId === 0x2E00201F) {
    const version = p.int32();

    if (version < 7) {
      if (version >= 5) {
        p.string();
        p.string();
        p.skip(4);
      }

      if (version >= 4) {
        p.skip(4);
      }

      if (version < 3) {
        p.skip(2);
      }
    }

    const waypointType = p.int32();

    if (version < 8) {
      p.iso4();
    }

    let disableLightmap;

    if (version >= 6) {
      disableLightmap = p.bool();

      if (version >= 10) {
        p.skip(4);

        if (version >= 11) {
          p.skip(1);

          if (version >= 12) p.skip(8);
        }
      }
    }

    return {waypointType, disableLightmap};
  } else if (chunkId === 0x2E002020) {
    const version = p.int32();

    if (version < 2) {
      p.string();
      p.nodeRef();
      return true;
    }

    const iconFid = p.string();

    if (version >= 3) {
      p.skip(1);
    }

    return {iconFid};
  }
}