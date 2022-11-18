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
  if (chunkId === 0x2E002008) {
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
  }
}