import GameBoxParser from "../parser";
import { Node } from "../types";
import { EItemType } from "./CGameItemModel";

export function parseChunk(p: GameBoxParser, chunkId: number, node: Node): any {
  if (chunkId === 0x2E026000) {
    const version = p.int32();

    const itemType = p.int32();
    const meshCrystal = p.nodeRef();
    
    p.string();
    p.nodeRef();

    p.skip(8);

    p.nodeRef();
    p.nodeRef();

    p.skip(4);

    p.string();
    p.string();
    p.string();
    p.string();
    p.string();
    p.string();
    p.string();

    p.iso4();

    let mass;

    if (version >= 3 && itemType === EItemType.PickUp) {
      mass = p.float();
    }

    if (!p.bool()) {
      p.nodeRef();
    }

    if (itemType !== EItemType.Ornament) throw new Error("Item type not supported");

    if (p.bool()) {
      p.skip(4);
      p.iso4();
    }

    p.skip(4);

    let inventoryName, inventoryDescription, inventoryItemClass, inventoryOccupation;

    if (version >= 1) {
      inventoryName = p.string();
      inventoryDescription = p.string();
      inventoryItemClass = p.int32();
      inventoryOccupation = p.int32();

      if (version >= 6) {
        p.nodeRef();

        // if (version >= 7 && itemType === EItemType.PickUp) {
        //   p.skip(4);
        // }
      }
    }

    return {itemType, meshCrystal, mass, inventoryName, inventoryDescription, inventoryItemClass, inventoryOccupation};
  }
}