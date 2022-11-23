import { Block, CGameCtnAnchoredObject, CGameCtnChallenge } from "../parser/nodes";
import { Vec3 } from "../parser/types";
import { createDeco } from "./deco";
import { createCrystal } from "./mesh";
import { createPlatform } from "./platform";
import { createRoad } from "./road";

export interface BlockMesh {
  mesh: THREE.Mesh;
  rotation?: Vec3;
  offset?: Vec3;
  pivot?: Vec3;
}

const cache: {[name: string]: BlockMesh} = {};

export function createBlock(block: Block): BlockMesh {
  if (block.blockName in cache) return cache[block.blockName];

  let mesh;

  if (block.blockName.includes("Road")) mesh = createRoad(block);
  else if (block.blockName.startsWith("Deco")) mesh = createDeco(block.blockName);
  else if (block.blockName.startsWith("Platform")) mesh = createPlatform(block);
  else mesh = createDeco(block.blockName);

  cache[block.blockName] = mesh;

  return mesh;
  
  //throw new Error("Unknown block type: " + name);
}

export function createAnchoredObject(object: CGameCtnAnchoredObject, map: CGameCtnChallenge): BlockMesh {
  if (object.itemModel[0] in cache) return cache[object.itemModel[0]];
  
  if (!map.embeddedData) return createDeco("");
  
  const item = Object.values(map.embeddedData).find((item) => item.body.info[0] === object.itemModel[0]);

  if (item) {
    const crystal = item.body.entityModelEdition.meshCrystal;
    const mesh = createCrystal(crystal);
    cache[object.itemModel[0]] = mesh;
    return mesh;
  }

  return createDeco("");
}